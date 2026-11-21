/* What a dashboard page shows the instant a tab is clicked, while the real
   page loads: the same rough shape (title, a summary row, a list), with a
   soft shimmer. Used by the loading.tsx files under /admin, /manager, /ops. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-om-fade">
      <div className="skeleton h-[34px] w-[220px] rounded-[12px]" />
      <div className="skeleton mt-3 h-[16px] w-[320px] max-w-full rounded-[8px]" />
      <div className="mt-7 grid gap-3.5 sm:grid-cols-3">
        <div className="skeleton h-[96px] rounded-[18px]" />
        <div className="skeleton h-[96px] rounded-[18px]" />
        <div className="skeleton h-[96px] rounded-[18px]" />
      </div>
      <div className="skeleton mt-3.5 h-[260px] rounded-[18px]" />
    </div>
  );
}
