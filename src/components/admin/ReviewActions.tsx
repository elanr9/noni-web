"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { reviewSubmission } from "@/app/admin/actions";

export function ReviewActions({
  assignmentId,
  submissionId,
}: {
  assignmentId: string;
  submissionId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  function run(action: "approved" | "changes_requested", noteValue: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await reviewSubmission({
        assignmentId,
        submissionId,
        action,
        note: noteValue,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  function onRequestChanges(e: FormEvent) {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Add a short note for the creator.");
      return;
    }
    run("changes_requested", trimmed);
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!noteOpen ? (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            disabled={pending}
            onClick={() => run("approved", null)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1F8F5F] px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
          >
            {pending ? "Working…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setNoteOpen(true)}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-line bg-white px-5 py-3.5 text-[15px] font-bold text-ink disabled:opacity-50"
          >
            Request changes
          </button>
        </div>
      ) : (
        <form onSubmit={onRequestChanges} className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="What should the creator fix?"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
          />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ink px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send back"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setNoteOpen(false);
                setError(null);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-line bg-white px-5 py-3.5 text-[15px] font-bold text-ink disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
