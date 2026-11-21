"use client";

import { Check, Clock, Database } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  chooseSupabaseProject,
  getSignupStatus,
  startSupabaseConnect,
} from "@/app/admin/billing/signup-actions";
import { Card, Chip, Label, Pill } from "@/components/kit";

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
      <div className="flex items-center gap-2.5">
        <Label className="flex-1">Sign-ups from your app</Label>
        {connected ? (
          <Chip tone="green">
            <Check size={12} /> Connected
          </Chip>
        ) : (
          <Chip tone="slate">Optional</Chip>
        )}
      </div>

      {projects ? (
        <>
          <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
            Which project does your app run on?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </>
      ) : connected ? (
        <>
          <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
            {receiving
              ? `Analytics counts every sign-up${projectName ? ` from ${projectName}` : ""}, next to the posts that brought it in.`
              : `Connected${projectName ? ` to ${projectName}` : ""}. Your sign-up history is on its way and shows up in Analytics within a minute.`}
          </p>
          <div className="mt-3.5">
            <Pill
              size="sm"
              variant="quiet"
              icon={busy === "connect" ? Clock : Database}
              onClick={() => void connect()}
            >
              {busy === "connect"
                ? "Opening Supabase…"
                : "Connect a different project"}
            </Pill>
          </div>
        </>
      ) : (
        <>
          <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
            Optional. If your app runs on Supabase, connect it and Analytics
            counts every sign-up, including your history. Access is read-only,
            and Noni only keeps a number per day: no names, emails or user ids.
          </p>
          <div className="mt-3.5">
            <Pill
              size="sm"
              icon={busy === "connect" ? Clock : Database}
              onClick={() => void connect()}
            >
              {busy === "connect" ? "Opening Supabase…" : "Connect Supabase"}
            </Pill>
          </div>
        </>
      )}

      {error ? (
        <p className="mb-0 mt-3 text-[13px] font-semibold text-ink">{error}</p>
      ) : null}
    </Card>
  );
}
