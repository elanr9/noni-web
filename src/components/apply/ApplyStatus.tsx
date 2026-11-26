import { ArrowRight, Check, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GetTheApp } from "@/components/GetTheApp";
import type { ApplyKind } from "@/lib/applications";

/* What an applicant sees once the chat is done: in review, approved (creators
   get the app here; companies are sent to their dashboard), or not accepted. */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex items-center gap-[9px] px-5 py-4 sm:px-7">
        <Link href="/" className="flex items-center gap-[9px] no-underline">
          <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
          <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center gap-6 px-5 pb-24">{children}</main>
    </div>
  );
}

export function InReview({ kind, email }: { kind: ApplyKind; email: string }) {
  return (
    <Frame>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Clock size={26} />
      </span>
      <div>
        <h1 className="m-0 text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">Your application is in</h1>
        <p className="m-0 mt-3 text-[17px] font-medium leading-[1.55] text-slate-500">
          {kind === "company"
            ? "We review every brand before opening a workspace. "
            : "We review every creator before they can apply to brands. "}
          We&apos;ll email {email || "you"} as soon as you&apos;re in.
        </p>
      </div>
      {kind === "creator" ? <ReviewNote /> : null}
    </Frame>
  );
}

function ReviewNote() {
  return (
    <p className="m-0 rounded-[18px] border border-line bg-white p-4 text-[14.5px] font-medium leading-[1.5] text-slate-500">
      Tip: creators with links to real videos get approved fastest. You can add more to your profile once you&apos;re in.
    </p>
  );
}

export function CreatorApproved({ email, name }: { email: string; name: string }) {
  return (
    <Frame>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
        <Check size={28} strokeWidth={3} />
      </span>
      <div>
        <h1 className="m-0 text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">You&apos;re in</h1>
        <p className="m-0 mt-3 text-[17px] font-medium leading-[1.55] text-slate-500">
          Creators work from the Noni app. Get it, sign in with this Google account, and start applying to brands.
        </p>
      </div>
      <div className="rounded-[20px] border border-line bg-white p-5">
        <GetTheApp email={email} name={name} source="apply" look="ops" showOpenApp={false} />
      </div>
      <Link
        href="/campaigns"
        className="inline-flex self-start rounded-full bg-blue-100 px-6 py-3.5 text-[15px] font-bold text-blue-700 no-underline transition-transform duration-[160ms] ease-om hover:-translate-y-px"
      >
        See campaigns
      </Link>
    </Frame>
  );
}

export function NotAccepted({ kind, note }: { kind: ApplyKind; note: string | null }) {
  return (
    <Frame>
      <div>
        <h1 className="m-0 text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">Not this time</h1>
        <p className="m-0 mt-3 text-[17px] font-medium leading-[1.55] text-slate-500">
          We couldn&apos;t take your application right now.{note ? ` ${note}` : ""}
        </p>
      </div>
      <Link
        href={`/apply?as=${kind}&again=1`}
        className="inline-flex self-start rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white no-underline"
      >
        Apply again
      </Link>
    </Frame>
  );
}

/** The end of the chat: the application just went in. */
export function ChatDone({ kind }: { kind: ApplyKind }) {
  /* A company is let straight in; the next screen asks who runs it. */
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/apply?as=${kind}`}
        className={`group inline-flex items-center gap-2 self-start rounded-full px-7 py-4 text-[16px] font-bold text-white no-underline transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.96] ${
          kind === "company" ? "bg-blue-500 shadow-[0_10px_24px_rgba(59,130,246,0.3)]" : "bg-ink"
        }`}
      >
        Next
        <ArrowRight size={18} className="transition-transform duration-150 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
