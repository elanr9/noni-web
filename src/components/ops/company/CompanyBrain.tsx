"use client";

import { AtSign, Music2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { Card, Chip, HoverPeek, Label, Modal, Pill } from "@/components/kit";
import type { BrainDoc, InspirationAccount } from "@/lib/ops/types";

function DocModal({ doc, onClose }: { doc: BrainDoc; onClose: () => void }) {
  const [text, setText] = useState(doc.preview + "\n\n");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const human = doc.owner === "human";

  return (
    <Modal title={doc.name} onClose={onClose}>
      <div className="-mt-2.5 mb-3 flex items-center gap-2">
        <span className="text-[12px] font-semibold text-slate-400">
          {words} words · updated {doc.updated}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        readOnly={!human}
        className={`box-border w-full resize-y border border-line px-3.5 py-3 text-[13.5px] font-semibold leading-[1.6] text-ink outline-none rounded-ops-sm ${
          human ? "bg-white" : "bg-fill-quiet"
        }`}
      />
      {human ? (
        <div className="mt-3.5 flex gap-2.5">
          <Pill variant="tint" icon={Sparkles} className="flex-1">
            AI clean up
          </Pill>
          <Pill onClick={onClose} className="flex-1">
            Save
          </Pill>
        </div>
      ) : null}
    </Modal>
  );
}

export function CompanyBrain({
  docs,
  accounts: initialAccounts,
}: {
  docs: BrainDoc[];
  accounts: InspirationAccount[];
}) {
  const [doc, setDoc] = useState<BrainDoc | null>(null);
  const [accounts, setAccounts] = useState<InspirationAccount[]>(initialAccounts);
  const [muted, setMuted] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);
  const [handle, setHandle] = useState("");

  const toggleMute = (i: number) =>
    setMuted((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i]));

  const addAccount = () => {
    const h = handle.trim();
    if (!h) return;
    setAccounts((xs) => [
      ...xs,
      { handle: h.startsWith("@") ? h : "@" + h, platform: "tiktok", kind: "Reference" },
    ]);
    setHandle("");
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {docs.length === 0 ? (
        <Card pad={22}>
          <p className="m-0 text-[13.5px] font-semibold text-slate-400">
            No brain docs yet. Product and Audience docs appear once the
            company fills in its brand brain in the app.
          </p>
        </Card>
      ) : (
      <div className="grid grid-cols-2 gap-3.5">
        {docs.map((d) => (
          <HoverPeek key={d.name} label="Open doc" onClick={() => setDoc(d)}>
            <Card pad={20} className="box-border h-full">
              <div className="flex items-center gap-2.5">
                <span className="flex-1 text-[15.5px] font-bold text-ink">{d.name}</span>
              </div>
              <p className="mb-3 mt-2.5 line-clamp-2 text-[13px] font-semibold leading-[1.55] text-slate-500">
                {d.preview}
              </p>
              <span className="text-[12px] font-semibold text-slate-400">
                {d.words} words · updated {d.updated}
              </span>
            </Card>
          </HoverPeek>
        ))}
      </div>
      )}
      <Card pad={0}>
        <div className="flex items-center gap-2.5 px-5 pb-2.5 pt-4">
          <Label className="flex-1">Inspiration accounts</Label>
          <Pill size="sm" variant="tint" icon={Plus} onClick={() => setAdding(true)}>
            Add account
          </Pill>
        </div>
        {adding ? (
          <div className="flex items-center gap-2.5 border-t border-line px-5 py-[11px]">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addAccount();
                if (e.key === "Escape") {
                  setHandle("");
                  setAdding(false);
                }
              }}
              placeholder="@handle"
              autoFocus
              className="box-border min-w-0 flex-1 border border-line bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-ink outline-none rounded-ops-sm"
            />
            <Pill size="sm" onClick={addAccount} disabled={!handle.trim()}>
              Add
            </Pill>
          </div>
        ) : null}
        {accounts.length === 0 && !adding ? (
          <p className="m-0 border-t border-line px-5 py-[13px] text-[13px] font-semibold text-slate-400">
            No inspiration accounts yet. Add a handle to seed trend sourcing.
          </p>
        ) : null}
        {accounts.map((a, i) => (
          <div
            key={a.handle + a.platform + i}
            className="flex items-center gap-[11px] border-t border-line px-5 py-[11px]"
          >
            {a.platform === "tiktok" ? (
              <Music2 size={15} className="text-slate-500" />
            ) : (
              <AtSign size={15} className="text-slate-500" />
            )}
            <span
              className={`flex-1 text-[13.5px] font-bold ${
                muted.includes(i) ? "text-slate-400" : "text-ink"
              }`}
            >
              {a.handle}
            </span>
            <Chip tone={a.kind === "Reference" ? "blue" : "slate"}>{a.kind}</Chip>
            <Pill size="sm" variant="quiet" onClick={() => toggleMute(i)}>
              {muted.includes(i) ? "Muted" : "Mute"}
            </Pill>
          </div>
        ))}
      </Card>
      {doc ? <DocModal doc={doc} onClose={() => setDoc(null)} /> : null}
    </div>
  );
}
