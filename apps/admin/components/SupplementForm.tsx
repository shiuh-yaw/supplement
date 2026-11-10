"use client";

import { useFormAction } from "@/components/useFormAction";
import { saveSupplement } from "@/app/(dash)/supplements/actions";
import { FormError } from "./FormError";

export function SupplementForm({
  s,
  isReviewer,
}: {
  s: { id: string; name: string; summary: string; timing: string; notes: string[]; translations: unknown; dosing: unknown; references: unknown; evidenceGrade: string; active: boolean; sortOrder: number };
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
      {([
        ["ms", "Bahasa Melayu"],
        ["id", "Bahasa Indonesia"],
      ] as const).map(([loc, langName]) => {
        const t = (((s.translations ?? {}) as Record<string, { name?: string; summary?: string; timing?: string; notes?: string[] }>)[loc]) ?? {};
        return (
          <fieldset key={loc} className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold">{langName}</legend>
            <p className="text-xs text-slate-500">Leave a field empty to show the English text.</p>
            <div>
              <label className="label" htmlFor={`name_${loc}`}>Name</label>
              <input id={`name_${loc}`} name={`name_${loc}`} className="input" defaultValue={t.name ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor={`summary_${loc}`}>Summary</label>
              <textarea id={`summary_${loc}`} name={`summary_${loc}`} rows={3} className="input" defaultValue={t.summary ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor={`timing_${loc}`}>How / when to take</label>
              <input id={`timing_${loc}`} name={`timing_${loc}`} className="input" defaultValue={t.timing ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor={`notes_${loc}`}>Notes (one per line)</label>
              <textarea id={`notes_${loc}`} name={`notes_${loc}`} rows={3} className="input" defaultValue={(t.notes ?? []).join("\n")} />
            </div>
          </fieldset>
        );
      })}
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
