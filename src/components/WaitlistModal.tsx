"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";

import { submitLead, type LeadKind } from "@/lib/leads";

/* Public lead form in a modal. One component for the landing waitlist, the
   business "Get started" path and the Enterprise "Contact us" CTA. Posts to
   /api/leads, which stores the lead in public.leads. */

export type LeadModalKind = Exclude<LeadKind, "testflight">;

const COPY: Record<
  LeadModalKind,
  { title: string; sub: string; cta: string; doneTitle: string; doneBody: string }
> = {
  waitlist: {
    title: "Join the waitlist",
    sub: "Get early access to Noni.",
    cta: "Join waitlist",
    doneTitle: "You're on the list",
    doneBody: "We'll email you as soon as your spot opens up.",
  },
  business: {
    title: "Get Noni for your company",
    sub: "Tell us about your company. We set up your workspace and email you a sign-in link, usually within a business day.",
    cta: "Get started",
    doneTitle: "Thanks, we're on it",
    doneBody:
      "We'll set up your workspace and email you a sign-in link. You pick your plan when you finish onboarding.",
  },
  enterprise: {
    title: "Talk to us about Enterprise",
    sub: "Unlimited creators per campaign, a dedicated account manager and custom onboarding.",
    cta: "Send",
    doneTitle: "Thanks, we'll be in touch",
    doneBody: "Someone from Noni will reply by email within a business day.",
  },
};

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
  kind?: LeadModalKind;
  /** Where the form was opened from, stored with the lead. */
  source?: string;
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent";

export function WaitlistModal({
  open,
  onClose,
  kind = "waitlist",
  source = "landing",
}: WaitlistModalProps) {
  const copy = COPY[kind];
  const isCompany = kind !== "waitlist";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /* Closing resets the result, so reopening starts on the form. */
  const close = () => {
    setDone(false);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDone(false);
        setError(null);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await submitLead({
      kind,
      name,
      email,
      phone: isCompany ? undefined : phone,
      company: isCompany ? company : undefined,
      website: isCompany ? website : undefined,
      message: isCompany ? message : undefined,
      source,
      url: honeypot,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    setName("");
    setPhone("");
    setEmail("");
    setCompany("");
    setWebsite("");
    setMessage("");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative max-h-[calc(100vh-32px)] w-full max-w-sm overflow-y-auto rounded-3xl border border-line bg-white p-6"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            {done ? (
              <div className="py-4 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                  <Check className="h-5 w-5 text-accent-deep" />
                </span>
                <h2 className="display mt-4 text-[22px] font-semibold text-ink">
                  {copy.doneTitle}
                </h2>
                <p className="mt-1.5 text-[14px] text-muted">{copy.doneBody}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-ink-soft"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="display pr-8 text-[22px] font-semibold text-ink">
                  {copy.title}
                </h2>
                <p className="mt-1 text-[14px] text-muted">{copy.sub}</p>

                <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-3">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    required
                    placeholder={isCompany ? "Work email" : "Email"}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  {isCompany ? (
                    <>
                      <input
                        type="text"
                        required
                        placeholder="Company"
                        autoComplete="organization"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Website (optional)"
                        autoComplete="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className={inputClass}
                      />
                      <textarea
                        rows={3}
                        placeholder={
                          kind === "enterprise"
                            ? "How many creators do you run? (optional)"
                            : "Anything we should know? (optional)"
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                    </>
                  ) : (
                    <input
                      type="tel"
                      placeholder="Phone number (optional)"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  )}
                  {/* Honeypot: hidden from people, irresistible to bots. */}
                  <input
                    type="text"
                    name="url"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />
                  {error ? (
                    <p role="alert" className="text-[13px] font-semibold text-danger">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-accent-deep disabled:cursor-default disabled:opacity-60"
                  >
                    {busy ? "Sending…" : copy.cta}
                    {busy ? null : <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
