import { z } from "zod";

// ---------------------------------------------------------------------------
// User profile (what the questionnaire collects)
// ---------------------------------------------------------------------------

export const GOALS = ["muscle_gain", "strength", "fat_loss", "endurance", "general_health"] as const;
export const DIETS = ["omnivore", "vegetarian", "vegan"] as const;
export const COUNTRIES = ["MY", "SG", "ID", "TH", "PH", "VN"] as const;
export const ALLERGENS = ["dairy", "soy", "gluten", "egg", "peanut", "tree_nut", "fish", "shellfish"] as const;
export const CONDITIONS = [
  "kidney_disease",
  "liver_disease",
  "diabetes",
  "hypertension",
  "heart_disease",
  "gout",
  "pregnant",
  "breastfeeding",
  /** Thalassaemia (incl. trait) or haemochromatosis — iron can build up. */
  "iron_overload_risk",
] as const;

/** Supplements people may already take. Slugs match supplements where one exists. */
export const CURRENT_SUPPLEMENTS = [
  "protein",
  "creatine",
  "vitamin_d",
  "omega_3",
  "iron",
  "vitamin_b12",
  "electrolytes",
  "multivitamin",
  "calcium",
  "magnesium",
  "zinc",
  "herbal",
] as const;
export const MEDICATIONS = [
  "diuretic",
  "nsaid_regular",
  "nephrotoxic",
  "anticoagulant",
  "diabetes_medication",
  "blood_pressure",
  "other",
] as const;

export type Goal = (typeof GOALS)[number];
export type Diet = (typeof DIETS)[number];
export type Country = (typeof COUNTRIES)[number];
export type Allergen = (typeof ALLERGENS)[number];
export type HealthCondition = (typeof CONDITIONS)[number];
export type MedicationClass = (typeof MEDICATIONS)[number];
export type CurrentSupplement = (typeof CURRENT_SUPPLEMENTS)[number];

export const CURRENCY_BY_COUNTRY: Record<Country, string> = {
  MY: "MYR",
  SG: "SGD",
  ID: "IDR",
  TH: "THB",
  PH: "PHP",
  VN: "VND",
};

export const labsSchema = z
  .object({
    /** Estimated glomerular filtration rate, mL/min/1.73m² */
    egfr: z.number().min(1).max(200).optional(),
    /** Serum creatinine, µmol/L */
    creatinineUmolL: z.number().min(10).max(2000).optional(),
    /** Alanine aminotransferase, U/L */
    altUL: z.number().min(1).max(5000).optional(),
    /** Serum uric acid, µmol/L */
    uricAcidUmolL: z.number().min(50).max(1500).optional(),
    /** HbA1c, % */
    hba1cPercent: z.number().min(3).max(20).optional(),
    /** 25-hydroxy vitamin D, nmol/L (ng/mL × 2.496) */
    vitaminDNmolL: z.number().min(5).max(500).optional(),
    /** Ferritin, µg/L (same number as ng/mL) */
    ferritinUgL: z.number().min(1).max(5000).optional(),
    /** Vitamin B12, pmol/L (pg/mL × 0.738) */
    b12PmolL: z.number().min(20).max(3000).optional(),
  })
  .default({});

export const userProfileSchema = z.object({
  age: z.number().int().min(10).max(110),
  sex: z.enum(["male", "female"]),
  weightKg: z.number().min(25).max(300),
  country: z.enum(COUNTRIES),
  goal: z.enum(GOALS),
  trainingDaysPerWeek: z.number().int().min(0).max(14),
  diet: z.enum(DIETS),
  /** Estimated protein already eaten from food each day, grams. Omit if unknown. */
  dietaryProteinG: z.number().min(0).max(500).optional(),
  /** Servings of fish/seafood per week. Omit if unknown. */
  fishServingsPerWeek: z.number().min(0).max(21).optional(),
  lactoseIntolerant: z.boolean().default(false),
  allergies: z.array(z.enum(ALLERGENS)).default([]),
  halalRequired: z.boolean().default(false),
  /** Monthly supplement budget in the local currency of `country`. */
  monthlyBudget: z.number().min(0).optional(),
  conditions: z.array(z.enum(CONDITIONS)).default([]),
  medications: z.array(z.enum(MEDICATIONS)).default([]),
  currentSupplements: z.array(z.enum(CURRENT_SUPPLEMENTS)).default([]),
  labs: labsSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserProfileInput = z.input<typeof userProfileSchema>;

// ---------------------------------------------------------------------------
// Rule conditions (a small JSON DSL editable from the backoffice)
// ---------------------------------------------------------------------------

export const OPERATORS = [
  "eq",
  "neq",
  "in",
  "nin",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "containsAny",
  "exists",
  "notExists",
] as const;
export type Operator = (typeof OPERATORS)[number];

export type ConditionLeaf = { fact: string; op: Operator; value?: unknown };
export type ConditionNode =
  | ConditionLeaf
  | { all: ConditionNode[] }
  | { any: ConditionNode[] }
  | { not: ConditionNode };

export const conditionSchema: z.ZodType<ConditionNode> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(conditionSchema).min(1) }).strict(),
    z.object({ any: z.array(conditionSchema).min(1) }).strict(),
    z.object({ not: conditionSchema }).strict(),
    z
      .object({
        fact: z.string().min(1),
        op: z.enum(OPERATORS),
        value: z.unknown().optional(),
      })
      .strict(),
  ]),
);

