"use client";

import { useState, useTransition } from "react";
import { savePublishTime } from "./actions";

const DAYS = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export function PublishForm({
  initialDay,
  initialTime,
}: {
  initialDay: string;
  initialTime: string;
}) {
  const [day, setDay] = useState(initialDay);
  const [time, setTime] = useState(initialTime);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await savePublishTime({ day, time });
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  const selectClass =
    "rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition focus:border-accent";

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={selectClass}
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">
            Time (Eastern)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={selectClass}
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-full bg-ink px-5 py-3 text-[15px] font-bold text-white transition hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {saved ? (
        <p className="mt-3 text-[13px] font-medium text-accent-deep">
          Publish time saved.
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-[13px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
