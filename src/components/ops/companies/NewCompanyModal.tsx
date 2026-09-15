"use client";

import { CircleCheckBig, ImagePlus, Send } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createCompany, setCompanyLogo } from "@/app/ops/actions";
import { Field, Modal, Pill } from "@/components/kit";
import { COMPANY_LOGO_ACCEPT, validateCompanyLogo } from "@/lib/company-logo";

export function NewCompanyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sent, setSent] = useState<{ existingCompanies: number; logoError: string | null } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const logoInput = useRef<HTMLInputElement>(null);
  const ready = Boolean(name.trim() && adminName.trim() && /.+@.+\..+/.test(email));

  const pickLogo = (file: File | null) => {
    if (!file) return;
    const invalid = validateCompanyLogo(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCompany({
        name: name.trim(),
        website: site.trim() ? site.trim() : null,
        adminName: adminName.trim(),
        adminEmail: email.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      let logoError: string | null = null;
      if (logo) {
        const formData = new FormData();
        formData.set("logo", logo);
        const uploaded = await setCompanyLogo(result.companyId, formData);
        if (!uploaded.ok) logoError = uploaded.error;
      }
      setSent({ existingCompanies: result.existingCompanies, logoError });
    });
  };

  if (sent) {
    const others = sent.existingCompanies;
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
            {others > 0
              ? `We emailed ${email} an invite to be ${name}'s admin. They already work with ${others === 1 ? "another company" : `${others} other companies`} on Noni, so ${name} is added to their account and they can switch to it from the company menu.`
              : `We emailed ${email} an invite to be ${name}'s admin. They'll sign in with Google and land in onboarding.`}
            {sent.logoError ? ` The logo did not upload: ${sent.logoError}` : ""}
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
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-fill-quiet">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImagePlus size={16} className="text-slate-400" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-ink">Logo</span>
            <span className="block text-[12px] font-semibold text-slate-400">
              Optional. PNG, JPEG, WebP or SVG up to 2MB.
            </span>
          </span>
          <input
            ref={logoInput}
            type="file"
            accept={COMPANY_LOGO_ACCEPT}
            className="hidden"
            onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
          />
          <Pill size="sm" variant="tint" onClick={() => logoInput.current?.click()}>
            {logo ? "Change" : "Choose"}
          </Pill>
        </div>
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
