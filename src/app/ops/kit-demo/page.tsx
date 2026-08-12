"use client";

import {
  ArrowRight,
  ChevronRight,
  Play,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  AreaChart,
  Avatar,
  BarRow,
  Card,
  Chip,
  Field,
  FiltersDropdown,
  HoverPeek,
  Label,
  Modal,
  MonthCal,
  PageHead,
  Pill,
  SortDropdown,
  Tabs,
} from "@/components/kit";
import {
  COMPANY_DAYS,
  fmtK,
  money,
  SEED_COMPANIES,
  SEED_PEOPLE,
  SEED_POSTS,
  statusTone,
} from "@/lib/ops/mock-data";

const TEAM_TABS = ["Admins", "Creators", "Campaign Managers"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <Label className="mb-3.5 block">{title}</Label>
      {children}
    </section>
  );
}

export default function KitDemoPage() {
  const [tab, setTab] = useState<(typeof TEAM_TABS)[number]>("Admins");
  const [sort, setSort] = useState("Views");
  const [range, setRange] = useState("Last 7 days");
  const [formatF, setFormatF] = useState("All formats");
  const [creatorF, setCreatorF] = useState("All creators");
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [modal, setModal] = useState<"titled" | "untitled" | null>(null);
  const [calDay, setCalDay] = useState<number | null>(null);

  const c1 = SEED_COMPANIES[0];
  const creators = SEED_PEOPLE.filter(
    (p) => p.role === "Creator" && (p.viewsN ?? 0) > 0,
  ).sort((a, b) => (b.viewsN ?? 0) - (a.viewsN ?? 0));
  const maxCr = Math.max(...creators.map((p) => Math.round((p.viewsN ?? 0) / 1000)));
  const dayData = calDay ? COMPANY_DAYS.c1[calDay] : null;
  const post = SEED_POSTS[0];

  return (
    <div>
      <PageHead
        title="Kit demo"
        sub="Every kit component in its states. Reference surface for agents and QA, matched against OpsConsole.html."
        right={<Chip tone="blue">Internal</Chip>}
        onBack={() => window.history.back()}
      />

      <Section title="Pills">
        <Card>
          <div className="flex flex-wrap items-center gap-2.5">
            <Pill icon={Send}>Send invite</Pill>
            <Pill variant="tint" icon={ArrowRight}>View company</Pill>
            <Pill variant="quiet">Cancel</Pill>
            <Pill variant="danger" icon={Trash2}>Remove company</Pill>
            <Pill variant="ghost">Skip for now</Pill>
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <Pill size="sm" icon={Plus}>New company</Pill>
            <Pill size="sm" variant="tint">Resend invite</Pill>
            <Pill size="sm" variant="quiet">Mute</Pill>
            <Pill size="sm" variant="danger">Remove</Pill>
            <Pill icon={Send} disabled>Send invite</Pill>
          </div>
        </Card>
      </Section>

      <Section title="Chips">
        <Card>
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip tone="blue">Company admin</Chip>
            <Chip tone="green">Active</Chip>
            <Chip tone="amber">Invite pending</Chip>
            <Chip tone="slate">Archived</Chip>
            <Chip tone={statusTone("Onboarded")}>Onboarded</Chip>
            <Chip tone={statusTone("Expired")}>Expired</Chip>
          </div>
        </Card>
      </Section>

      <Section title="Avatars">
        <Card>
          <div className="flex items-center gap-3.5">
            <Avatar name="Maya Reyes" size={24} />
            <Avatar name="Jordan Tate" />
            <Avatar name="Dana Whitfield" size={38} />
            <Avatar name="Elan Rosen" size={46} />
            <Avatar name="Founders" size={52} />
            <Avatar name={null} size={34} />
          </div>
        </Card>
      </Section>

      <Section title="Tabs with sort dropdown">
        <Card>
          <Tabs
            tabs={TEAM_TABS}
            active={tab}
            onSelect={(t) => {
              setTab(t);
              setSort(t === "Creators" ? "Views" : "Name");
            }}
            right={
              <SortDropdown
                options={tab === "Creators" ? ["Views", "Posts", "Name"] : ["Name"]}
                value={sort}
                onSelect={setSort}
              />
            }
          />
          <p className="m-0 text-[13.5px] font-semibold text-slate-400">
            Showing {tab.toLowerCase()} sorted by {sort.toLowerCase()}.
          </p>
        </Card>
      </Section>

      <Section title="Dropdowns">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <FiltersDropdown
              formatF={formatF}
              creatorF={creatorF}
              creatorNames={creators.map((p) => p.name)}
              onFormat={setFormatF}
              onCreator={setCreatorF}
            />
            <SortDropdown
              prefix="Sort by"
              options={["Views over time", "Top creators", "Top posts", "Formats"]}
              value="Views over time"
              onSelect={() => undefined}
            />
            <span className="flex-1" />
            <SortDropdown
              prefix=""
              options={[
                "Last 24 hours",
                "Last 7 days",
                "Last 2 weeks",
                "Last month",
                "Last 12 weeks",
              ]}
              value={range}
              onSelect={setRange}
            />
          </div>
        </Card>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-2 gap-3.5">
          <Card>
            <span className="text-[15px] font-bold text-ink">Plain card</span>
            <p className="mb-0 mt-2 text-[13.5px] font-semibold leading-relaxed text-slate-500">
              White ground, hairline border, card shadow, radius 16.
            </p>
          </Card>
          <Card lift onClick={() => undefined}>
            <span className="text-[15px] font-bold text-ink">Lift card</span>
            <p className="mb-0 mt-2 text-[13.5px] font-semibold leading-relaxed text-slate-500">
              Hover raises 3px with the raised shadow and a blue hairline.
            </p>
          </Card>
        </div>
        <Card pad={0} className="mt-3.5">
          {creators.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet ${
                i ? "border-t border-line" : ""
              }`}
            >
              <Avatar name={p.name} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold text-ink">{p.name}</span>
                <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                  {p.email}
                </span>
              </span>
              <span className="text-[13px] font-semibold text-slate-400">
                {p.posts} posts · {fmtK(p.viewsN ?? 0)} views
              </span>
              <Chip tone={statusTone(p.status)}>{p.status}</Chip>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Fields">
        <Card className="max-w-[460px]">
          <div className="flex flex-col gap-3.5">
            <Field
              label="Company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Google"
            />
            <Field
              label="Website"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="google.com"
              optional
            />
            <Pill icon={Send} disabled={!name.trim()}>Send invite</Pill>
          </div>
        </Card>
      </Section>

      <Section title="Modals">
        <Card>
          <div className="flex flex-wrap gap-2.5">
            <Pill variant="tint" onClick={() => setModal("titled")}>
              Open titled modal
            </Pill>
            <Pill variant="quiet" onClick={() => setModal("untitled")}>
              Open untitled modal
            </Pill>
          </div>
          <p className="mb-0 mt-3 text-[13px] font-semibold text-slate-400">
            Portaled to document.body, centered on the viewport, closes on Esc and
            backdrop click.
          </p>
        </Card>
      </Section>

      <Section title="Hover peek">
        <div className="grid grid-cols-2 gap-3.5">
          <HoverPeek onClick={() => undefined}>
            <Card>
              <div className="flex items-center gap-3.5">
                <Avatar name="Maya Reyes" size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold text-ink">
                    Maya Reyes
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                    Cursor tooltip says view profile
                  </span>
                </span>
              </div>
            </Card>
          </HoverPeek>
          <HoverPeek label="View post" onClick={() => undefined}>
            <Card className="flex items-center gap-3.5">
              <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                <Play size={15} className="text-blue-700" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                  {post.title}
                </span>
                <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                  {post.creator} · {post.format}
                </span>
              </span>
              <span className="text-[14px] font-bold text-ink">{fmtK(post.viewsN)}</span>
            </Card>
          </HoverPeek>
        </div>
      </Section>

      <Section title="Area chart">
        <Card pad={22}>
          <div className="mb-3 flex items-center gap-2.5">
            <Label className="flex-1">Views</Label>
            <span className="text-[12.5px] font-semibold text-slate-400">{c1.name}</span>
          </div>
          <AreaChart series={c1.series} vb={250} />
        </Card>
        <Card pad={22} className="mt-3.5">
          <Label className="mb-2 block">Empty series</Label>
          <p className="m-0 text-[13.5px] font-semibold text-slate-400">
            Nothing to chart yet.
          </p>
          <AreaChart series={[]} />
        </Card>
      </Section>

      <Section title="Bar rows">
        <Card pad={22}>
          <Label className="mb-4 block">Top creators</Label>
          <div className="flex max-w-[720px] flex-col gap-[15px]">
            {creators.slice(0, 4).map((p) => (
              <BarRow
                key={p.id}
                label={p.name.split(" ")[0]}
                value={Math.round((p.viewsN ?? 0) / 1000)}
                max={maxCr}
                suffix="k"
              />
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Month calendar">
        <Card pad={22}>
          <div className="mb-3 flex items-baseline gap-2.5">
            <Label className="flex-1">Daily activity · August 2026</Label>
            <span className="text-[12px] font-semibold text-slate-400">
              sign-ups · sales · click a day
            </span>
          </div>
          <MonthCal days={COMPANY_DAYS.c1} onPick={setCalDay} />
        </Card>
      </Section>

      {modal === "titled" ? (
        <Modal title="New company" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3.5">
            <Field
              label="Company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Google"
              autoFocus
            />
            <Field
              label="Website"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="google.com"
              optional
            />
            <Pill icon={Send} disabled={!name.trim()} onClick={() => setModal(null)}>
              Send invite
            </Pill>
          </div>
        </Modal>
      ) : null}

      {modal === "untitled" ? (
        <Modal onClose={() => setModal(null)}>
          <div className="flex items-center gap-3.5 pr-10">
            <Avatar name="Maya Reyes" size={52} />
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-bold tracking-[-0.3px] text-ink">
                Maya Reyes
              </span>
              <span className="mt-1 flex items-center gap-1.5">
                <Chip tone="slate">Creator</Chip>
                <Chip tone="green">Onboarded</Chip>
              </span>
            </span>
          </div>
          <p className="mb-0 mt-3.5 text-[13.5px] font-semibold leading-relaxed text-slate-500">
            Untitled modals float the close button over the content, matching the
            profile modal in the prototype.
          </p>
        </Modal>
      ) : null}

      {calDay && dayData ? (
        <Modal title={"August " + calDay + " · " + c1.name} onClose={() => setCalDay(null)}>
          <div className="flex gap-3.5 border-b border-line pb-4">
            {(
              [
                ["Sales", money(dayData.sales)],
                ["Sign-ups", String(dayData.signups)],
                ["Downloads", String(dayData.downloads)],
              ] as const
            ).map(([l, v]) => (
              <span key={l} className="flex-1">
                <span className="block text-[12px] font-semibold text-slate-400">{l}</span>
                <span className="mt-1 block text-[22px] font-bold tracking-[-0.4px] text-ink">
                  {v}
                </span>
              </span>
            ))}
          </div>
          <p className="mb-0 mt-4 text-[13.5px] font-semibold text-slate-400">
            Day modals list that day&rsquo;s posts here.
          </p>
        </Modal>
      ) : null}
    </div>
  );
}
