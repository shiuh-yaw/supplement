"use client";

import { useFormAction } from "@/components/useFormAction";
import { saveSupplement } from "@/app/(dash)/supplements/actions";
import { FormError } from "./FormError";

export function SupplementForm({
  s,
  isReviewer,
}: {
  s: { id: string; name: string; summary: string; timing: string; notes: string[]; dosing: unknown; references: unknown; evidenceGrade: string; active: boolean; sortOrder: number };
  isReviewer: boolean;
}) {
  const [state, action, pending] = useFormAction(saveSupplement, {});
  return (
    <form onSubmit={action} className="card max-w-3xl space-y-4">
      <input type="hidden" name="id" value={s.id} />
      <div className="grid gap-4 sm:grid-cols-[1fr_120px_100px]">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" className="input" defaultValue={s.name} />
        </div>
        <div>
          <label className="label" htmlFor="evidenceGrade">Evidence</label>
          <select id="evidenceGrade" name="evidenceGrade" className="input" defaultValue={s.evidenceGrade} disabled={!isReviewer}>
            <option value="A">A — strong</option>
            <option value="B">B — moderate</option>
            <option value="C">C — limited</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sortOrder">Order</label>
          <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={s.sortOrder} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="summary">Summary (shown to users)</label>
        <textarea id="summary" name="summary" rows={3} className="input" defaultValue={s.summary} />
      </div>
      <div>
        <label className="label" htmlFor="timing">How / when to take</label>
        <input id="timing" name="timing" className="input" defaultValue={s.timing} />
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes shown with every recommendation (one per line)</label>
        <textarea id="notes" name="notes" rows={3} className="input" defaultValue={s.notes.join("\n")} />
      </div>
      <div>
        <label className="label" htmlFor="dosing">Dosing (JSON){!isReviewer && " — reviewers only"}</label>
        <textarea id="dosing" name="dosing" rows={10} className="textarea-code" readOnly={!isReviewer} defaultValue={JSON.stringify(s.dosing, null, 2)} />
      </div>
      <div>
        <label className="label" htmlFor="references">References (JSON)</label>
        <textarea id="references" name="references" rows={6} className="textarea-code" defaultValue={JSON.stringify(s.references, null, 2)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={s.active} className="accent-brand-600" /> Active (shown to users)
      </label>
      <FormError error={state.error} />
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
