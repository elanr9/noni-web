"use client";

import { ExternalLink, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  getCompanyResearch,
  getReferenceLearning,
  startCompanyResearch,
  studyAllReferences,
} from "@/app/admin/brain/research-actions";
import { Card, Chip, Label, Pill, Tabs } from "@/components/kit";
import {
  RESEARCH_STALE_MS,
  type CompanyResearch,
  type IndustryPlaybook,
  type ReferenceLearning,
} from "@/lib/admin/research";

/* Company Brain: the industry deep dive (research-company) and what the
   writer learned from Library references (study-reference). Both poll while
   their edge function works in the background. */

const POLL_MS = 4000;

const TABS = [
  "Overview",
  "Audience",
  "Calendar",
  "Insider facts",
  "Problems",
  "Myths",
  "Vocabulary",
  "Post ideas",
  "Sources",
] as const;
type Tab = (typeof TABS)[number];

function isLive(r: CompanyResearch | null): boolean {
  if (r?.status !== "running") return false;
  const started = r.started_at ? Date.parse(r.started_at) : 0;
  return Date.now() - started < RESEARCH_STALE_MS;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-line px-5 py-3">{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[13.5px] font-bold leading-[1.45] text-ink">{children}</p>;
}

function Body({ children, quiet = false }: { children: React.ReactNode; quiet?: boolean }) {
  return (
    <p
      className={`m-0 mt-1 text-[13px] font-semibold leading-[1.55] ${
        quiet ? "text-slate-400" : "text-slate-500"
      }`}
    >
      {children}
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
      {children}
    </p>
  );
}

