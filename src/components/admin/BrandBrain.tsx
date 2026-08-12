"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  saveBrandDoc,
  saveBrandProfile,
  type BrandDocKind,
} from "@/app/admin/brand/actions";

export type BrandProfileData = {
  tone: string;
  audience: string;
  hashtagBank: string[];
  bannedPhrases: string[];
};

export type BrandDocData = {
  kind: BrandDocKind;
  content: string;
  updated_at: string | null;
};

const DOCS: Array<{ kind: BrandDocKind; label: string; hint: string }> = [
  {
    kind: "product_truth",
    label: "Product",
    hint: "What the product does, who pays, killer features, natural plug angles, banned claims.",
  },
  {
    kind: "audience_niche",
    label: "Audience",
    hint: "Who the audience is, their pains and dreams, niche boundaries, accounts they follow, their language.",
  },
  {
    kind: "voice",
    label: "Voice",
    hint: "How posts sound: pacing, phrases the brand leans on, phrases it never says.",
  },
  {
    kind: "learnings",
    label: "Learnings",
    hint: "What performed and why. The generator reads this before writing anything new.",
  },
];

function wordCount(content: string): number {
  const trimmed = content.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function linesToList(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none ring-accent/30 focus:ring-4 read-only:bg-soft read-only:text-muted";
const labelClass = "block text-sm font-semibold text-ink";
const hintClass = "mt-0.5 text-[13px] text-muted";

function DocEditor({
  doc,
  saved,
  canEdit,
}: {
  doc: (typeof DOCS)[number];
  saved: BrandDocData | undefined;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(saved?.content ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const savedContent = saved?.content ?? "";
  const dirty = content !== savedContent;
  const words = wordCount(savedContent);
  const updatedLabel = saved?.updated_at
    ? `Updated ${new Date(saved.updated_at).toLocaleDateString()}`
    : "Not written yet";

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveBrandDoc(doc.kind, content);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-[24px] border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <div className="text-[15px] font-bold text-ink">{doc.label}</div>
          <div className="text-[13px] text-muted">
            {words > 0 ? `${words} words · ${updatedLabel}` : updatedLabel}
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-line px-5 py-4">
          <p className="text-[13px] text-muted">{doc.hint}</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={!canEdit}
            rows={10}
            placeholder="Write the doc. Every future scrape and draft reads this."
            className={fieldClass}
          />
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              disabled={!dirty || pending}
              onClick={save}
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function BrandBrain({
  profile,
  docs,
  canEdit,
}: {
  profile: BrandProfileData;
  docs: BrandDocData[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [tone, setTone] = useState(profile.tone);
  const [audience, setAudience] = useState(profile.audience);
  const [hashtags, setHashtags] = useState(profile.hashtagBank.join("\n"));
  const [banned, setBanned] = useState(profile.bannedPhrases.join("\n"));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function saveProfile() {
    setError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await saveBrandProfile({
        tone,
        audience,
        hashtag_bank: linesToList(hashtags),
        banned_phrases: linesToList(banned),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <div className="mt-8 max-w-2xl space-y-8">
      {!canEdit ? (
        <p className="rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-muted">
          You can view the brand brain, but your account does not have the
          manage brand permission, so editing is disabled.
        </p>
      ) : null}

      <section className="space-y-4 rounded-[24px] border border-line bg-white p-6">
        <h2 className="display text-xl font-semibold text-ink">Brand profile</h2>

        <div>
          <label htmlFor="brand-tone" className={labelClass}>
            Tone
          </label>
          <p className={hintClass}>How the brand sounds in captions and scripts.</p>
          <textarea
            id="brand-tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            readOnly={!canEdit}
            rows={3}
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="brand-audience" className={labelClass}>
            Audience
          </label>
          <p className={hintClass}>Who the content is for.</p>
          <textarea
            id="brand-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            readOnly={!canEdit}
            rows={3}
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="brand-hashtags" className={labelClass}>
            Hashtag bank
          </label>
          <p className={hintClass}>One hashtag per line, with or without the #.</p>
          <textarea
            id="brand-hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            readOnly={!canEdit}
            rows={4}
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="brand-banned" className={labelClass}>
            Banned phrases
          </label>
          <p className={hintClass}>One phrase per line. Drafts never use these.</p>
          <textarea
            id="brand-banned"
            value={banned}
            onChange={(e) => setBanned(e.target.value)}
            readOnly={!canEdit}
            rows={4}
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {canEdit ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={saveProfile}
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save profile"}
            </button>
            {savedAt !== null ? (
              <span className="text-sm font-semibold text-muted">Saved.</span>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="display text-xl font-semibold text-ink">Brand docs</h2>
        <p className="text-[14px] text-muted">
          The doctrine the generator writes against. Anything here changes what
          gets scraped, what passes the gate, and how drafts are written.
        </p>
        {DOCS.map((doc) => (
          <DocEditor
            key={doc.kind}
            doc={doc}
            saved={docs.find((d) => d.kind === doc.kind)}
            canEdit={canEdit}
          />
        ))}
      </section>
    </div>
  );
}
