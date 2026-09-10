"use client";

/* Underlined sub tabs with optional counts, porting mobile
   components/admin/library/SubTabs.tsx. */

export interface SubTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export function SubTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: SubTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-line">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 border-0 border-b-2 bg-transparent px-3 py-2 text-[13px] font-bold transition-colors duration-[160ms] ease-om ${
              active ? "border-blue-500 text-ink" : "border-transparent text-slate-400"
            }`}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={`inline-flex min-w-[20px] justify-center px-1.5 py-px text-[11px] font-bold rounded-pill ${
                  active ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-400"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
