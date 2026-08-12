"use client";

import { Search, type LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Label } from "./Label";

export interface CommandItem {
  id: string;
  /** Result group, rendered in first-seen order, e.g. "Go to", "Companies". */
  section: string;
  icon: LucideIcon;
  title: string;
  meta?: string;
}

export interface CommandSearchProps<T extends CommandItem> {
  index: readonly T[];
  onSelect: (item: T) => void;
  placeholder?: string;
  /** Section shown when the query is empty, default "Go to". */
  defaultSection?: string;
}

function Hi({ text, q }: { text: string; q: string }): ReactNode {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return text;
  return (
    <span>
      {text.slice(0, i)}
      <span className="bg-blue-100 rounded-[3px] py-px">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </span>
  );
}

/* Stripe-style command bar: ⌘K / Ctrl+K or "/" (outside inputs) to focus,
   grouped results with match highlighting, arrow-key navigation, Enter
   selects the highlighted hit (top hit by default), Esc closes. */
export function CommandSearch<T extends CommandItem>({
  index,
  onSelect,
  placeholder = "Search or jump to…",
  defaultSection = "Go to",
}: CommandSearchProps<T>) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        /^(INPUT|TEXTAREA)$/.test(el?.tagName ?? "") ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const out = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("mousedown", out);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("mousedown", out);
    };
  }, []);

  const ql = q.trim().toLowerCase();
  const hits = useMemo(
    () =>
      index.filter((it) =>
        !ql
          ? it.section === defaultSection
          : `${it.title} ${it.meta ?? ""}`.toLowerCase().includes(ql),
      ),
    [index, ql, defaultSection],
  );

  const sections = useMemo(() => {
    const out: Array<{ label: string; items: T[] }> = [];
    hits.forEach((it) => {
      let s = out.find((x) => x.label === it.section);
      if (!s) {
        s = { label: it.section, items: [] };
        out.push(s);
      }
      s.items.push(it);
    });
    return out;
  }, [hits]);

  const pick = useCallback(
    (it: T) => {
      onSelect(it);
      setQ("");
      setHi(0);
      setOpen(false);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    },
    [onSelect],
  );

  const highlighted = Math.min(hi, Math.max(hits.length - 1, 0));

  return (
    <div ref={wrapRef} className="relative w-full max-w-[560px]">
      <div
        className={`flex items-center gap-[9px] border bg-white px-4 py-[9px] transition-[box-shadow,border-color] duration-[160ms] ease-om rounded-pill ${
          focus ? "border-blue-500" : "border-line"
        }`}
        style={{
          boxShadow: focus
            ? "0 0 0 3px color-mix(in srgb, var(--color-blue-500) 18%, transparent)"
            : "var(--shadow-card)",
        }}
      >
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={q}
          placeholder={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setHi(0);
            setOpen(true);
          }}
          onFocus={() => {
            setFocus(true);
            setOpen(true);
          }}
          onBlur={() => setFocus(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(h + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && hits[highlighted]) {
              pick(hits[highlighted]);
            }
          }}
          className="flex-1 border-none bg-transparent text-[14px] font-semibold text-ink outline-none"
        />
        <span className="shrink-0 border border-line px-[7px] py-0.5 text-[11px] font-bold text-slate-400 rounded-md">
          ⌘K
        </span>
      </div>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[60] max-h-[420px] origin-top overflow-y-auto border border-line bg-white p-2 shadow-raised rounded-ops-md [animation:om-pop_160ms_var(--ease-om)_both]">
          {sections.length === 0 ? (
            <div className="px-3.5 py-[22px] text-center text-[13.5px] font-semibold text-slate-400">
              Nothing matches &ldquo;{q.trim()}&rdquo;
            </div>
          ) : (
            sections.map((s) => (
              <div key={s.label}>
                <Label className="block px-3 pb-[5px] pt-2.5">{s.label}</Label>
                {s.items.map((it) => {
                  const Icon = it.icon;
                  const flat = hits.indexOf(it);
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(it);
                      }}
                      onMouseEnter={() => setHi(flat)}
                      className={`flex w-full cursor-pointer items-center gap-[11px] border-none px-3 py-[9px] text-left text-[13.5px] font-bold text-ink rounded-[10px] ${
                        flat === highlighted ? "bg-fill-quiet" : "bg-transparent"
                      }`}
                    >
                      <Icon size={15} className="shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        <Hi text={it.title} q={ql} />
                      </span>
                      {it.meta ? (
                        <span className="whitespace-nowrap text-[12.5px] font-semibold text-slate-400">
                          <Hi text={it.meta} q={ql} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
