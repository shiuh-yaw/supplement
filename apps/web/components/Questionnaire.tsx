"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALLERGEN_LABELS,
  CONDITION_LABELS,
  COUNTRY_LABELS,
  CURRENCY_BY_COUNTRY,
  DIET_LABELS,
  GOAL_LABELS,
  LAB_UNIT_LABELS,
  LAB_UNIT_SPECS,
  MEDICATION_LABELS,
  suggestOtherUnit,
  type Allergen,
  type ConvertibleLab,
  type Country,
  type Diet,
  type Goal,
  type HealthCondition,
  type LabUnit,
  type MedicationClass,
  type RecommendationResult,
  type UserProfileInput,
} from "@supplement/engine";
import {
  FIELD_LABELS,
  FIELD_STEP,
  STEPS,
  errorsForStep,
  fieldFromIssuePath,
  initialForm,
  labUnit,
  toProfile,
  validate,
  type FieldErrors,
  type FieldKey,
  type FormState,
} from "@/lib/form";
import { readSharedProfile } from "@/lib/share";
import { Results } from "./Results";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

const LAB_FIELDS = ["egfr", "creatinineUmolL", "altUL", "uricAcidUmolL", "hba1cPercent"] as const;

export function Questionnaire() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [profile, setProfile] = useState<UserProfileInput | null>(null);
  const [shared, setShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in FIELD_STEP) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function fetchResult(p: UserProfileInput): Promise<boolean> {
    setLoading(true);
    setFormError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (res.status === 422 && Array.isArray(data.issues)) {
        // Shouldn't happen after client validation, but point at the field if it does.
        const fieldErrors: FieldErrors = {};
        for (const issue of data.issues as { path: (string | number)[]; message: string }[]) {
          const field = fieldFromIssuePath(issue.path);
          if (field) fieldErrors[field] = `${FIELD_LABELS[field]}: ${issue.message}`;
        }
        showErrors(fieldErrors);
        return false;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data as RecommendationResult);
      setProfile(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? `${e.message} Please try again.` : "Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Open a shared result link (#r=...) straight to its results.
  useEffect(() => {
    const p = readSharedProfile(window.location.hash);
    if (p) {
      setShared(true);
      void fetchResult(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showErrors(all: FieldErrors) {
    const keys = Object.keys(all) as FieldKey[];
    setErrors(all);
    if (keys.length === 0) return;
    const firstStep = Math.min(...keys.map((k) => FIELD_STEP[k]));
    setStep(firstStep);
    if (keys.some((k) => (LAB_FIELDS as readonly string[]).includes(k))) setLabsOpen(true);
    const firstKey = keys.find((k) => FIELD_STEP[k] === firstStep);
    // Focus the first field with a problem once the step has rendered.
    setTimeout(() => {
      const el = firstKey ? document.getElementById(firstKey) : null;
      (el ?? cardRef.current)?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function next() {
    setFormError(null);
    const all = validate(form);
    const current = errorsForStep(all, step);
    if (Object.keys(current).length) return showErrors(current);
    setErrors({});
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    if (Object.keys(all).length) return showErrors(all);
    void fetchResult(toProfile(form));
  }

  function restart() {
    setResult(null);
    setProfile(null);
    setShared(false);
    setStep(0);
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  }

  if (result && profile) {
    return <Results result={result} profile={profile} shared={shared} onRestart={restart} />;
  }
  if (shared && loading) {
    return <p className="text-center text-slate-600">Loading shared results…</p>;
  }

  const currency = CURRENCY_BY_COUNTRY[form.country];
  const invalid = (key: FieldKey) =>
    errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${key}-error` } : {};
  const errorCount = Object.values(errors).filter(Boolean).length;

  function setUnit(lab: ConvertibleLab, unit: LabUnit) {
    setForm((f) => ({ ...f, labUnits: { ...f.labUnits, [lab]: unit } }));
    setErrors((e) => ({ ...e, [lab]: undefined }));
  }

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

      <div ref={cardRef} tabIndex={-1} className="card space-y-6 outline-none">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">About you</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="age">Age</label>
                <input id="age" className="input" type="number" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} {...invalid("age")} />
                <FieldError id="age" message={errors.age} />
              </div>
              <div>
                <label className="label" htmlFor="weightKg">Weight (kg)</label>
                <input id="weightKg" className="input" type="number" inputMode="decimal" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} {...invalid("weightKg")} />
                <FieldError id="weightKg" message={errors.weightKg} />
              </div>
            </div>
            <fieldset id="sex" tabIndex={-1} className="outline-none">
              <legend className="label">Sex</legend>
              <div className="flex gap-2">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={form.sex === s}
                    className={`chip ${form.sex === s ? "chip-on" : ""}`}
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        sex: s,
                        conditions: s === "male" ? f.conditions.filter((c) => c !== "pregnant" && c !== "breastfeeding") : f.conditions,
                      }));
                      setErrors((e) => ({ ...e, sex: undefined }));
                    }}
                  >
                    {s === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
              <FieldError id="sex" message={errors.sex} />
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
            <div id="goal" tabIndex={-1} className="grid gap-2 outline-none sm:grid-cols-2">
              {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([g, label]) => (
                <button key={g} type="button" aria-pressed={form.goal === g} className={`chip text-left ${form.goal === g ? "chip-on" : ""}`} onClick={() => set("goal", g)}>
                  {label}
                </button>
              ))}
            </div>
            <FieldError id="goal" message={errors.goal} />
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
                <button key={d} type="button" aria-pressed={form.diet === d} className={`chip ${form.diet === d ? "chip-on" : ""}`} onClick={() => set("diet", d)}>
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
                  <button key={mode} type="button" aria-pressed={form.proteinMode === mode} className={`chip ${form.proteinMode === mode ? "chip-on" : ""}`} onClick={() => { set("proteinMode", mode); setErrors((e) => ({ ...e, dietaryProteinG: undefined })); }}>
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
                <div>
                  <label className="sr-only" htmlFor="dietaryProteinG">Protein from food (grams per day)</label>
                  <input id="dietaryProteinG" className="input" type="number" inputMode="decimal" placeholder="grams per day" value={form.dietaryProteinG} onChange={(e) => set("dietaryProteinG", e.target.value)} {...invalid("dietaryProteinG")} />
                  <FieldError id="dietaryProteinG" message={errors.dietaryProteinG} />
                </div>
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
                  <button key={a} type="button" aria-pressed={form.allergies.includes(a)} className={`chip ${form.allergies.includes(a) ? "chip-on" : ""}`} onClick={() => set("allergies", toggle(form.allergies, a))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="monthlyBudget">Monthly supplement budget ({currency}, optional)</label>
              <input id="monthlyBudget" className="input" type="number" inputMode="decimal" value={form.monthlyBudget} onChange={(e) => set("monthlyBudget", e.target.value)} {...invalid("monthlyBudget")} />
              <FieldError id="monthlyBudget" message={errors.monthlyBudget} />
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
                    <button key={c} type="button" aria-pressed={form.conditions.includes(c)} className={`chip ${form.conditions.includes(c) ? "chip-on" : ""}`} onClick={() => set("conditions", toggle(form.conditions, c))}>
                      {label}
                    </button>
                  ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Do you take any of these regularly?</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(MEDICATION_LABELS) as [MedicationClass, string][]).map(([m, label]) => (
                  <button key={m} type="button" aria-pressed={form.medications.includes(m)} className={`chip ${form.medications.includes(m) ? "chip-on" : ""}`} onClick={() => set("medications", toggle(form.medications, m))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <details className="rounded-xl border border-slate-200 p-4" open={labsOpen} onToggle={(e) => setLabsOpen((e.target as HTMLDetailsElement).open)}>
              <summary className="cursor-pointer text-sm font-semibold text-brand-700">
                Add numbers from your blood test report (optional)
              </summary>
              <p className="mt-2 text-xs text-slate-500">
                Look for these names on your report. For creatinine and uric acid, pick the unit printed next to the number.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {([
                  ["egfr", "eGFR (mL/min/1.73m²)", "Kidney function"],
                  ["creatinineUmolL", "Creatinine", "Kidney marker"],
                  ["altUL", "ALT / SGPT (U/L)", "Liver enzyme"],
                  ["uricAcidUmolL", "Uric acid", "Gout risk"],
                  ["hba1cPercent", "HbA1c (%)", "Blood sugar, 3-month average"],
                ] as const).map(([key, label, hint]) => {
                  const convertible = key === "creatinineUmolL" || key === "uricAcidUmolL";
                  const unit = convertible ? labUnit(form, key) : null;
                  const suggestion =
                    convertible && unit && form[key].trim() !== "" && Number.isFinite(Number(form[key]))
                      ? suggestOtherUnit(key, Number(form[key]), unit)
                      : null;
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor={key}>{label}</label>
                        {convertible && unit && (
                          <div role="group" aria-label={`${label} unit`} className="flex overflow-hidden rounded-lg border border-slate-300 text-xs">
                            {(["umol", "mgdl"] as const).map((u) => (
                              <button
                                key={u}
                                type="button"
                                aria-pressed={unit === u}
                                className={`px-2 py-1 ${unit === u ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}
                                onClick={() => setUnit(key as ConvertibleLab, u)}
                              >
                                {LAB_UNIT_LABELS[u]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input id={key} className="input" type="number" inputMode="decimal" step="any" value={form[key]} onChange={(e) => set(key, e.target.value)} {...invalid(key)} />
                      {suggestion ? (
                        <div id={`${key}-error`} className="mt-1 rounded-lg bg-amber-50 p-2 text-sm text-amber-900" role="alert">
                          This looks like {LAB_UNIT_LABELS[suggestion]}.{" "}
                          <button type="button" className="font-semibold underline" onClick={() => setUnit(key as ConvertibleLab, suggestion)}>
                            Switch to {LAB_UNIT_LABELS[suggestion]}
                          </button>
                        </div>
                      ) : (
                        <FieldError id={key} message={errors[key]} />
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {hint}
                        {convertible && unit && (
                          <> · typical {LAB_UNIT_SPECS[key].typical[unit].join("–")} {LAB_UNIT_LABELS[unit]}</>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </details>

            <div>
              <label className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <input id="consent" type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} {...invalid("consent")} />
                I understand this is general education, not medical advice, and I&apos;ll check with a healthcare professional before
                starting a supplement. My answers are used only to calculate this result and aren&apos;t stored.
              </label>
              <FieldError id="consent" message={errors.consent} />
            </div>
          </>
        )}

        {errorCount > 0 && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Please fix the {errorCount === 1 ? "highlighted field" : `${errorCount} highlighted fields`} above.
          </p>
        )}
        {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{formError}</p>}

        <div className="flex justify-between">
          <button type="button" className="btn-ghost" disabled={step === 0 || loading} onClick={() => { setErrors({}); setFormError(null); setStep(step - 1); }}>
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
