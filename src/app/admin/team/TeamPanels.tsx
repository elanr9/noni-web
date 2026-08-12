"use client";

import { FormEvent, useState, useTransition } from "react";
import { PERMISSION_DEFS, type Permissions } from "@/lib/permissions";
import {
  inviteManager,
  resendManagerInvite,
  revokeInvite,
  setMemberPermissions,
} from "./actions";

function Toggle({
  on,
  disabled,
  onChange,
  label,
}: {
  on: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        on ? "bg-accent" : "bg-line"
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function MemberPermissions({
  profileId,
  initial,
}: {
  profileId: string;
  initial: Permissions;
}) {
  const [permissions, setPermissions] = useState<Permissions>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(key: (typeof PERMISSION_DEFS)[number]["key"], next: boolean) {
    const updated = { ...permissions, [key]: next };
    setPermissions(updated);
    setError(null);
    startTransition(async () => {
      const result = await setMemberPermissions({ profileId, permissions: updated });
      if (!result.ok) {
        setPermissions(permissions);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {PERMISSION_DEFS.map((def) => (
          <div key={def.key} className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-ink-soft">{def.label}</span>
            <Toggle
              on={permissions[def.key] === true}
              disabled={pending}
              onChange={(next) => toggle(def.key, next)}
              label={def.label}
            />
          </div>
        ))}
      </div>
      {error ? (
        <p className="mt-2 text-[13px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function InviteManagerForm() {
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSent(false);
    const result = await inviteManager({ email, permissions });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmail("");
    setPermissions({});
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="manager@company.com"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent"
      />
      <div>
        <div className="mb-2 text-[13px] font-semibold text-ink">
          Start them with
        </div>
        <div className="grid gap-2.5">
          {PERMISSION_DEFS.map((def) => (
            <div key={def.key} className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-ink-soft">{def.label}</span>
              <Toggle
                on={permissions[def.key] === true}
                onChange={(next) =>
                  setPermissions((p) => ({ ...p, [def.key]: next }))
                }
                label={def.label}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">
          Everything stays off unless you turn it on. You can change these any time.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-[13px] font-medium text-accent-deep">
          Invite sent. They will get an email pointing them to the Noni app.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-[15px] font-bold text-white transition hover:bg-ink/90 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}

export function InviteRowActions({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!("ok" in result) || !result.ok) setError("Something went wrong.");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => resendManagerInvite({ inviteId }))}
        className="text-[13px] font-semibold text-accent-deep hover:underline disabled:opacity-50"
      >
        Resend
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => revokeInvite({ inviteId }))}
        className="text-[13px] font-semibold text-muted hover:text-red-600 disabled:opacity-50"
      >
        Revoke
      </button>
      {error ? <span className="text-[12px] text-red-600">{error}</span> : null}
    </div>
  );
}
