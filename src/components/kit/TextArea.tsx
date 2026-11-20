"use client";

import type { ChangeEvent } from "react";

import { Label } from "./Label";

export interface TextAreaProps {
  /** Omit for a bare box under a heading that already names it. */
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  optional?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  rows?: number;
  name?: string;
  /** lg: the onboarding question screens. */
  size?: "md" | "lg";
}

/* Multi-line twin of Field: same border, radius, type and focus ring. */
export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  optional,
  autoFocus,
  disabled = false,
  rows = 5,
  name,
  size = "md",
}: TextAreaProps) {
  const box = (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      rows={rows}
      aria-label={label ? undefined : placeholder}
      className={`box-border block w-full resize-y border border-line bg-white ${size === "lg" ? "px-[18px] py-4 text-[17px]" : "px-3.5 py-3 text-[14.5px]"} font-semibold leading-[1.55] text-ink outline-none rounded-ops-sm transition-opacity duration-[160ms] ease-om placeholder:text-slate-300 focus:border-blue-500 focus:[box-shadow:var(--ring-focus)] ${
        disabled ? "opacity-50" : ""
      }`}
    />
  );
  if (!label) return box;
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="flex items-baseline gap-2">
        <Label>{label}</Label>
        {optional ? (
          <span className="text-[11.5px] font-semibold text-slate-400">Optional</span>
        ) : null}
      </span>
      {box}
    </label>
  );
}