function PlaybookTab({
  tab,
  research,
  playbook,
}: {
  tab: Tab;
  research: CompanyResearch;
  playbook: IndustryPlaybook;
}) {
  const profile = research.profile;
  switch (tab) {
    case "Overview":
      return (
        <>
          <Row>
            {profile ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Chip tone="blue">{profile.industry}</Chip>
                <Chip tone="slate">{profile.niche}</Chip>
              </div>
            ) : null}
            {profile?.one_liner ? <Title>{profile.one_liner}</Title> : null}
            <Body>{playbook.market.summary}</Body>
          </Row>
          {playbook.market.trends.length ? (
            <Row>
              <Label>Trends</Label>
              <ul className="m-0 mt-1.5 list-disc pl-5">
                {playbook.market.trends.map((t) => (
                  <li key={t} className="text-[13px] font-semibold leading-[1.55] text-slate-500">
                    {t}
                  </li>
                ))}
              </ul>
            </Row>
          ) : null}
          {playbook.product_fit.length ? (
            <Row>
              <Label>Where {profile?.product_name || "the product"} fits</Label>
              {playbook.product_fit.map((f) => (
                <div key={f.problem} className="mt-2">
                  <Title>{f.problem}</Title>
                  <Body>{f.how_the_product_helps}</Body>
                </div>
              ))}
            </Row>
          ) : null}
          {playbook.never_say.length ? (
            <Row>
              <Label>Never say</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {playbook.never_say.map((n) => (
                  <Chip key={n} tone="amber" className="whitespace-normal text-left">
                    {n}
                  </Chip>
                ))}
              </div>
            </Row>
          ) : null}
        </>
      );
    case "Audience":
      return playbook.audience.length ? (
        <>
          {playbook.audience.map((a) => (
            <Row key={a.who}>
              <Title>{a.who}</Title>
              <Body>{a.moment}</Body>
              {a.fears?.length ? <Body quiet>Worried about: {a.fears.join(" · ")}</Body> : null}
              {a.their_words?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.their_words.map((w) => (
                    <Chip key={w} tone="slate" className="whitespace-normal text-left">
                      &ldquo;{w}&rdquo;
                    </Chip>
                  ))}
                </div>
              ) : null}
            </Row>
          ))}
        </>
      ) : (
        <Empty>No audience notes yet.</Empty>
      );
    case "Calendar":
      return playbook.calendar.length ? (
        <>
          {playbook.calendar.map((c) => (
            <Row key={`${c.when}-${c.what}`}>
              <div className="flex items-start gap-3">
                <span className="w-[120px] shrink-0 text-[12.5px] font-bold text-blue-700">
                  {c.when}
                </span>
                <span className="min-w-0 flex-1">
                  <Title>{c.what}</Title>
                  <Body quiet>{c.why_it_matters}</Body>
                </span>
              </div>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No key dates found.</Empty>
      );
    case "Insider facts":
      return playbook.insider_facts.length ? (
        <>
          {playbook.insider_facts.map((f) => (
            <Row key={f.fact}>
              <div className="flex items-start gap-3">
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-[1.5] text-ink">
                  {f.fact}
                </span>
                {f.source_url ? (
                  <a
                    href={f.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-blue-700 no-underline hover:underline"
                  >
                    {hostOf(f.source_url)}
                    <ExternalLink size={11} />
                  </a>
                ) : null}
              </div>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No insider facts found.</Empty>
      );
    case "Problems":
      return playbook.problems.length ? (
        <>
          {playbook.problems.map((p) => (
            <Row key={p.problem}>
              <Title>{p.problem}</Title>
              {p.in_their_words ? <Body>&ldquo;{p.in_their_words}&rdquo;</Body> : null}
              <Body quiet>Today: {p.how_it_is_solved_today}</Body>
              <Body quiet>Getting it wrong costs: {p.cost_of_getting_it_wrong}</Body>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No problems listed.</Empty>
      );
    case "Myths":
      return playbook.myths.length ? (
        <>
          {playbook.myths.map((m) => (
            <Row key={m.myth}>
              <p className="m-0 text-[13px] font-bold leading-[1.45] text-slate-400 line-through">
                {m.myth}
              </p>
              <Body>{m.truth}</Body>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No myths listed.</Empty>
      );
    case "Vocabulary":
      return playbook.vocabulary.length ? (
        <div className="grid grid-cols-2 gap-x-6 border-t border-line px-5 py-2">
          {playbook.vocabulary.map((v) => (
            <div key={v.term} className="py-2">
              <Title>{v.term}</Title>
              <Body quiet>{v.meaning}</Body>
            </div>
          ))}
        </div>
      ) : (
        <Empty>No vocabulary listed.</Empty>
      );
    case "Post ideas":
      return playbook.content_angles.length ? (
        <>
          {playbook.content_angles.map((a) => (
            <Row key={a.title}>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1">
                  <Title>{a.title}</Title>
                </span>
                <Chip tone="slate">
                  <Search size={11} />
                  {a.search_phrase}
                </Chip>
              </div>
              <Body>Hook: {a.hook}</Body>
              <Body quiet>{a.why}</Body>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No post ideas yet.</Empty>
      );
    case "Sources":
      return research.sources.length ? (
        <>
          {research.sources.map((s) => (
            <Row key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-700 no-underline hover:underline"
              >
                {s.title || hostOf(s.url)}
                <ExternalLink size={11} />
              </a>
              <Body quiet>{hostOf(s.url)}</Body>
            </Row>
          ))}
        </>
      ) : (
        <Empty>No sources recorded.</Empty>
      );
  }
}

export function IndustryResearchCard({
  defaultWebsite,
  initial,
}: {
  defaultWebsite: string;
  initial: CompanyResearch | null;
}) {
  const [research, setResearch] = useState<CompanyResearch | null>(initial);
  const [website, setWebsite] = useState(defaultWebsite || initial?.website || "");
  const [tab, setTab] = useState<Tab>("Overview");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const result = await getCompanyResearch();
    if (result.ok) setResearch(result.research);
    else setError(result.error);
  }, []);

  const live = isLive(research);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [live, refresh]);

  const start = (force: boolean) => {
    if (!website.trim()) {
      setError("Add your website first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await startCompanyResearch({ website, force });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResearch(result.research);
    });
  };

  const done = research?.status === "done" && research.playbook;

  return (
    <Card pad={0} className="mt-3.5">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex-1">
          <Label>Industry research</Label>
          <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
            Noni reads your website, researches your industry, and writes every post like an
            insider from it.
          </span>
        </span>
        {done && !live ? (
          <Pill
            size="sm"
            variant="tint"
            icon={RefreshCw}
            disabled={pending}
            onClick={() => start(true)}
          >
            Research again
          </Pill>
        ) : null}
      </div>

      {live ? (
        <div className="flex items-center gap-2.5 border-t border-line px-5 py-4">
          <Loader2 size={15} className="animate-spin text-blue-700" />
          <span className="text-[13.5px] font-bold text-ink">
            {research?.stage || "Researching"}…
          </span>
          <span className="text-[13px] font-semibold text-slate-400">
            Takes 2 to 4 minutes. You can leave this page.
          </span>
        </div>
      ) : !done ? (
        <div className="flex items-center gap-2.5 border-t border-line px-5 py-4">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") start(false);
            }}
            placeholder="www.yourcompany.com"
            className="h-10 min-w-0 flex-1 border border-line bg-white px-3.5 text-[14px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-300"
          />
          <Pill icon={Sparkles} disabled={pending} onClick={() => start(false)}>
            Run deep dive
          </Pill>
        </div>
      ) : null}

      {research?.status === "failed" && !live ? (
        <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
          The last run failed: {research.error ?? "unknown error"}. Try again.
        </p>
      ) : null}
      {error ? (
        <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {done && research?.playbook ? (
        <>
          <div className="overflow-x-auto border-t border-line px-3 pt-3">
            <Tabs tabs={TABS} active={tab} onSelect={setTab} className="mb-3" />
          </div>
          <PlaybookTab tab={tab} research={research} playbook={research.playbook} />
          {research.finished_at ? (
            <p className="m-0 border-t border-line px-5 py-2.5 text-[12px] font-semibold text-slate-400">
              Researched {new Date(research.finished_at).toLocaleDateString()} from{" "}
              {research.website ? hostOf(research.website) : "your site"} and{" "}
              {research.sources.length} sources.
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

/* Headings and bullets are the only markdown the playbook uses. */
function PlaybookText({ text }: { text: string }) {
  return (
    <div className="px-5 py-3">
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith("## ")) {
          return (
            <p key={i} className="m-0 mt-3 text-[13.5px] font-bold text-ink first:mt-0">
              {t.slice(3)}
            </p>
          );
        }
        if (t.startsWith("# ")) {
          return (
            <p key={i} className="m-0 text-[14px] font-bold text-ink">
              {t.slice(2)}
            </p>
          );
        }
        const bullet = /^[-*] /.test(t);
        return (
          <p
            key={i}
            className={`m-0 text-[13px] font-semibold leading-[1.55] text-slate-500 ${
              bullet ? "pl-4 -indent-3" : ""
            }`}
          >
            {bullet ? `• ${t.slice(2)}` : t.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}

export function ReferenceLearningCard({ initial }: { initial: ReferenceLearning | null }) {
  const [learning, setLearning] = useState<ReferenceLearning | null>(initial);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedAt, setQueuedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const result = await getReferenceLearning();
    if (result.ok) setLearning(result.learning);
    else setError(result.error);
  }, []);

  // Poll for a few minutes after a study is queued.
  useEffect(() => {
    if (queuedAt === null) return;
    const id = setInterval(() => {
      if (Date.now() - queuedAt > 5 * 60 * 1000) {
        setQueuedAt(null);
        return;
      }
      void refresh();
    }, POLL_MS * 2);
    return () => clearInterval(id);
  }, [queuedAt, refresh]);

  const studied = (learning?.studies ?? []).filter((s) => s.status === "done" && s.pattern);
  const unstudied = Math.max(0, (learning?.referenceCount ?? 0) - studied.length);

  const studyAll = () => {
    setError(null);
    startTransition(async () => {
      const result = await studyAllReferences();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setQueuedAt(Date.now());
    });
  };

  return (
    <Card pad={0} className="mt-3.5">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex-1">
          <Label>Learned from your references</Label>
          <span className="mt-[3px] block text-[13px] font-semibold text-slate-400">
            Every TikTok or Instagram post you add to the Library is broken down once, and the
            writer copies how the winners are built.
          </span>
        </span>
        {queuedAt !== null ? (
          <Chip tone="blue">
            <Loader2 size={11} className="animate-spin" />
            Studying
          </Chip>
        ) : (
          <Pill
            size="sm"
            variant="tint"
            icon={Sparkles}
            disabled={pending}
            onClick={studyAll}
          >
            {unstudied > 0 ? `Study ${unstudied} new` : "Rebuild playbook"}
          </Pill>
        )}
      </div>
      {error ? (
        <p className="m-0 border-t border-line px-5 py-3 text-[13px] font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {learning && studied.length === 0 ? (
        <Empty>
          Nothing studied yet. Add reference posts in the Library, or study the ones already
          there.
        </Empty>
      ) : null}

      {studied.slice(0, 8).map((s) => (
        <Row key={s.id}>
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-bold text-ink">
              {s.pattern!.topic}
            </span>
            <Chip tone={s.pattern!.quality >= 4 ? "green" : "slate"}>
              {s.pattern!.quality}/5
            </Chip>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-slate-400 hover:text-blue-700"
              aria-label="Open the post"
            >
              <ExternalLink size={13} />
            </a>
          </div>
          {s.pattern!.hook_on_screen || s.pattern!.hook_spoken ? (
            <Body>&ldquo;{s.pattern!.hook_on_screen || s.pattern!.hook_spoken}&rdquo;</Body>
          ) : null}
          <Body quiet>{s.pattern!.why_it_works}</Body>
        </Row>
      ))}

      {learning?.playbook ? (
        <div className="border-t border-line">
          <button
            type="button"
            onClick={() => setShowPlaybook((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-5 py-3 text-left text-[13px] font-bold text-blue-700"
          >
            {showPlaybook ? "Hide" : "Show"} the playbook the writer reads
          </button>
          {showPlaybook ? <PlaybookText text={learning.playbook} /> : null}
        </div>
      ) : null}
    </Card>
  );
}
