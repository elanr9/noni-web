"use client";

import { Check, Clock, Database } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  chooseSupabaseProject,
  getSignupStatus,
  startSupabaseConnect,
} from "@/app/admin/billing/signup-actions";
import { Card, Chip, Pill } from "@/components/kit";

interface Project {
  ref: string;
  name: string;
}

/* Billing > Sales data: connect the company's own Supabase project so
   Analytics counts real sign-ups. One click, then Supabase's consent screen. */
export function SignupTrackingCard() {
  const [connected, setConnected] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getSignupStatus();
    if (!res.ok) return;
    setConnected(res.connected);
    setReceiving(res.receiving);
    setProjectName(res.projectName);
    setProjects(res.projects);
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  /* Just connected: the history lands a few seconds later. */
  useEffect(() => {
    if (!connected || receiving) return;
    const timer = setInterval(() => void load(), 4000);
    const stop = setTimeout(() => clearInterval(timer), 60000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [connected, receiving, load]);

  const connect = async () => {
    if (busy) return;
    setBusy("connect");
    setError(null);
    const res = await startSupabaseConnect();
    if (!res.ok) {
      setBusy(null);
      setError(res.error);
      return;
    }
    if (res.redirectUrl) window.location.assign(res.redirectUrl);
  };

  const choose = async (ref: string) => {
    if (busy) return;
    setBusy(ref);
    setError(null);
    const res = await chooseSupabaseProject(ref);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await load();
  };

  return (
    <Card pad={22}>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/supabase.svg" alt="" className="h-10 w-10 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-bold tracking-[-0.3px] text-ink">Supabase</span>
          <span className="block truncate text-[13px] font-semibold text-slate-400">
            {connected && projectName ? projectName : "Sign-ups"}
          </span>
        </span>
        {projects ? null : connected ? (
          <Chip tone="green">
            <Check size={12} /> Connected
          </Chip>
        ) : (
          <Pill
            size="sm"
            icon={busy === "connect" ? Clock : Database}
            onClick={() => void connect()}
          >
            {busy === "connect" ? "Opening…" : "Connect"}
          </Pill>
        )}
      </div>

      {projects ? (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {projects.map((p) => (
            <Pill
              key={p.ref}
              size="sm"
              variant="tint"
              icon={busy === p.ref ? Clock : Database}
              onClick={() => void choose(p.ref)}
            >
              {busy === p.ref ? "Connecting…" : p.name}
            </Pill>
          ))}
        </div>
      ) : connected ? (
        <button
          type="button"
          onClick={() => void connect()}
          className="mt-3 cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold text-slate-400 hover:text-blue-700"
        >
          {busy === "connect" ? "Opening…" : "Change project"}
        </button>
      ) : null}

      {error ? (
        <p className="mb-0 mt-3 text-[13px] font-semibold text-ink">{error}</p>
      ) : null}
    </Card>
  );
}
