const ROWS = [
  { initials: "JR", handle: "@jasmine.rae", meta: "Video · 0:24 · 9:41 AM", approved: false },
  { initials: "TK", handle: "@tommy.k", meta: "Video · 0:31 · 9:12 AM", approved: false },
  { initials: "MS", handle: "@maya.films", meta: "Photo set · 4 stills · 8:47 AM", approved: false },
  { initials: "DL", handle: "@dan.creates", meta: "Video · 0:18 · 8:02 AM", approved: true },
  { initials: "AC", handle: "@ava.content", meta: "Video · 0:42 · Yesterday", approved: true },
] as const;

type HeroPhoneProps = {
  className?: string;
};

export function HeroPhone({ className }: HeroPhoneProps) {
  const rootClass = ["relative mx-auto w-[220px] md:w-[260px]", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div
        className="relative overflow-hidden rounded-[36px] border border-black/15 bg-[#F7FAFD] shadow-[0_24px_48px_rgba(15,23,32,0.18)]"
        style={{ aspectRatio: "402 / 874" }}
      >
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[9px] z-20 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-black" />

        {/* Status bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pb-2 pt-3.5 text-[10px] font-semibold text-ink">
          <span className="w-10 text-center">9:41</span>
          <span className="flex w-14 items-center justify-center gap-1">
            <span className="inline-block h-2 w-3 rounded-[1px] bg-ink" />
            <span className="inline-block h-2 w-3 rounded-[1px] bg-ink" />
            <span className="inline-block h-2.5 w-5 rounded-sm border border-ink/40">
              <span className="m-[1px] block h-full w-[70%] rounded-[1px] bg-ink" />
            </span>
          </span>
        </div>

        <div className="flex h-full flex-col pt-11">
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-semibold tracking-[0.04em] text-[#8E9AA6]">
                TUESDAY, AUG 11
              </span>
              <span className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                Submissions
              </span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A7D3F7] text-[10px] font-extrabold text-[#0B76AD]">
              M
            </div>
          </div>

          <div className="mx-3 flex items-center justify-between rounded-[14px] bg-[#0F1720] px-3 py-2.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-bold text-white">12 new submissions</span>
              <span className="text-[8px] font-medium text-[#8E9AA6]">
                Waiting for your review
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-[#1BA6EE] px-2.5 py-1.5 text-[8px] font-bold text-white">
              Review
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between px-3.5">
            <span className="text-[10px] font-bold text-ink">Latest</span>
            <span className="text-[8px] font-semibold text-[#1BA6EE]">View all</span>
          </div>

          <div className="mt-1.5 flex flex-1 flex-col gap-1.5 overflow-hidden px-3">
            {ROWS.map((row) => (
              <div
                key={row.handle}
                className="flex items-center gap-2 rounded-xl border border-[#E6EEF6] bg-white px-2 py-1.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F4FD] text-[8px] font-extrabold text-[#0B76AD]">
                  {row.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[9px] font-bold text-ink">{row.handle}</div>
                  <div className="truncate text-[7.5px] font-medium text-[#8E9AA6]">
                    {row.meta}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[7.5px] font-bold ${
                    row.approved
                      ? "bg-[#E4F5EC] text-[#1F8F5F]"
                      : "bg-[#1BA6EE] text-white"
                  }`}
                >
                  {row.approved ? "Approved" : "Approve"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-[#E6EEF6] bg-white px-2 pb-4 pt-2">
            <div className="flex">
              <Tab active label="Submissions" icon="inbox" />
              <Tab label="Creators" icon="users" />
              <Tab label="Profile" icon="user" />
            </div>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-ink/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({
  label,
  active = false,
  icon,
}: {
  label: string;
  active?: boolean;
  icon: "inbox" | "users" | "user";
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-0.5 ${
        active ? "text-[#1BA6EE]" : "text-[#8E9AA6]"
      }`}
    >
      {icon === "inbox" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M3 9h18" />
          <path d="M8 14h5" />
        </svg>
      ) : icon === "users" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
      <span className="text-[7px] font-bold">{label}</span>
    </div>
  );
}
