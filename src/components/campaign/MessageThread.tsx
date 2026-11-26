"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { loadMessages, sendMessage, type ThreadMessage } from "@/app/messages/actions";

/* The thread between a company and a creator on one application. Fills the
   height it is given; only the bubbles scroll. `sample` renders fixed
   messages for the /internal previews. */

function clock(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MessageThread({
  applicationId,
  color = "#1BA6EE",
  placeholder = "Message",
  sample,
  className = "",
}: {
  applicationId: string;
  color?: string;
  placeholder?: string;
  sample?: ThreadMessage[];
  className?: string;
}) {
  const [messages, setMessages] = useState<ThreadMessage[] | null>(sample ?? null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const count = useRef(0);

  useEffect(() => {
    if (sample) return;
    let live = true;
    const pull = () =>
      loadMessages(applicationId).then((r) => {
        if (!live) return;
        if (r.ok) setMessages(r.data);
        else setError(r.error);
      });
    void pull();
    const t = window.setInterval(() => void pull(), 15000);
    return () => {
      live = false;
      window.clearInterval(t);
    };
  }, [applicationId, sample]);

  useEffect(() => {
    const n = messages?.length ?? 0;
    if (n !== count.current) end.current?.scrollIntoView({ block: "end" });
    count.current = n;
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setError(null);
    if (sample) {
      const m: ThreadMessage = { id: `s${Date.now()}`, from_company: true, mine: true, body, created_at: new Date().toISOString(), read_at: null };
      setMessages((all) => [...(all ?? []), m]);
      setFresh(m.id);
      setText("");
      return;
    }
    setSending(true);
    const r = await sendMessage(applicationId, body);
    setSending(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setMessages((all) => [...(all ?? []), r.data]);
    setFresh(r.data.id);
    setText("");
  };

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {messages === null ? (
          <div className="m-auto om-spinner text-slate-400" />
        ) : messages.length === 0 ? (
          <p className="m-auto text-[14px] font-bold text-slate-400">No messages yet</p>
        ) : (
          <>
            <span className="flex-1" />
            {messages.map((m, i) => {
              const last = i === messages.length - 1 || messages[i + 1].mine !== m.mine;
              return (
                <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap break-words px-3.5 py-2 text-[14px] font-medium leading-[1.4] ${
                      m.mine ? "rounded-[18px] rounded-br-[6px] text-white" : "rounded-[18px] rounded-bl-[6px] bg-fill-quiet text-ink"
                    } ${fresh === m.id ? "animate-om-pop" : ""}`}
                    style={m.mine ? { background: color } : undefined}
                  >
                    {m.body}
                  </div>
                  {last ? (
                    <span className="mb-1.5 mt-0.5 px-1 text-[11px] font-semibold text-slate-400">
                      {clock(m.created_at)}
                      {m.mine && m.read_at ? " · Seen" : ""}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
        <div ref={end} />
      </div>
      {error ? <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p> : null}
      <form
        className="mt-3 flex shrink-0 items-end gap-2 rounded-[22px] border border-line bg-white py-1.5 pl-4 pr-1.5 focus-within:border-blue-300"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-[96px] min-h-[32px] flex-1 resize-none border-0 bg-transparent py-1.5 text-[14px] font-medium text-ink outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!text.trim() || sending}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white transition-transform duration-[90ms] active:scale-90 disabled:cursor-default disabled:opacity-30"
          style={{ background: color }}
        >
          {sending ? <span className="om-spinner" /> : <ArrowUp size={17} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
