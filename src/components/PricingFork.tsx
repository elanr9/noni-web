"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PlanPicker } from "@/components/admin/billing/PlanPicker";
import { MANAGED_PLAN } from "@/lib/plans";

/* Pricing on the public site (/pricing and the landing page): the same
   question the product asks right after sign up comes first. Do it myself
   shows the self serve plans; do it for me is a call. Both lead to sign up
   (a few quick questions, then the same choice inside the product). */

export const SIGN_UP = "/apply?as=company";

type Path = "diy" | "dfy";

export function PricingFork() {
  const router = useRouter();
  const [path, setPath] = useState<Path>("diy");

  return (
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-4 pt-10 md:px-8">
        <span className="inline-flex whitespace-nowrap bg-blue-100 px-3.5 py-1.5 text-[12.5px] font-bold tracking-[0.3px] text-blue-700 rounded-pill">
          Pricing
        </span>
        <h1 className="display m-0 mt-[18px] text-center text-[44px] font-bold leading-[1.08] tracking-[-1.2px] text-ink">
          Who should run it?
        </h1>
        <div className="mt-7 inline-flex border border-line bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,32,0.04)] rounded-pill">
          {(
            [
              ["diy", "Do it myself"],
              ["dfy", "Do it for me"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPath(key)}
              className={`cursor-pointer border-none px-6 py-2.5 text-[15px] font-bold transition-all duration-150 rounded-pill active:scale-[0.96] ${
                path === key ? "bg-ink text-white" : "bg-transparent text-slate-500 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div key={path} className="w-full animate-om-rise">
          {path === "diy" ? (
            <div className="mx-auto mt-8 max-w-[1000px]">
              <PlanPicker
                compact
                selfServeOnly
                publicCta={{ label: "Get started", onClick: () => router.push(SIGN_UP) }}
              />
            </div>
          ) : (
            <div className="mx-auto mt-8 flex max-w-[640px] flex-col items-center gap-5 rounded-[24px] border-2 border-blue-500 bg-white px-8 py-10 text-center shadow-[0_12px_32px_rgba(27,166,238,0.14)]">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-blue-100 text-blue-600">
                <Sparkles size={26} strokeWidth={2.4} />
              </span>
              <h2 className="m-0 text-[28px] font-bold tracking-[-0.6px] text-ink">Done for you</h2>
              <p className="m-0 max-w-[460px] text-[15.5px] font-medium leading-[1.6] text-slate-500">
                {MANAGED_PLAN.blurb}
              </p>
              <Link
                href={SIGN_UP}
                className="group inline-flex items-center gap-2 whitespace-nowrap bg-blue-500 px-7 py-3.5 text-[15px] font-bold text-white no-underline shadow-accent rounded-pill transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-blue-400 active:scale-[0.96]"
              >
                Book a call
                <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
  );
}
