"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

export interface FileDropProps {
  /** Passed to the picker, so it only offers what can be read. */
  accept: string;
  onFile: (file: File) => void;
  /** The one line inside the zone, e.g. "Choose a file". */
  label: string;
  /** Replaces the label while a file is on its way. */
  busyLabel?: string;
  busy?: boolean;
}

/* A dashed zone that takes one dropped file or opens the picker. */
export function FileDrop({ accept, onFile, label, busyLabel, busy = false }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !busy) onFile(file);
        }}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed px-4 py-7 text-[13.5px] font-bold rounded-ops-sm transition-colors duration-[160ms] ease-om ${
          over
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-line-strong bg-white text-slate-500 hover:border-blue-300 hover:bg-fill-quiet"
        } ${busy ? "pointer-events-none opacity-50" : ""}`}
      >
        <Upload size={15} />
        {busy && busyLabel ? busyLabel : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}
