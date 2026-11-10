"use client";

import { useEffect, useRef, useState } from "react";
import {
  CURRENCY_BY_COUNTRY,
  LAB_UNIT_SPECS,
  labUnitLabel,
  suggestOtherUnit,
  type Allergen,
  type ConvertibleLab,
  type Country,
  type CurrentSupplement,
  type Diet,
  type Goal,
  type HealthCondition,
  type LabUnit,
  type MedicationClass,
  type RecommendationResult,
  type UserProfileInput,
} from "@supplement/engine";
import { useI18n } from "@/lib/i18n/context";
import {
  FIELD_STEP,
  STEPS,
  errorsForStep,
  fieldFromIssuePath,
  initialForm,
  isConvertible,
  labUnit,
  toProfile,
  validate,
  type FieldErrors,
  type FieldKey,
  type FormState,
} from "@/lib/form";
import { isOwnLink, readSharedProfile } from "@/lib/share";
import { LabUpload, type ExtractResult } from "./LabUpload";
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

const LAB_FIELDS = [
  "egfr",
  "creatinineUmolL",
  "altUL",
  "uricAcidUmolL",
  "hba1cPercent",
  "vitaminDNmolL",
  "ferritinUgL",
  "b12PmolL",
] as const;

const FISH_VALUES = ["0", "1", "2"] as const;

