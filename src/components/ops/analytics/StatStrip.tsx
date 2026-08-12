"use client";

// CONTRACT STUB — Agent B replaces the implementation. Stat strip with
// deltas, used by Overview (Agent B) and Company detail Analytics tab
// (Agent D). Props may be extended with optional fields only.
import type { ReactNode } from "react";

export type StatStripStat = {
  label: string;
  value: string;
  delta?: string;
};

export type StatStripProps = {
  stats: StatStripStat[];
  right?: ReactNode;
};

export function StatStrip(_props: StatStripProps) {
  return null;
}
