"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  addFeature,
  approveFeature,
  rejectFeature,
  updateFeature,
  type ProductFeatureInput,
} from "@/app/admin/features/actions";

export type ProductFeatureRow = {
  id: string;
  name: string;
  what_it_does: string;
  claim: string;
  approved: boolean;
  rejected: boolean;
};

const EMPTY_FORM: ProductFeatureInput = { name: "", what_it_does: "", claim: "" };

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none ring-accent/30 focus:ring-4";
const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink disabled:opacity-50";

function FeatureForm({
  initial,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ProductFeatureInput;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: ProductFeatureInput) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  const valid =
    values.name.trim() !== "" &&
    values.what_it_does.trim() !== "" &&
    values.claim.trim() !== "";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-ink">Name</label>
        <input
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="Bulk coach emails"
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink">
          What it does
        </label>
        <textarea
          value={values.what_it_does}
          onChange={(e) =>
            setValues((v) => ({ ...v, what_it_does: e.target.value }))
          }
          rows={2}
          placeholder="Sends a separate personalized email to every coach in one action"
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink">Claim</label>
        <textarea
          value={values.claim}
          onChange={(e) => setValues((v) => ({ ...v, claim: e.target.value }))}
          rows={2}
          placeholder="You hit send once and it goes out to fifty coaches, all different emails"
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>
      <div className="flex gap-2.5">
        <button type="submit" disabled={!valid || pending} className={primaryBtn}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className={outlineBtn}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function FeaturesManager({
  rows,
  canEdit,
}: {
  rows: ProductFeatureRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pendingRows = useMemo(
    () => rows.filter((r) => !r.approved && !r.rejected),
    [rows],
  );
  const approvedRows = useMemo(
    () => rows.filter((r) => r.approved && !r.rejected),
    [rows],
  );
  const rejectedRows = useMemo(() => rows.filter((r) => r.rejected), [rows]);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAdding(false);
      setEditingId(null);
      router.refresh();
    });
  }

  function onReject(row: ProductFeatureRow) {
    if (
      row.approved &&
      !window.confirm(
        "Reject this claim? Briefs can only use approved claims. Rejecting removes it from the bank.",
      )
    ) {
      return;
    }
    run(() => rejectFeature(row.id));
  }

  function card(row: ProductFeatureRow, actions: React.ReactNode) {
    if (editingId === row.id) {
      return (
        <div key={row.id} className="rounded-[24px] border border-line bg-white p-5">
          <FeatureForm
            initial={{
              name: row.name,
              what_it_does: row.what_it_does,
              claim: row.claim,
            }}
            pending={pending}
            submitLabel="Save"
            onSubmit={(values) => run(() => updateFeature(row.id, values))}
            onCancel={() => setEditingId(null)}
          />
        </div>
      );
    }
    return (
      <div key={row.id} className="rounded-[24px] border border-line bg-white p-5">
        <div className="text-[15px] font-bold text-ink">{row.name}</div>
        <p className="mt-1 text-[14px] text-muted">{row.what_it_does}</p>
        <p className="mt-2 text-[14px] italic text-ink">&ldquo;{row.claim}&rdquo;</p>
        {actions}
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-2xl space-y-8">
      {!canEdit ? (
        <p className="rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-muted">
          You can view approved claims, but your account does not have the
          manage features permission, so editing is disabled.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {canEdit ? (
        adding ? (
          <div className="rounded-[24px] border border-line bg-white p-5">
            <FeatureForm
              initial={EMPTY_FORM}
              pending={pending}
              submitLabel="Add claim"
              onSubmit={(values) => run(() => addFeature(values))}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={primaryBtn}
          >
            <Plus className="h-4 w-4" />
            Add a claim
          </button>
        )
      ) : null}

      {canEdit && pendingRows.length > 0 ? (
        <section className="space-y-3">
          <h2 className="display text-xl font-semibold text-ink">Pending</h2>
          {pendingRows.map((row) =>
            card(
              row,
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => approveFeature(row.id))}
                  className="inline-flex items-center justify-center rounded-full bg-[#1F8F5F] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setEditingId(row.id)}
                  className={outlineBtn}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onReject(row)}
                  className={outlineBtn}
                >
                  Reject
                </button>
              </div>,
            ),
          )}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="display text-xl font-semibold text-ink">Approved</h2>
        {approvedRows.length === 0 ? (
          <p className="text-sm text-muted">
            None approved yet. A claim is one concrete thing a creator can say
            about the product on camera.
          </p>
        ) : (
          approvedRows.map((row) =>
            card(
              row,
              canEdit ? (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setEditingId(row.id)}
                    className={outlineBtn}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onReject(row)}
                    className={outlineBtn}
                  >
                    Reject
                  </button>
                </div>
              ) : null,
            ),
          )
        )}
      </section>

      {canEdit && rejectedRows.length > 0 ? (
        <section className="space-y-3">
          <h2 className="display text-xl font-semibold text-ink">Rejected</h2>
          <p className="text-sm text-muted">
            Kept so rescans do not resurface them. Never used in briefs.
          </p>
          {rejectedRows.map((row) => card(row, null))}
        </section>
      ) : null}
    </div>
  );
}
