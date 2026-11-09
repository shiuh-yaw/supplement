"use client";

import { useState } from "react";
import {
  ALLERGEN_LABELS,
  CONDITION_LABELS,
  COUNTRY_LABELS,
  CURRENCY_BY_COUNTRY,
  DIET_LABELS,
  GOAL_LABELS,
  MEDICATION_LABELS,
  type Allergen,
  type Country,
  type Diet,
  type Goal,
  type HealthCondition,
  type MedicationClass,
  type RecommendationResult,
  type UserProfileInput,
} from "@supplement/engine";
import { Results } from "./Results";

type ProteinMode = "grams" | "portions" | "unknown";

interface FormState {
  age: string;
  sex: "male" | "female" | "";
  weightKg: string;
  country: Country;
  goal: Goal | "";
  trainingDaysPerWeek: string;
  diet: Diet;
  proteinMode: ProteinMode;
  dietaryProteinG: string;
  portions: string;
  lactoseIntolerant: boolean;
  allergies: Allergen[];
  halalRequired: boolean;
  monthlyBudget: string;
  conditions: HealthCondition[];
  medications: MedicationClass[];
  egfr: string;
  creatinineUmolL: string;
  altUL: string;
  uricAcidUmolL: string;
  hba1cPercent: string;
  consent: boolean;
}

const initial: FormState = {
  age: "",
  sex: "",
  weightKg: "",
  country: "MY",
  goal: "",
  trainingDaysPerWeek: "3",
  diet: "omnivore",
  proteinMode: "portions",
  dietaryProteinG: "",
  portions: "2",
  lactoseIntolerant: false,
  allergies: [],
  halalRequired: false,
  monthlyBudget: "",
  conditions: [],
  medications: [],
  egfr: "",
  creatinineUmolL: "",
  altUL: "",
  uricAcidUmolL: "",
  hba1cPercent: "",
  consent: false,
};

const STEPS = ["About you", "Goal", "Diet", "Health"] as const;

const num = (v: string): number | undefined => (v.trim() === "" ? undefined : Number(v));

function toProfile(f: FormState): UserProfileInput {
  let dietaryProteinG: number | undefined;
  if (f.proteinMode === "grams") dietaryProteinG = num(f.dietaryProteinG);
  // ≈25 g per palm-sized portion of meat/fish/tofu/eggs, plus ≈15 g from rice, bread, milk etc.
  if (f.proteinMode === "portions") dietaryProteinG = Number(f.portions) * 25 + 15;

  const labs = {
    egfr: num(f.egfr),
    creatinineUmolL: num(f.creatinineUmolL),
    altUL: num(f.altUL),
    uricAcidUmolL: num(f.uricAcidUmolL),
    hba1cPercent: num(f.hba1cPercent),
  };

  return {
    age: Number(f.age),
    sex: f.sex as "male" | "female",
    weightKg: Number(f.weightKg),
    country: f.country,
    goal: f.goal as Goal,
    trainingDaysPerWeek: Number(f.trainingDaysPerWeek),
    diet: f.diet,
    dietaryProteinG,
    lactoseIntolerant: f.lactoseIntolerant,
    allergies: f.allergies,
    halalRequired: f.halalRequired,
    monthlyBudget: num(f.monthlyBudget),
    conditions: f.conditions,
    medications: f.medications,
    labs,
  };
}

