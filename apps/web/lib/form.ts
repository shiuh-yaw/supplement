import {
  LAB_UNIT_SPECS,
  defaultLabUnit,
  labUnitLabel,
  suggestOtherUnit,
  toSi,
  type Allergen,
  type ConvertibleLab,
  type Country,
  type CurrentSupplement,
  type Diet,
  type Goal,
  type HealthCondition,
  type LabUnit,
  type MedicationClass,
  type UserProfileInput,
} from "@supplement/engine";

export type ProteinMode = "grams" | "portions" | "unknown";

export interface FormState {
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
  /** "" = not answered */
  fishServingsPerWeek: "" | "0" | "1" | "2";
  lactoseIntolerant: boolean;
  allergies: Allergen[];
  halalRequired: boolean;
  monthlyBudget: string;
  conditions: HealthCondition[];
  medications: MedicationClass[];
  currentSupplements: CurrentSupplement[];
  egfr: string;
  creatinineUmolL: string;
  altUL: string;
  uricAcidUmolL: string;
  hba1cPercent: string;
  vitaminDNmolL: string;
  ferritinUgL: string;
  b12PmolL: string;
  /** null = use the usual unit for the selected country. */
  labUnits: Record<ConvertibleLab, LabUnit | null>;
  consent: boolean;
}

export const initialForm: FormState = {
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
  fishServingsPerWeek: "",
  lactoseIntolerant: false,
  allergies: [],
  halalRequired: false,
  monthlyBudget: "",
  conditions: [],
  medications: [],
  currentSupplements: [],
  egfr: "",
  creatinineUmolL: "",
  altUL: "",
  uricAcidUmolL: "",
  hba1cPercent: "",
  vitaminDNmolL: "",
  ferritinUgL: "",
  b12PmolL: "",
  labUnits: { creatinineUmolL: null, uricAcidUmolL: null, vitaminDNmolL: null, b12PmolL: null },
  consent: false,
};

export const STEPS = ["About you", "Goal", "Diet", "Health"] as const;

export type FieldKey =
  | "age"
  | "sex"
  | "weightKg"
  | "goal"
  | "dietaryProteinG"
  | "monthlyBudget"
  | "egfr"
  | "creatinineUmolL"
  | "altUL"
  | "uricAcidUmolL"
  | "hba1cPercent"
  | "vitaminDNmolL"
  | "ferritinUgL"
  | "b12PmolL"
  | "consent";

export const FIELD_STEP: Record<FieldKey, number> = {
  age: 0,
  sex: 0,
  weightKg: 0,
  goal: 1,
  dietaryProteinG: 2,
  monthlyBudget: 2,
  egfr: 3,
  creatinineUmolL: 3,
  altUL: 3,
  uricAcidUmolL: 3,
  hba1cPercent: 3,
  vitaminDNmolL: 3,
  ferritinUgL: 3,
  b12PmolL: 3,
  consent: 3,
};

export const FIELD_LABELS: Record<FieldKey, string> = {
  age: "Age",
  sex: "Sex",
  weightKg: "Weight",
  goal: "Goal",
  dietaryProteinG: "Protein from food",
  monthlyBudget: "Monthly budget",
  egfr: "eGFR",
  creatinineUmolL: "Creatinine",
  altUL: "ALT / SGPT",
  uricAcidUmolL: "Uric acid",
  hba1cPercent: "HbA1c",
  vitaminDNmolL: "Vitamin D",
  ferritinUgL: "Ferritin",
  b12PmolL: "Vitamin B12",
  consent: "Confirmation",
};

export type FieldErrors = Partial<Record<FieldKey, string>>;

export const labUnit = (f: FormState, lab: ConvertibleLab): LabUnit => f.labUnits[lab] ?? defaultLabUnit(f.country);

export const CONVERTIBLE_LABS: ConvertibleLab[] = ["creatinineUmolL", "uricAcidUmolL", "vitaminDNmolL", "b12PmolL"];
export const isConvertible = (key: string): key is ConvertibleLab => (CONVERTIBLE_LABS as string[]).includes(key);

const num = (v: string): number | undefined => (v.trim() === "" ? undefined : Number(v));

/** Range accepted by the engine, per lab, in SI units. */
const LAB_RANGES = {
  egfr: { min: 1, max: 200, unit: "mL/min/1.73m²" },
  altUL: { min: 1, max: 5000, unit: "U/L" },
  hba1cPercent: { min: 3, max: 20, unit: "%" },
  ferritinUgL: { min: 1, max: 5000, unit: "µg/L (ng/mL)" },
  creatinineUmolL: { min: 10, max: 2000 },
  uricAcidUmolL: { min: 50, max: 1500 },
  vitaminDNmolL: { min: 5, max: 500 },
  b12PmolL: { min: 20, max: 3000 },
} as const;

/** Lab value in SI units (µmol/L for creatinine and uric acid), or undefined if blank. */
function labValue(f: FormState, key: keyof typeof LAB_RANGES): number | undefined {
  const raw = num(f[key]);
  if (raw === undefined) return undefined;
  if (isConvertible(key)) return toSi(key, raw, labUnit(f, key));
  return raw;
}

