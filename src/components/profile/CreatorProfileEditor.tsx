"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";

import { saveProfile } from "@/app/profile/actions";
import {
  COUNTRIES,
  GENDERS,
  LANGUAGES,
  MAX_LANGUAGES,
  MAX_NICHES,
  MAX_VIDEOS,
  NICHES,
  ageFromBirthYear,
  birthYearFromAge,
  cleanHandle,
  isLink,
  type CreatorProfile,
  type Gender,
} from "@/lib/creator-profile";

export type Tab = "You" | "Languages" | "Interests" | "Socials" | "Videos";
const TABS: Tab[] = ["You", "Languages", "Interests", "Socials", "Videos"];

const digits = (v: string) => v.replace(/[^0-9]/g, "");

/* The creator profile on the website. Five tabs so nothing scrolls; one
   Save for all of it. The app's Profile tab is the same thing. */
export function CreatorProfileEditor({ initial, name, photo, startTab = "You" }: { initial: CreatorProfile; name: string; photo: string | null; startTab?: Tab }) {
  const startAge = ageFromBirthYear(initial.birth_year);
  const known = COUNTRIES.some((c) => c.key === initial.country);

  const [tab, setTab] = useState<Tab>(startTab);
  const [age, setAge] = useState(startAge ? String(startAge) : "");
  const [gender, setGender] = useState<Gender | null>(initial.gender);
  const [country, setCountry] = useState(known ? initial.country ?? "" : initial.country ? "other" : "");
  const [otherCountry, setOtherCountry] = useState(known ? "" : initial.country ?? "");
  const [city, setCity] = useState(initial.location ?? "");
  const [languages, setLanguages] = useState<string[]>(initial.languages);
  const [niches, setNiches] = useState<string[]>(initial.niches.slice(0, MAX_NICHES));
  const [socials, setSocials] = useState({
    tiktok: initial.tiktok ?? "",
    tiktok_followers: initial.tiktok_followers != null ? String(initial.tiktok_followers) : "",
    instagram: initial.instagram ?? "",
    instagram_followers: initial.instagram_followers != null ? String(initial.instagram_followers) : "",
    youtube: initial.youtube ?? "",
    youtube_followers: initial.youtube_followers != null ? String(initial.youtube_followers) : "",
  });
  const [videos, setVideos] = useState<string[]>(() => {
    const v = initial.portfolio.map((p) => p.url).slice(0, MAX_VIDEOS);
    while (v.length < MAX_VIDEOS) v.push("");
    return v;
  });
  const [listed, setListed] = useState(initial.listed);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const touched = () => {
    setSaved(false);
    setError(null);
  };

  const ageNum = age ? Number(age) : null;
  const ageBad = ageNum !== null && (ageNum < 13 || ageNum > 100);
  const badVideo = videos.some((v) => v.trim() !== "" && !isLink(v));

  const save = () => {
    if (ageBad) {
      setTab("You");
      setError("Check your age");
      return;
    }
    if (badVideo) {
      setTab("Videos");
      setError("Paste a full link");
      return;
    }
    const num = (v: string) => (v ? Number(v) : null);
    start(async () => {
      const res = await saveProfile({
        birth_year: ageNum !== null ? birthYearFromAge(ageNum) : null,
        gender,
        country: country === "other" ? otherCountry.trim() || null : country || null,
        location: city.trim() || null,
        languages,
        niches,
        tiktok: cleanHandle(socials.tiktok) || null,
        tiktok_followers: num(socials.tiktok_followers),
        instagram: cleanHandle(socials.instagram) || null,
        instagram_followers: num(socials.instagram_followers),
        youtube: cleanHandle(socials.youtube) || null,
        youtube_followers: num(socials.youtube_followers),
        portfolio: videos.map((u) => u.trim()).filter(isLink).map((url) => ({ url })),
        listed,
      });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  };

  const toggle = (list: string[], set: (v: string[]) => void, key: string, max: number) => {
    if (list.includes(key)) set(list.filter((x) => x !== key));
    else if (list.length < max) set([...list, key]);
    else return;
    touched();
  };

  const counts: Partial<Record<Tab, number>> = { Languages: languages.length, Interests: niches.length };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex items-center gap-[9px] px-5 py-4 sm:px-7">
        <Link href="/" className="flex items-center gap-[9px] no-underline">
          <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
          <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4 pb-10 sm:px-5">
        <div className="mb-5 flex items-center gap-4">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[22px] font-bold text-blue-700">
              {(name || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="m-0 text-[28px] font-bold leading-[1.1] tracking-[-0.7px] text-ink">Profile</h1>
            {name ? <p className="m-0 mt-1 truncate text-[15px] font-semibold text-slate-500">{name}</p> : null}
          </div>
        </div>

        <nav className="mb-5 flex gap-0 overflow-x-auto sm:gap-1 border-b border-line" role="tablist">
          {TABS.map((t) => {
            const on = t === tab;
            const n = counts[t];
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t)}
                className={`relative -mb-px flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 border-b-[3px] bg-transparent px-2 pb-3 pt-1 text-[14px] sm:px-3 sm:text-[15px] transition-colors duration-[160ms] ease-om ${
                  on ? "border-blue-500 font-bold text-blue-700" : "border-transparent font-semibold text-slate-400 hover:text-ink"
                }`}
              >
                {t}
                {n ? (
                  <span key={n} className={`hidden h-5 min-w-5 animate-om-pop sm:inline-flex items-center justify-center rounded-full px-1.5 text-[12px] font-bold ${on ? "bg-blue-500 text-white" : "bg-fill-quiet text-slate-500"}`}>
                    {n}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <section className="min-h-[420px] rounded-[20px] border border-line bg-white p-5 sm:p-6">
          {tab === "You" ? (
            <div className="flex flex-col gap-5">
              <div className="flex gap-3">
                <Input label="Age" value={age} onChange={(v) => (setAge(digits(v).slice(0, 3)), touched())} placeholder="22" inputMode="numeric" className="w-24" />
                <Input label="City" value={city} onChange={(v) => (setCity(v), touched())} placeholder="Austin" maxLength={80} className="flex-1" />
              </div>
              <Group label="Country">
                {[...COUNTRIES, { key: "other", label: "Other" }].map((c) => (
                  <Chip key={c.key} on={country === c.key} onClick={() => (setCountry(country === c.key ? "" : c.key), touched())}>
                    {c.label}
                  </Chip>
                ))}
              </Group>
              {country === "other" ? (
                <Input label="" value={otherCountry} onChange={(v) => (setOtherCountry(v), touched())} placeholder="Your country" maxLength={60} />
              ) : null}
              <Group label="Gender">
                {GENDERS.map((g) => (
                  <Chip key={g.key} on={gender === g.key} onClick={() => (setGender(gender === g.key ? null : g.key), touched())}>
                    {g.label}
                  </Chip>
                ))}
              </Group>
              <label className="flex cursor-pointer items-center justify-between rounded-[14px] bg-fill-quiet px-4 py-3.5">
                <span className="text-[15px] font-semibold text-ink">Show me to brands</span>
                <Switch on={listed} onChange={(v) => (setListed(v), touched())} />
              </label>
            </div>
          ) : null}

          {tab === "Languages" ? (
            <Picker
              count={languages.length}
              max={MAX_LANGUAGES}
              options={LANGUAGES}
              value={languages}
              onToggle={(k) => toggle(languages, setLanguages, k, MAX_LANGUAGES)}
            />
          ) : null}

          {tab === "Interests" ? (
            <Picker count={niches.length} max={MAX_NICHES} options={NICHES} value={niches} onToggle={(k) => toggle(niches, setNiches, k, MAX_NICHES)} />
          ) : null}

          {tab === "Socials" ? (
            <div className="flex flex-col gap-3">
              {(
                [
                  { key: "tiktok", name: "TikTok", mark: <TikTokMark />, tile: "bg-black text-white" },
                  { key: "instagram", name: "Instagram", mark: <InstagramMark />, tile: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white" },
                  { key: "youtube", name: "YouTube", mark: <YouTubeMark />, tile: "bg-[#ff0000] text-white" },
                ] as const
              ).map((p) => {
                const h = socials[p.key];
                const f = socials[`${p.key}_followers`];
                return (
                  <div key={p.key} className="flex flex-wrap items-center gap-3 rounded-[16px] border border-line p-3 sm:flex-nowrap">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${p.tile}`}>{p.mark}</span>
                    <span className="flex-1 text-[15px] font-bold text-ink sm:w-24 sm:flex-none">{p.name}</span>
                    <span className="flex w-5 justify-center sm:order-last">{h.trim() ? <CheckCircle2 size={20} className="animate-om-check text-green" /> : null}</span>
                    <div className="flex w-full gap-2 sm:w-auto sm:flex-1">
                      <input
                        value={h}
                        onChange={(e) => (setSocials((s) => ({ ...s, [p.key]: e.target.value })), touched())}
                        placeholder="@handle"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="h-11 min-w-0 flex-1 rounded-[12px] border-0 bg-fill-quiet px-3 text-[15px] text-ink outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-blue-200"
                      />
                      <input
                        value={f}
                        onChange={(e) => (setSocials((s) => ({ ...s, [`${p.key}_followers`]: digits(e.target.value).slice(0, 9) })), touched())}
                        placeholder="Followers"
                        inputMode="numeric"
                        className="h-11 w-28 rounded-[12px] border-0 bg-fill-quiet px-3 text-[15px] text-ink outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {tab === "Videos" ? (
            <div className="flex flex-col gap-4">
              {videos.map((v, i) => (
                <div key={i} className="relative">
                  <Input
                    label={`Video ${i + 1}`}
                    value={v}
                    onChange={(next) => (setVideos((cur) => cur.map((x, j) => (j === i ? next.trim() : x))), touched())}
                    placeholder="https://www.tiktok.com/@you/video/..."
                    type="url"
                    padRight
                  />
                  {v && isLink(v) ? <CheckCircle2 size={20} className="absolute bottom-3 right-3 animate-om-check text-green" /> : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 px-8 text-[16px] font-bold text-white transition-all duration-[160ms] ease-om active:scale-[0.97] disabled:opacity-60 ${
              saved ? "bg-green" : "bg-blue-500 shadow-accent hover:-translate-y-px hover:bg-blue-400"
            }`}
          >
            {saved ? <Check key="saved" size={18} strokeWidth={3} className="animate-om-check" /> : null}
            {busy ? "Saving" : saved ? "Saved" : "Save"}
          </button>
          {error ? <span className="text-[14px] font-semibold text-danger">{error}</span> : null}
        </div>
      </main>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  padRight,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: "numeric";
  maxLength?: number;
  type?: "url";
  padRight?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-[7px] ${className}`}>
      {label ? <span className="text-[13px] font-semibold text-slate-500">{label}</span> : null}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`h-12 w-full rounded-[14px] border border-line bg-white px-4 text-[15px] ${padRight ? "pr-11" : ""} text-ink outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100`}
      />
    </label>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[9px]">
      <span className="text-[13px] font-semibold text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children, dim }: { on: boolean; onClick: () => void; children: ReactNode; dim?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-10 cursor-pointer rounded-full border px-4 text-[14.5px] font-semibold transition-all duration-[160ms] ease-om active:scale-95 ${
        on
          ? "animate-om-pop border-blue-500 bg-blue-500 text-white"
          : `border-line bg-white text-ink hover:-translate-y-px hover:border-blue-300 ${dim ? "opacity-40" : ""}`
      }`}
    >
      {children}
    </button>
  );
}

function Picker({
  count,
  max,
  options,
  value,
  onToggle,
}: {
  count: number;
  max: number;
  options: readonly { key: string; label: string }[];
  value: string[];
  onToggle: (key: string) => void;
}) {
  const full = count >= max;
  return (
    <div className="flex flex-col gap-4">
      <span className={`text-[13px] font-semibold ${full ? "text-blue-700" : "text-slate-500"}`}>{`${count} of ${max}`}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.key);
          return (
            <Chip key={o.key} on={on} dim={full && !on} onClick={() => onToggle(o.key)}>
              {o.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-[30px] w-[50px] cursor-pointer rounded-full border-0 transition-colors duration-[200ms] ease-om ${on ? "bg-blue-500" : "bg-slate-300"}`}
    >
      <span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-all duration-[220ms] ease-om-spring ${on ? "left-[23px]" : "left-[3px]"}`} />
    </button>
  );
}

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
      />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M9 7.5v9l7.5-4.5z" />
    </svg>
  );
}
