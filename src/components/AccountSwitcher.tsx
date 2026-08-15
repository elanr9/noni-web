"use client";

import { Check, ChevronsUpDown, LogOut, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/kit/Avatar";
import {
  listSwitchableAccounts,
  rememberCurrentAccount,
  removeStoredAccount,
  roleHome,
  roleLabel,
  switchToAccount,
  type StoredAccount,
} from "@/lib/accounts";
import { createClient } from "@/lib/supabase/client";

/* Sidebar footer for every web shell (ops, admin, manager): shows who is
   signed in and opens a popover to swap between remembered admin and
   campaign manager accounts, add another one, or sign out. Creator
   accounts never appear; they live in the iOS app. */
export function AccountSwitcher({
  name,
  subtitle,
}: {
  name: string;
  subtitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    /* Seed or freshen the store with the live session before listing. */
    const current = await rememberCurrentAccount(supabase);
    setCurrentId(current?.userId ?? null);
    setAccounts(listSwitchableAccounts());
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSwitch(account: StoredAccount) {
    if (account.userId === currentId) {
      setOpen(false);
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      await switchToAccount(supabase, account.userId);
      window.location.assign(roleHome(account.role));
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Could not switch accounts.");
      setAccounts(listSwitchableAccounts());
    }
  }

  async function onAddAccount() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    await rememberCurrentAccount(supabase);
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          "/dash",
        )}&add=1`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError || !data.url) {
      setBusy(false);
      setError(oauthError?.message ?? "Could not open Google sign-in.");
      return;
    }
    window.location.assign(data.url);
  }

  async function onSignOut() {
    setBusy(true);
    const supabase = createClient();
    if (currentId) removeStoredAccount(currentId);
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-[16px] border border-line bg-white p-2 shadow-lg animate-om-pop">
          <span className="block px-2.5 pb-1.5 pt-1 text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
            Accounts
          </span>
          <div className="flex flex-col gap-0.5">
            {accounts.map((account) => {
              const active = account.userId === currentId;
              return (
                <button
                  key={account.userId}
                  type="button"
                  disabled={busy}
                  onClick={() => void onSwitch(account)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] border-none px-2.5 py-2 text-left transition-colors duration-[160ms] ease-om disabled:opacity-50 ${
                    active ? "bg-blue-100" : "bg-transparent hover:bg-fill-quiet"
                  }`}
                >
                  <Avatar
                    name={account.fullName ?? account.email ?? "Account"}
                    size={28}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-bold text-ink">
                      {account.fullName ?? account.email ?? "Account"}
                    </span>
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-slate-400">
                      {roleLabel(account.role)}
                      {account.email ? ` · ${account.email}` : ""}
                    </span>
                  </span>
                  {active ? (
                    <Check size={15} className="shrink-0 text-blue-700" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {error ? (
            <p className="mx-1 mt-1.5 rounded-[9px] bg-red-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-red-600">
              {error}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-col gap-0.5 border-t border-line pt-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAddAccount()}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] border-none bg-transparent px-2.5 py-2 text-left text-[12.5px] font-bold text-ink hover:bg-fill-quiet disabled:opacity-50"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-fill-quiet">
                <Plus size={14} className="text-slate-500" />
              </span>
              Add account
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSignOut()}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] border-none bg-transparent px-2.5 py-2 text-left text-[12.5px] font-bold text-slate-500 hover:bg-fill-quiet disabled:opacity-50"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-fill-quiet">
                <LogOut size={14} className="text-slate-500" />
              </span>
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Switch account"
        aria-expanded={open}
        onClick={toggleOpen}
        className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-[9px] pt-3 text-left"
      >
        <Avatar name={name} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-ink">
            {name}
          </span>
          <span className="block text-[11.5px] font-semibold text-slate-400">
            {subtitle}
          </span>
        </span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill hover:bg-fill-quiet">
          <ChevronsUpDown size={15} className="text-slate-400" />
        </span>
      </button>
    </div>
  );
}
