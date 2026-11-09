"use client";

import { useFormAction } from "@/components/useFormAction";
import { FormError } from "@/components/FormError";
import { simulate, type SimState } from "./actions";

const EXAMPLE = {
  age: 52,
  sex: "male",
  weightKg: 80,
  country: "MY",
  goal: "strength",
  trainingDaysPerWeek: 3,
  diet: "omnivore",
  dietaryProteinG: 100,
  lactoseIntolerant: false,
  allergies: [],
  halalRequired: true,
  monthlyBudget: 300,
  conditions: ["hypertension"],
  medications: ["diuretic"],
  labs: { egfr: 72 },
};

const STATUS_CLS: Record<string, string> = {
  recommended: "text-brand-700",
  blocked: "text-red-700",
  not_needed: "text-slate-500",
  not_recommended: "text-slate-500",
};

export default function SimulatorPage() {
  const [state, action, pending] = useFormAction(simulate, {});
  const r = state.result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulator</h1>
        <p className="text-sm text-slate-600">Test a profile against the live rules — or include drafts to check a rule before you submit it.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={action} className="card space-y-3">
          <label className="label" htmlFor="profile">Profile (JSON)</label>
          <textarea id="profile" name="profile" rows={22} className="textarea-code" spellCheck={false} defaultValue={JSON.stringify(EXAMPLE, null, 2)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="drafts" className="accent-brand-600" /> Include draft and pending rules
          </label>
          <FormError error={state.error} />
          <button className="btn-primary" disabled={pending}>{pending ? "Running…" : "Run"}</button>
        </form>

        <div className="space-y-4">
          {state.problems && state.problems.length > 0 && <FormError error={state.problems} />}
          {r && (
            <>
              {[...r.generalBlocks, ...r.generalCautions].length > 0 && (
                <div className="card text-sm">
                  <h2 className="font-semibold">General</h2>
                  {r.generalBlocks.map((n) => <p key={n.ruleId} className="text-red-700">BLOCK [{n.ruleId}] {n.message}</p>)}
                  {r.generalCautions.map((n) => <p key={n.ruleId} className="text-amber-800">CAUTION [{n.ruleId}] {n.message}</p>)}
                </div>
              )}
              {r.items.map((i) => (
                <div key={i.supplement.slug} className="card space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{i.supplement.name}</h2>
                    <span className={`font-semibold ${STATUS_CLS[i.status]}`}>{i.status}</span>
                  </div>
                  {i.dose && <p><strong>Dose:</strong> {i.dose.text}</p>}
                  {i.blocks.map((n) => <p key={n.ruleId} className="text-red-700">BLOCK [{n.ruleId}] {n.message}</p>)}
                  {i.cautions.map((n) => <p key={n.ruleId} className="text-amber-800">CAUTION [{n.ruleId}] {n.message}</p>)}
                  <ul className="list-disc pl-5 text-slate-600">{i.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
                  {i.products.length > 0 && (
                    <ol className="list-decimal pl-5">
                      {i.products.map((p) => (
                        <li key={p.product.id}>
                          {p.product.name} — score {p.score}, {p.price.currency} {p.costPerMonth}/month
                        </li>
                      ))}
                    </ol>
                  )}
                  {i.productsNote && <p className="text-slate-500">{i.productsNote}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
