"use client";

import { useState } from "react";

type JoinCodeProps = {
  code: string;
};

export function JoinCode({ code }: JoinCodeProps) {
  const [copied, setCopied] = useState(false);

  function onCopy(event: React.MouseEvent<HTMLButtonElement>) {
    // Cards on the companies list wrap this component in a Link.
    event.preventDefault();
    event.stopPropagation();
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-lg bg-soft px-3 py-1 font-mono text-sm font-bold tracking-[0.2em] text-ink">
        {code}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink transition hover:border-ink/20"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