// ---------------------------------------------------------------------------
// Knowledge base (managed in the backoffice, loaded from the database)
// ---------------------------------------------------------------------------

export type EvidenceGrade = "A" | "B" | "C";

export const dosingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("fixed"),
    min: z.number().positive(),
    max: z.number().positive(),
    /** e.g. "g", "mg", "µg", "IU", "mg sodium" */
    unit: z.string().min(1),
    /** How often the dose is taken. Defaults to daily. */
    schedule: z.enum(["daily", "every_other_day", "per_exercise_hour"]).default("daily"),
  }),
  z.object({
    /** Total daily protein target in g/kg, by goal; the supplement fills the gap left by food. */
    kind: z.literal("protein_gap"),
    targetGPerKg: z.record(z.enum(GOALS), z.object({ min: z.number(), max: z.number() })),
    /** Minimum g/kg for adults aged 65+ regardless of goal. */
    olderAdultMinGPerKg: z.number().default(1.0),
    /** Assumed food intake (g/kg) when the user doesn't know their protein intake. */
    assumedDietaryGPerKg: z.number().default(1.0),
    /** Max protein per day we'd suggest from supplements, g. */
    maxSupplementG: z.number().default(60),
  }),
]);
export type DosingConfig = z.infer<typeof dosingSchema>;

export interface Reference {
  title: string;
  url: string;
}

export interface Supplement {
  slug: string;
  name: string;
  summary: string;
  evidenceGrade: EvidenceGrade;
  dosing: DosingConfig;
  timing: string;
  /** Always-shown notes, e.g. "creatine raises serum creatinine readings". */
  notes: string[];
  references: Reference[];
}

export type RuleEffect = "recommend" | "caution" | "block";

export interface Rule {
  id: string;
  name: string;
  /** null = applies to every supplement (global safety rule). */
  supplementSlug: string | null;
  effect: RuleEffect;
  condition: ConditionNode;
  /** Shown to the user when the rule fires. */
  message: string;
  /** Higher wins when several recommend rules match. */
  priority: number;
}

export interface ProductPrice {
  country: Country;
  currency: string;
  price: number;
  url?: string | null;
}

export interface Product {
  id: string;
  supplementSlug: string;
  brand: string;
  name: string;
  /** e.g. whey_isolate, whey_concentrate, plant_blend, creatine_monohydrate */
  form: string;
  servingSizeG: number;
  /** Active ingredient per serving (protein g, creatine g). */
  activePerServingG: number;
  sugarPerServingG: number;
  servingsPerContainer: number;
  allergens: Allergen[];
  vegan: boolean;
  halalCertified: boolean;
  /** Third-party testing programmes, e.g. "Informed Sport", "NSF Certified for Sport". */
  certifications: string[];
  prices: ProductPrice[];
}

export interface KnowledgeBase {
  supplements: Supplement[];
  rules: Rule[];
  products: Product[];
}

// ---------------------------------------------------------------------------
// Engine output
// ---------------------------------------------------------------------------

export interface Notice {
  ruleId: string;
  message: string;
}

export type DoseSchedule = "daily" | "every_other_day" | "per_exercise_hour";

export interface Dose {
  min: number;
  max: number;
  unit: string;
  schedule: DoseSchedule;
  text: string;
}

export interface RankedProduct {
  product: Product;
  price: ProductPrice;
  score: number;
  costPerDay: number;
  costPerMonth: number;
  withinBudget: boolean | null;
  /** How many servings (scoops / capsules) of this product make up one dose. */
  servingsPerDose: { min: number; max: number };
  reasons: string[];
}

export type RecommendationStatus = "recommended" | "not_needed" | "not_recommended" | "blocked";

export interface SupplementRecommendation {
  supplement: Pick<Supplement, "slug" | "name" | "summary" | "evidenceGrade" | "timing" | "notes" | "references">;
  status: RecommendationStatus;
  dose: Dose | null;
  reasons: string[];
  cautions: Notice[];
  blocks: Notice[];
  products: RankedProduct[];
  /** Explains why the product list is empty, if it is. */
  productsNote: string | null;
  /** The user told us they already take this. */
  alreadyTaking: boolean;
}

export interface RecommendationResult {
  profile: UserProfile;
  generalCautions: Notice[];
  generalBlocks: Notice[];
  items: SupplementRecommendation[];
  disclaimer: string;
}