export function Questionnaire() {
  const { m: msg, labels, locale } = useI18n();
  const m = msg.q;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [profile, setProfile] = useState<UserProfileInput | null>(null);
  const [shared, setShared] = useState(false);
  /** Lab fields filled from an uploaded report, highlighted until the user edits them. */
  const [fromReport, setFromReport] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFromReport((s) => (s.has(key) ? new Set([...s].filter((k) => k !== key)) : s));
    if (key in FIELD_STEP) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function fetchResult(p: UserProfileInput): Promise<boolean> {
    setLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/recommend?lang=${locale}`, {
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
          if (field) fieldErrors[field] = `${msg.errors.fieldLabels[field]}: ${issue.message}`;
        }
        showErrors(fieldErrors);
        return false;
      }
      if (!res.ok) throw new Error(data.error ?? m.somethingWrong);
      setResult(data as RecommendationResult);
      setProfile(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? `${e.message} ${m.tryAgain}` : `${m.somethingWrong} ${m.tryAgain}`);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Open a shared result link (#r=...) straight to its results.
  useEffect(() => {
    const p = readSharedProfile(window.location.hash);
    if (p) {
      setShared(!isOwnLink(window.location.hash));
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
    const all = validate(form, msg.errors);
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

  function leaveResults() {
    setResult(null);
    setProfile(null);
    setShared(false);
    setErrors({});
    setStep(0);
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  }

  /** Clear everything and begin a fresh check. */
  function restart() {
    leaveResults();
    setForm(initialForm);
    setFromReport(new Set());
    setLabsOpen(false);
  }

  if (result && profile) {
    return (
      <Results
        result={result}
        profile={profile}
        shared={shared}
        onRestart={restart}
        onEdit={shared ? undefined : leaveResults}
      />
    );
  }
  if (loading && !result && typeof window !== "undefined" && readSharedProfile(window.location.hash)) {
    return <p className="text-center text-slate-600">{m.loadingResults}</p>;
  }

  const currency = CURRENCY_BY_COUNTRY[form.country];
  const invalid = (key: FieldKey) =>
    errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${key}-error` } : {};
  const errorCount = Object.values(errors).filter(Boolean).length;

  function applyExtract(r: ExtractResult) {
    setForm((f) => ({ ...f, ...r.values, labUnits: { ...f.labUnits, ...r.units } }));
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(r.values).map((k) => [k, undefined])) }));
    setFromReport(new Set(Object.keys(r.values)));
    setLabsOpen(true);
  }

  function setUnit(lab: ConvertibleLab, unit: LabUnit) {
    setForm((f) => ({ ...f, labUnits: { ...f.labUnits, [lab]: unit } }));
    setErrors((e) => ({ ...e, [lab]: undefined }));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 grid grid-cols-4 gap-2 text-xs font-medium">
        {STEPS.map((_, i) => (
          <li key={i} className="space-y-1.5">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
            <span className={i === step ? "text-brand-700" : "text-slate-500"}>{m.steps[i]}</span>
          </li>
        ))}
      </ol>

      <div ref={cardRef} tabIndex={-1} className="card space-y-6 outline-none">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">{m.aboutYou}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="age">{m.age}</label>
                <input id="age" className="input" type="number" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} {...invalid("age")} />
                <FieldError id="age" message={errors.age} />
              </div>
              <div>
                <label className="label" htmlFor="weightKg">{m.weight}</label>
                <input id="weightKg" className="input" type="number" inputMode="decimal" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} {...invalid("weightKg")} />
                <FieldError id="weightKg" message={errors.weightKg} />
              </div>
            </div>
            <fieldset id="sex" tabIndex={-1} className="outline-none">
              <legend className="label">{m.sex}</legend>
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
                    {s === "male" ? m.male : m.female}
                  </button>
                ))}
              </div>
              <FieldError id="sex" message={errors.sex} />
            </fieldset>
            <div>
              <label className="label" htmlFor="country">{m.country}</label>
              <select id="country" className="input" value={form.country} onChange={(e) => set("country", e.target.value as Country)}>
                {Object.entries(labels.countries).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">{m.goalQ}</h2>
            <div id="goal" tabIndex={-1} className="grid gap-2 outline-none sm:grid-cols-2">
              {(Object.entries(labels.goals) as [Goal, string][]).map(([g, label]) => (
                <button key={g} type="button" aria-pressed={form.goal === g} className={`chip text-left ${form.goal === g ? "chip-on" : ""}`} onClick={() => set("goal", g)}>
                  {label}
                </button>
              ))}
            </div>
            <FieldError id="goal" message={errors.goal} />
            <div>
              <label className="label" htmlFor="days">
                {m.workouts} <strong>{form.trainingDaysPerWeek}</strong>
              </label>
              <input id="days" type="range" min={0} max={7} className="w-full accent-brand-600" value={form.trainingDaysPerWeek} onChange={(e) => set("trainingDaysPerWeek", e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">{m.diet}</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(labels.diets) as [Diet, string][]).map(([d, label]) => (
                <button key={d} type="button" aria-pressed={form.diet === d} className={`chip ${form.diet === d ? "chip-on" : ""}`} onClick={() => set("diet", d)}>
                  {label}
                </button>
              ))}
            </div>

            {form.diet !== "vegan" && (
              <fieldset>
                <legend className="label">{m.fishQ}</legend>
                <div className="flex flex-wrap gap-2">
                  {FISH_VALUES.map((v, i) => (
                    <button key={v} type="button" aria-pressed={form.fishServingsPerWeek === v} className={`chip ${form.fishServingsPerWeek === v ? "chip-on" : ""}`} onClick={() => set("fishServingsPerWeek", form.fishServingsPerWeek === v ? "" : v)}>
                      {m.fish[i]}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="space-y-3">
              <legend className="label">{m.proteinQ}</legend>
              <div className="flex flex-wrap gap-2">
                {(["portions", "grams", "unknown"] as const).map((mode) => (
                  <button key={mode} type="button" aria-pressed={form.proteinMode === mode} className={`chip ${form.proteinMode === mode ? "chip-on" : ""}`} onClick={() => { set("proteinMode", mode); setErrors((e) => ({ ...e, dietaryProteinG: undefined })); }}>
                    {m.proteinModes[mode]}
                  </button>
                ))}
              </div>
              {form.proteinMode === "portions" && (
                <div>
                  <label className="label" htmlFor="portions">
                    {m.portions} <strong>{form.portions}</strong>
                  </label>
                  <input id="portions" type="range" min={0} max={6} className="w-full accent-brand-600" value={form.portions} onChange={(e) => set("portions", e.target.value)} />
                  <p className="text-xs text-slate-500">{m.perDay(Number(form.portions) * 25 + 15)}</p>
                </div>
              )}
              {form.proteinMode === "grams" && (
                <div>
                  <label className="sr-only" htmlFor="dietaryProteinG">{m.proteinFromFood}</label>
                  <input id="dietaryProteinG" className="input" type="number" inputMode="decimal" placeholder={m.gramsPlaceholder} value={form.dietaryProteinG} onChange={(e) => set("dietaryProteinG", e.target.value)} {...invalid("dietaryProteinG")} />
                  <FieldError id="dietaryProteinG" message={errors.dietaryProteinG} />
                </div>
              )}
            </fieldset>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-brand-600" checked={form.halalRequired} onChange={(e) => set("halalRequired", e.target.checked)} />
                {m.halal}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-brand-600" checked={form.lactoseIntolerant} onChange={(e) => set("lactoseIntolerant", e.target.checked)} />
                {m.lactose}
              </label>
            </div>

            <fieldset>
              <legend className="label">{m.allergies}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(labels.allergens) as [Allergen, string][]).map(([a, label]) => (
                  <button key={a} type="button" aria-pressed={form.allergies.includes(a)} className={`chip ${form.allergies.includes(a) ? "chip-on" : ""}`} onClick={() => set("allergies", toggle(form.allergies, a))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="monthlyBudget">{m.budget(currency)}</label>
              <input id="monthlyBudget" className="input" type="number" inputMode="decimal" value={form.monthlyBudget} onChange={(e) => set("monthlyBudget", e.target.value)} {...invalid("monthlyBudget")} />
              <FieldError id="monthlyBudget" message={errors.monthlyBudget} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-semibold">{m.health}</h2>
              <p className="mt-1 text-sm text-slate-600">{m.healthIntro}</p>
            </div>
            <fieldset>
              <legend className="label">{m.conditionsQ}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(labels.conditions) as [HealthCondition, string][])
                  .filter(([c]) => form.sex === "female" || (c !== "pregnant" && c !== "breastfeeding"))
                  .map(([c, label]) => (
                    <button key={c} type="button" aria-pressed={form.conditions.includes(c)} className={`chip ${form.conditions.includes(c) ? "chip-on" : ""}`} onClick={() => set("conditions", toggle(form.conditions, c))}>
                      {label}
                    </button>
                  ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">{m.medsQ}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(labels.medications) as [MedicationClass, string][]).map(([med, label]) => (
                  <button key={med} type="button" aria-pressed={form.medications.includes(med)} className={`chip ${form.medications.includes(med) ? "chip-on" : ""}`} onClick={() => set("medications", toggle(form.medications, med))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">{m.currentQ}</legend>
              <p className="-mt-1 mb-2 text-xs text-slate-500">{m.currentHint}</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(labels.currentSupplements) as [CurrentSupplement, string][]).map(([s, label]) => (
                  <button key={s} type="button" aria-pressed={form.currentSupplements.includes(s)} className={`chip ${form.currentSupplements.includes(s) ? "chip-on" : ""}`} onClick={() => set("currentSupplements", toggle(form.currentSupplements, s))}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <details className="rounded-xl border border-slate-200 p-4" open={labsOpen} onToggle={(e) => setLabsOpen((e.target as HTMLDetailsElement).open)}>
              <summary className="cursor-pointer text-sm font-semibold text-brand-700">
                {m.labsSummary}
              </summary>
              <p className="mt-2 text-xs text-slate-500">
                {m.labsHint}
              </p>
              <LabUpload onExtract={applyExtract} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {LAB_FIELDS.map((key) => {
                  const { label, hint } = m.labs[key];
                  const lab = isConvertible(key) ? key : null;
                  const unit = lab ? labUnit(form, lab) : null;
                  const suggestion =
                    lab && unit && form[key].trim() !== "" && Number.isFinite(Number(form[key]))
                      ? suggestOtherUnit(lab, Number(form[key]), unit)
                      : null;
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor={key}>{label}</label>
                        {lab && unit && (
                          <div role="group" aria-label={m.unitGroup(label)} className="flex overflow-hidden rounded-lg border border-slate-300 text-xs">
                            {(["si", "conv"] as const).map((u) => (
                              <button
                                key={u}
                                type="button"
                                aria-pressed={unit === u}
                                className={`px-2 py-1 ${unit === u ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}
                                onClick={() => setUnit(lab, u)}
                              >
                                {labUnitLabel(lab, u)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input id={key} className={`input ${fromReport.has(key) ? "border-amber-400 bg-amber-50" : ""}`} type="number" inputMode="decimal" step="any" value={form[key]} onChange={(e) => set(key, e.target.value)} {...invalid(key)} />
                      {fromReport.has(key) && <p className="mt-1 text-xs text-amber-800">{m.fromReport}</p>}
                      {lab && suggestion ? (
                        <div id={`${key}-error`} className="mt-1 rounded-lg bg-amber-50 p-2 text-sm text-amber-900" role="alert">
                          {m.looksLike(labUnitLabel(lab, suggestion))}{" "}
                          <button type="button" className="font-semibold underline" onClick={() => setUnit(lab, suggestion)}>
                            {m.switchTo(labUnitLabel(lab, suggestion))}
                          </button>
                        </div>
                      ) : (
                        <FieldError id={key} message={errors[key]} />
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {hint}
                        {lab && unit && (
                          <>{m.typical(LAB_UNIT_SPECS[lab].typical[unit].join("–"), labUnitLabel(lab, unit))}</>
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
                {m.consent}
              </label>
              <FieldError id="consent" message={errors.consent} />
            </div>
          </>
        )}

        {errorCount > 0 && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {m.fixFields(errorCount)}
          </p>
        )}
        {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{formError}</p>}

        <div className="flex justify-between">
          <button type="button" className="btn-ghost" disabled={step === 0 || loading} onClick={() => { setErrors({}); setFormError(null); setStep(step - 1); }}>
            {m.back}
          </button>
          <button type="button" className="btn-primary" disabled={loading} onClick={next}>
            {step === STEPS.length - 1 ? (loading ? m.checking : m.seeResults) : m.next}
          </button>
        </div>
      </div>
    </div>
  );
}
