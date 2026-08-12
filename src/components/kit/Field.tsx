"use client";

import type { ChangeEvent } from "react";

import { Label } from "./Label";

export interface FieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  optional?: boolean;
  autoFocus?: boolean;
  type?: "text" | "email" | "url";
  name?: string;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  optional,
  autoFocus,
  type = "text",
  name,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="flex items-baseline gap-2">
        <Label>{label}</Label>
        {optional ? (
          <span className="text-[11.5px] font-semibold text-slate-400">Optional</span>
        ) : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-line bg-white px-3.5 py-3 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]"
      />
    </label>
  );
}
