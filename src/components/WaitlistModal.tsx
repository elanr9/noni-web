"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

const WAITLIST_EMAIL = "founders@fieldvisionai.com";

type WaitlistModalProps = {
  open: boolean;
  audience: "creators" | "businesses";
  onClose: () => void;
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent";

export function WaitlistModal({ open, audience, onClose }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject =
      audience === "creators" ? "Noni waitlist Creators" : "Noni waitlist Businesses";
    const companyLines =
      audience === "businesses"
        ? `Company: ${companyName}\n${companyUrl ? `Company URL: ${companyUrl}\n` : ""}`
        : "";
    const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n${companyLines}\nPlease add me to the Noni ${
      audience === "creators" ? "creator" : "business"
    } waitlist.`;
    window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Join the waitlist"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-3xl border border-line bg-white p-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="display text-[22px] font-semibold text-ink">
              Join the waitlist
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              {audience === "creators"
                ? "Get early access to Noni as a creator."
                : "Get early access to Noni for your business."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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
                type="tel"
                required
                placeholder="Phone number"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
              <input
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              {audience === "businesses" && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Company name"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    placeholder="Company URL (optional)"
                    autoComplete="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    className={inputClass}
                  />
                </>
              )}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-accent-deep"
              >
                Join waitlist
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
