"use client";

import { useState, type ReactNode } from "react";

import { contactMailto } from "@/lib/site-config";

import { WaitlistModal, type LeadModalKind } from "./WaitlistModal";

/* Contact entry point: a mailto to NEXT_PUBLIC_CONTACT_EMAIL when that inbox
   is configured, otherwise a button that opens the lead form, so Contact
   always reaches Noni. */
export function ContactLink({
  subject = "Hello from the Noni site",
  kind = "business",
  source = "footer",
  className,
  children,
}: {
  subject?: string;
  kind?: LeadModalKind;
  source?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const mailto = contactMailto(subject);

  if (mailto) {
    return (
      <a href={mailto} className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <WaitlistModal
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        source={source}
      />
    </>
  );
}
