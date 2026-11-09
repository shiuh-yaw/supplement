"use client";

import { useFormAction } from "@/components/useFormAction";
import { FACTS, OPERATORS } from "@supplement/engine";
import { saveRule } from "@/app/(dash)/rules/actions";
import { FormError } from "./FormError";

export interface RuleFormValues {
  id?: string;
  key: string;
  name: string;
  supplementId: string | null;
  effect: string;
  priority: number;
  message: string;
  condition: unknown;
}

export function RuleForm({
  rule,
  supplements,
  readOnly,
}: {
  rule?: RuleFormValues;
  supplements: { id: string; name: string }[];
  readOnly?: boolean;
}) {
  const [state, action, pending] = useFormAction(saveRule, {});
  const example = { all: [{ fact: "goal", op: "in", value: ["muscle_gain"] }, { fact: "labs.egfr", op: "gte", value: 60 }] };

  return (
    <form onSubmit={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card space-y-4">
        {rule?.id && <input type="hidden" name="id" value={rule.id} />}
        <fieldset disabled={readOnly} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="key">Key</label>
              <input id="key" name="key" className="input font-mono" defaultValue={rule?.key} disabled={Boolean(rule?.id)} placeholder="creatine-block-ckd" />
            </div>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" name="name" className="input" defaultValue={rule?.name} />
            </div>
            <div>
              <label className="label" htmlFor="supplementId">Applies to</label>
              <select id="supplementId" name="supplementId" className="input" defaultValue={rule?.supplementId ?? ""}>
                <option value="">All supplements (global)</option>
                {supplements.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="effect">Effect</label>
                <select id="effect" name="effect" className="input" defaultValue={rule?.effect ?? "CAUTION"}>
                  <option value="RECOMMEND">Recommend</option>
                  <option value="CAUTION">Caution</option>
                  <option value="BLOCK">Block</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="priority">Priority</label>
                <input id="priority" name="priority" type="number" className="input" defaultValue={rule?.priority ?? 10} />
              </div>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="message">Message shown to the user</label>
            <textarea id="message" name="message" rows={3} className="input" defaultValue={rule?.message} />
          </div>
          <div>
            <label className="label" htmlFor="condition">Condition (JSON)</label>
            <textarea id="condition" name="condition" rows={14} className="textarea-code" spellCheck={false}
              defaultValue={JSON.stringify(rule?.condition ?? example, null, 2)} />
          </div>
        </fieldset>
        <FormError error={state.error} />
        {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
        {!readOnly && <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>}
        {readOnly && <p className="text-sm text-slate-500">Published rules can only be edited by a reviewer.</p>}
      </div>

      <aside className="card space-y-3 text-xs">
        <h2 className="text-sm font-semibold">Condition reference</h2>
        <p className="text-slate-600">
          Combine with <code>{"{ all: [...] }"}</code>, <code>{"{ any: [...] }"}</code>, <code>{"{ not: {...} }"}</code>.
          Each check is <code>{"{ fact, op, value }"}</code>. Missing values (e.g. no lab result) never match — use{" "}
          <code>notExists</code> to target them.
        </p>
        <p><strong>Operators:</strong> {OPERATORS.join(", ")}</p>
        <dl className="space-y-1.5">
          {Object.entries(FACTS).map(([fact, desc]) => (
            <div key={fact}>
              <dt className="font-mono font-semibold text-brand-700">{fact}</dt>
              <dd className="text-slate-600">{desc}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </form>
  );
}
