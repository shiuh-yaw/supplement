import type { ConditionLeaf, ConditionNode, UserProfile } from "./types";
import { conditionSchema } from "./types";

/** Facts a rule can reference. Used for validation and backoffice help text. */
export const FACTS: Record<string, string> = {
  age: "Age in years (number)",
  sex: '"male" | "female"',
  weightKg: "Body weight, kg (number)",
  country: '"MY" | "SG" | "ID" | "TH" | "PH" | "VN"',
  goal: '"muscle_gain" | "strength" | "fat_loss" | "endurance" | "general_health"',
  trainingDaysPerWeek: "Training sessions per week (number)",
  diet: '"omnivore" | "vegetarian" | "vegan"',
  dietaryProteinG: "Protein from food per day, g (may be missing)",
  fishServingsPerWeek: "Fish/seafood servings per week (may be missing)",
  lactoseIntolerant: "boolean",
  allergies: 'list: "dairy" | "soy" | "gluten" | "egg" | "peanut" | "tree_nut" | "fish" | "shellfish"',
  halalRequired: "boolean",
  monthlyBudget: "Monthly budget, local currency (may be missing)",
  conditions:
    'list: "kidney_disease" | "liver_disease" | "diabetes" | "hypertension" | "heart_disease" | "gout" | "pregnant" | "breastfeeding" | "iron_overload_risk"',
  medications:
    'list: "diuretic" | "nsaid_regular" | "nephrotoxic" | "anticoagulant" | "diabetes_medication" | "blood_pressure" | "other"',
  currentSupplements:
    'list: "protein" | "creatine" | "vitamin_d" | "omega_3" | "iron" | "vitamin_b12" | "electrolytes" | "multivitamin" | "calcium" | "magnesium" | "zinc" | "herbal"',
  "labs.egfr": "eGFR, mL/min/1.73m² (may be missing)",
  "labs.creatinineUmolL": "Serum creatinine, µmol/L (may be missing)",
  "labs.altUL": "ALT, U/L (may be missing)",
  "labs.uricAcidUmolL": "Uric acid, µmol/L (may be missing)",
  "labs.hba1cPercent": "HbA1c, % (may be missing)",
  "labs.vitaminDNmolL": "25-OH vitamin D, nmol/L (ng/mL × 2.5) (may be missing)",
  "labs.ferritinUgL": "Ferritin, µg/L = ng/mL (may be missing)",
  "labs.b12PmolL": "Vitamin B12, pmol/L (pg/mL × 0.74) (may be missing)",
};

export function getFact(profile: UserProfile, fact: string): unknown {
  let current: unknown = profile;
  for (const key of fact.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function evaluateLeaf(profile: UserProfile, leaf: ConditionLeaf): boolean {
  const actual = getFact(profile, leaf.fact);
  const expected = leaf.value;
  const missing = actual === undefined || actual === null;

  switch (leaf.op) {
    case "exists":
      return !missing;
    case "notExists":
      return missing;
  }

  // Every other operator is false when the fact is unknown. Rules that care
  // about missing data must say so explicitly with `notExists`.
  if (missing) return false;

  switch (leaf.op) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "in":
      return Array.isArray(expected) && expected.includes(actual);
    case "nin":
      return Array.isArray(expected) && !expected.includes(actual);
    case "gt":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "lt":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "contains":
      return Array.isArray(actual) && actual.includes(expected);
    case "containsAny":
      return Array.isArray(actual) && Array.isArray(expected) && expected.some((v) => actual.includes(v));
  }
}

export function evaluateCondition(profile: UserProfile, node: ConditionNode): boolean {
  if ("all" in node) return node.all.every((child) => evaluateCondition(profile, child));
  if ("any" in node) return node.any.some((child) => evaluateCondition(profile, child));
  if ("not" in node) return !evaluateCondition(profile, node.not);
  return evaluateLeaf(profile, node);
}

export type ConditionValidation = { ok: true; condition: ConditionNode } | { ok: false; errors: string[] };

/** Validates shape AND that every fact referenced is a known fact. */
export function validateCondition(input: unknown): ConditionValidation {
  const parsed = conditionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  const errors: string[] = [];
  const walk = (node: ConditionNode): void => {
    if ("all" in node) node.all.forEach(walk);
    else if ("any" in node) node.any.forEach(walk);
    else if ("not" in node) walk(node.not);
    else {
      if (!(node.fact in FACTS)) errors.push(`Unknown fact "${node.fact}"`);
      const needsValue = node.op !== "exists" && node.op !== "notExists";
      if (needsValue && node.value === undefined) errors.push(`Operator "${node.op}" on "${node.fact}" needs a value`);
      if ((node.op === "in" || node.op === "nin" || node.op === "containsAny") && !Array.isArray(node.value)) {
        errors.push(`Operator "${node.op}" on "${node.fact}" needs a list value`);
      }
    }
  };
  walk(parsed.data);
  return errors.length ? { ok: false, errors } : { ok: true, condition: parsed.data };
}