function stepError(step: number, f: FormState): string | null {
  if (step === 0) {
    const age = Number(f.age);
    const weight = Number(f.weightKg);
    if (!f.age || !Number.isInteger(age) || age < 10 || age > 110) return "Please enter your age (10–110).";
    if (!f.sex) return "Please choose your sex.";
    if (!f.weightKg || weight < 25 || weight > 300) return "Please enter your weight in kg.";
  }
  if (step === 1 && !f.goal) return "Please choose a goal.";
  if (step === 2 && f.proteinMode === "grams" && !f.dietaryProteinG) return "Enter grams of protein, or pick another option.";
  if (step === 3 && !f.consent) return "Please confirm you understand this isn't medical advice.";
  return null;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function Questionnaire() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toProfile(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data as RecommendationResult);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    const err = stepError(step, form);
    setError(err);
    if (err) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else void submit();
  }

  if (result) {
    return (
      <Results
        result={result}
        onRestart={() => {
          setResult(null);
          setStep(0);
        }}
      />
    );
  }

  const currency = CURRENCY_BY_COUNTRY[form.country];

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 grid grid-cols-4 gap-2 text-xs font-medium">
        {STEPS.map((label, i) => (
          <li key={label} className="space-y-1.5">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
            <span className={i === step ? "text-brand-700" : "text-slate-500"}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="card space-y-6">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">About you</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="age">Age</label>
                <input id="age" className="input" type="number" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="weight">Weight (kg)</label>
                <input id="weight" className="input" type="number" inputMode="decimal" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
              </div>
            </div>
            <fieldset>
              <legend className="label">Sex</legend>
              <div className="flex gap-2">
                {(["male", "female"] as const).map((s) => (
                  <button key={s} type="button" className={`chip ${form.sex === s ? "chip-on" : ""}`} onClick={() => setForm((f) => ({ ...f, sex: s, conditions: s === "male" ? f.conditions.filter((c) => c !== "pregnant" && c !== "breastfeeding") : f.conditions }))}>
                    {s === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label className="label" htmlFor="country">Country</label>
              <select id="country" className="input" value={form.country} onChange={(e) => set("country", e.target.value as Country)}>
                {Object.entries(COUNTRY_LABELS).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">What&apos;s your main goal?</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([g, label]) => (
                <button key={g} type="button" className={`chip text-left ${form.goal === g ? "chip-on" : ""}`} onClick={() => set("goal", g)}>
                  {label}
                </button>
              ))}
            </div>
            <div>
              <label className="label" htmlFor="days">
                Workouts per week: <strong>{form.trainingDaysPerWeek}</strong>
              </label>
              <input id="days" type="range" min={0} max={7} className="w-full accent-brand-600" value={form.trainingDaysPerWeek} onChange={(e) => set("trainingDaysPerWeek", e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Your diet</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DIET_LABELS) as [Diet, string][]).map(([d, label]) => (
                <button key={d} type="button" className={`chip ${form.diet === d ? "chip-on" : ""}`} onClick={() => set("diet", d)}>
                  {label}
                </button>
              ))}
            </div>

            <fieldset className="space-y-3">
              <legend className="label">How much protein do you already eat?</legend>
              <div className="flex flex-wrap gap-2">
                {([
                  ["portions", "Estimate for me"],
                  ["grams", "I know the grams"],
                  ["unknown", "No idea"],
                ] as const).map(([mode, label]) => (
                  <button key={mode} type="button" className={`chip ${form.proteinMode === mode ? "chip-on" : ""}`} onClick={() => set("proteinMode", mode)}>
                    {label}
                  </button>
                ))}
              </div>
              {form.proteinMode === "portions" && (
                <div>
                  <label className="label" htmlFor="portions">
                    Palm-sized portions of meat, fish, eggs, tofu or tempeh per day: <strong>{form.portions}</strong>
                  </label>
                  <input id="portions" type="range" min={0} max={6} className="w-full accent-brand-600" value={form.portions} onChange={(e) => set("portions", e.target.value)} />
                  <p className="text-xs text-slate-500">≈ {Number(form.portions) * 25 + 15} g protein/day</p>
                </div>
              )}
              {form.proteinMode === "grams" && (
                <input className="input" type="number" placeholder="grams per day" value={form.dietaryProteinG} onChange={(e) => set("dietaryProteinG", e.target.value)} />
              )}
            </fieldset>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-brand-600" checked={form.halalRequired} onChange={(e) => set("halalRequired", e.target.checked)} />
                I need halal-certified products
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-brand-600" checked={form.lactoseIntolerant} onChange={(e) => set("lactoseIntolerant", e.target.checked)} />
                I&apos;m lactose intolerant
              </label>
            </div>

            <fieldset>
              <legend className="label">Allergies</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(ALLERGEN_LABELS) as [Allergen, string][]).map(([a, label]) => (
                  <button key={a} type="button" className={`chip ${form.allergies.includes(a) ? "chip-on" : ""}`} onClick={() => set("allergies", toggle(form.allergies, a))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="budget">Monthly supplement budget ({currency}, optional)</label>
              <input id="budget" className="input" type="number" value={form.monthlyBudget} onChange={(e) => set("monthlyBudget", e.target.value)} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-semibold">Your health</h2>
              <p className="mt-1 text-sm text-slate-600">This is how we keep you safe. Leave blank anything you don&apos;t know.</p>
            </div>
            <fieldset>
              <legend className="label">Do any of these apply?</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(CONDITION_LABELS) as [HealthCondition, string][])
                  .filter(([c]) => form.sex === "female" || (c !== "pregnant" && c !== "breastfeeding"))
                  .map(([c, label]) => (
                    <button key={c} type="button" className={`chip ${form.conditions.includes(c) ? "chip-on" : ""}`} onClick={() => set("conditions", toggle(form.conditions, c))}>
                      {label}
                    </button>
                  ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Do you take any of these regularly?</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(MEDICATION_LABELS) as [MedicationClass, string][]).map(([m, label]) => (
                  <button key={m} type="button" className={`chip ${form.medications.includes(m) ? "chip-on" : ""}`} onClick={() => set("medications", toggle(form.medications, m))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <details className="rounded-xl border border-slate-200 p-4" open={Boolean(form.egfr || form.altUL)}>
              <summary className="cursor-pointer text-sm font-semibold text-brand-700">
                Add numbers from your blood test report (optional)
              </summary>
              <p className="mt-2 text-xs text-slate-500">
                Look for these names on your lab report. Check the units match — if they don&apos;t, leave it blank.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {([
                  ["egfr", "eGFR (mL/min/1.73m²)", "Kidney function"],
                  ["creatinineUmolL", "Creatinine (µmol/L)", "Kidney marker"],
                  ["altUL", "ALT / SGPT (U/L)", "Liver enzyme"],
                  ["uricAcidUmolL", "Uric acid (µmol/L)", "Gout risk"],
                  ["hba1cPercent", "HbA1c (%)", "Blood sugar, 3-month average"],
                ] as const).map(([key, label, hint]) => (
                  <div key={key}>
                    <label className="label" htmlFor={key}>{label}</label>
                    <input id={key} className="input" type="number" inputMode="decimal" step="any" value={form[key]} onChange={(e) => set(key, e.target.value)} />
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                  </div>
                ))}
              </div>
            </details>

            <label className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <input type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
              I understand this is general education, not medical advice, and I&apos;ll check with a healthcare professional before
              starting a supplement. My answers are used only to calculate this result and aren&apos;t stored.
            </label>
          </>
        )}

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="flex justify-between">
          <button type="button" className="btn-ghost" disabled={step === 0 || loading} onClick={() => { setError(null); setStep(step - 1); }}>
            Back
          </button>
          <button type="button" className="btn-primary" disabled={loading} onClick={next}>
            {step === STEPS.length - 1 ? (loading ? "Checking…" : "See my results") : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
