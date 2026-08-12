"use client";

import { CircleCheckBig, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { createCompany } from "@/app/ops/actions";
import { Field, Modal, Pill } from "@/components/kit";

export function NewCompanyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = Boolean(name.trim() && adminName.trim() && /.+@.+\..+/.test(email));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCompany({
        name: name.trim(),
        website: site.trim() ? site.trim() : null,
        adminName: adminName.trim(),
        adminEmail: email.trim(),
      });
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  };

  if (sent) {
    return (
      <Modal title="Invite sent" onClose={onClose}>
        <div className="flex flex-col items-center px-1 pb-1 pt-2.5 text-center">
          <span className="inline-flex h-[54px] w-[54px] items-center justify-center bg-green-soft rounded-pill">
            <CircleCheckBig size={24} className="text-green" />
          </span>
          <div className="mt-3.5 text-[16px] font-bold tracking-[-0.3px] text-ink">
            {name} is on Noni
          </div>
          <p className="mb-[18px] mt-[7px] max-w-[330px] text-[14px] font-semibold leading-[1.55] text-slate-400">
            We emailed {email} an invite to be {name}&apos;s admin. They&apos;ll sign in
            with Google and land in onboarding.
          </p>
          <Pill onClick={onClose} className="w-full">
            Done
          </Pill>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="New company" onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <Field
          label="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Google"
          autoFocus
        />
        <Field
          label="Website"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          placeholder="google.com"
          optional
        />
        <Field
          label="Company admin"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="John Smith"
        />
        <Field
          label="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="johnsmith@google.com"
        />
        {error ? (
          <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
        ) : null}
        <Pill icon={Send} onClick={submit} disabled={!ready || pending} className="w-full">
          Send invite
        </Pill>
      </div>
    </Modal>
  );
}
