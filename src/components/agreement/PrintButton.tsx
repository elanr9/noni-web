"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-blue-500 px-5 py-2.5 text-[14px] font-bold text-white transition-transform active:scale-95 print:hidden"
    >
      <Download size={15} />
      Save PDF
    </button>
  );
}