export function toProfile(f: FormState): UserProfileInput {
  let dietaryProteinG: number | undefined;
  if (f.proteinMode === "grams") dietaryProteinG = num(f.dietaryProteinG);
  // ≈25 g per palm-sized portion of meat/fish/tofu/eggs, plus ≈15 g from rice, bread, milk etc.
  if (f.proteinMode === "portions") dietaryProteinG = Number(f.portions) * 25 + 15;

  return {
    age: Number(f.age),
    sex: f.sex as "male" | "female",
    weightKg: Number(f.weightKg),
    country: f.country,
    goal: f.goal as Goal,
    trainingDaysPerWeek: Number(f.trainingDaysPerWeek),
    diet: f.diet,
    dietaryProteinG,
    fishServingsPerWeek: f.diet === "vegan" || f.fishServingsPerWeek === "" ? undefined : Number(f.fishServingsPerWeek),
    lactoseIntolerant: f.lactoseIntolerant,
    allergies: f.allergies,
    halalRequired: f.halalRequired,
    monthlyBudget: num(f.monthlyBudget),
    conditions: f.conditions,
    medications: f.medications,
    currentSupplements: f.currentSupplements,
    labs: {
      egfr: labValue(f, "egfr"),
      creatinineUmolL: labValue(f, "creatinineUmolL"),
      altUL: labValue(f, "altUL"),
      uricAcidUmolL: labValue(f, "uricAcidUmolL"),
      hba1cPercent: labValue(f, "hba1cPercent"),
      vitaminDNmolL: labValue(f, "vitaminDNmolL"),
      ferritinUgL: labValue(f, "ferritinUgL"),
      b12PmolL: labValue(f, "b12PmolL"),
    },
  };
}

const isNumber = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));

/** Every problem with the form, keyed by field, with a message that says how to fix it. */
export function validate(f: FormState): FieldErrors {
  const e: FieldErrors = {};

  const age = Number(f.age);
  if (!isNumber(f.age) || !Number.isInteger(age) || age < 10 || age > 110) e.age = "Enter your age in years (10–110).";
  if (!f.sex) e.sex = "Choose one.";
  const weight = Number(f.weightKg);
  if (!isNumber(f.weightKg) || weight < 25 || weight > 300) e.weightKg = "Enter your weight in kg (25–300).";

  if (!f.goal) e.goal = "Choose your main goal.";

  if (f.proteinMode === "grams") {
    const g = Number(f.dietaryProteinG);
    if (!isNumber(f.dietaryProteinG) || g < 0 || g > 500) {
      e.dietaryProteinG = "Enter grams of protein per day (0–500), or choose “Estimate for me”.";
    }
  }
  if (f.monthlyBudget.trim() !== "" && (!isNumber(f.monthlyBudget) || Number(f.monthlyBudget) < 0)) {
    e.monthlyBudget = "Enter a number, or leave it blank.";
  }

  for (const key of ["egfr", "altUL", "hba1cPercent", "ferritinUgL"] as const) {
    if (f[key].trim() === "") continue;
    const r = LAB_RANGES[key];
    const v = Number(f[key]);
    if (!isNumber(f[key]) || v < r.min || v > r.max) {
      e[key] = `Expected a number between ${r.min} and ${r.max} ${r.unit}. Check your report, or leave it blank.`;
    }
  }

  for (const key of CONVERTIBLE_LABS) {
    if (f[key].trim() === "") continue;
    const unit = labUnit(f, key);
    if (!isNumber(f[key])) {
      e[key] = "Enter a number, or leave it blank.";
      continue;
    }
    const raw = Number(f[key]);
    const other = suggestOtherUnit(key, raw, unit);
    if (other) {
      e[key] = `${raw} ${labUnitLabel(key, unit)} is unusual. Your report probably uses ${labUnitLabel(key, other)} — switch the unit above.`;
      continue;
    }
    const si = toSi(key, raw, unit);
    const r = LAB_RANGES[key];
    if (si < r.min || si > r.max) {
      const [lo, hi] = LAB_UNIT_SPECS[key].typical[unit];
      e[key] = `That value is out of range. Typical is ${lo}–${hi} ${labUnitLabel(key, unit)}. Check the unit on your report, or leave it blank.`;
    }
  }

  if (!f.consent) e.consent = "Please tick this box to see your results.";
  return e;
}

export const errorsForStep = (errors: FieldErrors, step: number): FieldErrors =>
  Object.fromEntries(
    Object.entries(errors).filter(([k]) => FIELD_STEP[k as FieldKey] === step),
  ) as FieldErrors;

/** Map a server validation issue path (e.g. ["labs", "egfr"]) to a form field. */
export function fieldFromIssuePath(path: (string | number)[]): FieldKey | null {
  const key = String(path[0] === "labs" ? path[1] : path[0]);
  return key in FIELD_STEP ? (key as FieldKey) : null;
}
