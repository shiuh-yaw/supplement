/**
 * Starter knowledge base. `pnpm db:seed` writes this into the database, where it is
 * then managed from the backoffice. The engine tests also run against it, so every
 * safety rule here is covered by a test.
 *
 * IMPORTANT: these rules are a starting point drafted from published position stands.
 * Have a qualified dietitian / pharmacist / doctor review them before going live.
 */
import type { Product, Rule, Supplement } from "./types";

export const DEFAULT_SUPPLEMENTS: Supplement[] = [
  {
    slug: "protein",
    name: "Protein powder",
    summary:
      "A convenient way to reach your daily protein target when food alone falls short. " +
      "Whey isolate and plant blends work well; total daily protein matters more than timing.",
    evidenceGrade: "A",
    dosing: {
      kind: "protein_gap",
      targetGPerKg: {
        muscle_gain: { min: 1.6, max: 2.2 },
        strength: { min: 1.6, max: 2.2 },
        fat_loss: { min: 1.8, max: 2.4 },
        endurance: { min: 1.2, max: 1.6 },
        general_health: { min: 0.8, max: 1.2 },
      },
      olderAdultMinGPerKg: 1.0,
      assumedDietaryGPerKg: 1.0,
      maxSupplementG: 60,
    },
    timing: "Any time of day. Spreading protein across 3–5 meals (≈0.3–0.4 g/kg each) is ideal.",
    notes: ["Protein powder is a food, not a magic product — whole-food protein works just as well."],
    references: [
      {
        title: "ISSN Position Stand: protein and exercise (2017)",
        url: "https://doi.org/10.1186/s12970-017-0177-8",
      },
      {
        title: "Morton et al. 2018 — protein supplementation meta-analysis (BJSM)",
        url: "https://doi.org/10.1136/bjsports-2017-097608",
      },
    ],
  },
  {
    slug: "creatine",
    name: "Creatine monohydrate",
    summary:
      "The most researched sports supplement. Improves strength, power and lean mass gains when combined with resistance training.",
    evidenceGrade: "A",
    dosing: { kind: "fixed", min: 3, max: 5, unit: "g" },
    timing: "Daily, any time, with water or food. No loading phase needed — it saturates muscles in 3–4 weeks.",
    notes: [
      "Creatine can raise blood creatinine test results without harming your kidneys. Tell your doctor you take it before kidney tests.",
      "Mild water weight gain (≈1 kg) in the first weeks is normal.",
    ],
    references: [
      {
        title: "ISSN Position Stand: creatine supplementation (2017)",
        url: "https://doi.org/10.1186/s12970-017-0173-z",
      },
      {
        title: "Antonio et al. 2021 — common questions and misconceptions about creatine",
        url: "https://doi.org/10.1186/s12970-021-00412-w",
      },
    ],
  },
];

export const DEFAULT_RULES: Rule[] = [
  // ---------------------------------------------------------------- global safety
  {
    id: "global-under-18",
    name: "Under 18 — refer to doctor",
    supplementSlug: null,
    effect: "block",
    condition: { fact: "age", op: "lt", value: 18 },
    message:
      "You're under 18. Sports supplements aren't recommended without a doctor or sports dietitian — focus on food first.",
    priority: 100,
  },
  {
    id: "global-pregnancy",
    name: "Pregnant or breastfeeding — refer to doctor",
    supplementSlug: null,
    effect: "block",
    condition: { fact: "conditions", op: "containsAny", value: ["pregnant", "breastfeeding"] },
    message:
      "You're pregnant or breastfeeding. Please ask your obstetrician or midwife before taking any sports supplement.",
    priority: 100,
  },
  {
    id: "global-high-alt",
    name: "Very high ALT — see doctor",
    supplementSlug: null,
    effect: "caution",
    condition: { fact: "labs.altUL", op: "gt", value: 120 },
    message:
      "Your ALT (liver enzyme) is more than ~3× the normal limit. Please see a doctor about this before starting supplements.",
    priority: 90,
  },
  {
    id: "global-medications",
    name: "Takes medication — check interactions",
    supplementSlug: null,
    effect: "caution",
    condition: { fact: "medications", op: "containsAny", value: ["anticoagulant", "other"] },
    message: "You take medication. Ask your pharmacist to check for interactions before starting anything new.",
    priority: 50,
  },

  // ---------------------------------------------------------------- protein
  {
    id: "protein-recommend-active",
    name: "Protein for training goals",
    supplementSlug: "protein",
    effect: "recommend",
    condition: { fact: "goal", op: "in", value: ["muscle_gain", "strength", "fat_loss", "endurance"] },
    message: "Higher protein intake supports muscle repair and growth for your training goal.",
    priority: 10,
  },
  {
    id: "protein-recommend-older",
    name: "Protein for adults 65+",
    supplementSlug: "protein",
    effect: "recommend",
    condition: { fact: "age", op: "gte", value: 65 },
    message: "Adults 65+ need more protein to slow age-related muscle loss.",
    priority: 9,
  },
  {
    id: "protein-block-ckd",
    name: "Kidney disease — protein set by specialist",
    supplementSlug: "protein",
    effect: "block",
    condition: {
      any: [
        { fact: "conditions", op: "contains", value: "kidney_disease" },
        { fact: "labs.egfr", op: "lt", value: 60 },
      ],
    },
    message:
      "With reduced kidney function, protein intake should be set by your nephrologist or renal dietitian. Don't add protein supplements on your own.",
    priority: 100,
  },
  {
    id: "protein-caution-liver",
    name: "Liver disease — check with doctor",
    supplementSlug: "protein",
    effect: "caution",
    condition: { fact: "conditions", op: "contains", value: "liver_disease" },
    message: "You reported liver disease. Check your protein target with your doctor.",
    priority: 80,
  },

  // ---------------------------------------------------------------- creatine
  {
    id: "creatine-recommend-strength",
    name: "Creatine for muscle / strength training",
    supplementSlug: "creatine",
    effect: "recommend",
    condition: {
      all: [
        { fact: "goal", op: "in", value: ["muscle_gain", "strength"] },
        { fact: "trainingDaysPerWeek", op: "gte", value: 2 },
      ],
    },
    message: "Creatine reliably boosts strength and muscle gains when you lift regularly.",
    priority: 10,
  },
  {
    id: "creatine-recommend-other-training",
    name: "Creatine for other goals with resistance training",
    supplementSlug: "creatine",
    effect: "recommend",
    condition: {
      all: [
        { fact: "goal", op: "in", value: ["fat_loss", "general_health"] },
        { fact: "trainingDaysPerWeek", op: "gte", value: 2 },
      ],
    },
    message: "With regular training, creatine can help you keep and build muscle (moderate evidence for this goal).",
    priority: 5,
  },
  {
    id: "creatine-block-ckd",
    name: "Kidney disease / low eGFR — no creatine",
    supplementSlug: "creatine",
    effect: "block",
    condition: {
      any: [
        { fact: "conditions", op: "contains", value: "kidney_disease" },
        { fact: "labs.egfr", op: "lt", value: 60 },
      ],
    },
    message:
      "Your kidney function is reduced (kidney disease or eGFR below 60). Don't take creatine unless your nephrologist approves.",
    priority: 100,
  },
  {
    id: "creatine-caution-kidney-meds",
    name: "Kidney-stressing medication",
    supplementSlug: "creatine",
    effect: "caution",
    condition: { fact: "medications", op: "containsAny", value: ["diuretic", "nsaid_regular", "nephrotoxic"] },
    message:
      "You take a medication that can affect the kidneys (diuretic, regular NSAIDs or similar). Check with your doctor before starting creatine.",
    priority: 80,
  },
  {
    id: "creatine-caution-no-kidney-labs",
    name: "No kidney labs and higher risk",
    supplementSlug: "creatine",
    effect: "caution",
    condition: {
      all: [
        { fact: "labs.egfr", op: "notExists" },
        {
          any: [
            { fact: "age", op: "gte", value: 50 },
            { fact: "conditions", op: "containsAny", value: ["diabetes", "hypertension", "heart_disease"] },
          ],
        },
      ],
    },
    message:
      "Because of your age or health history, get a kidney function test (eGFR / creatinine) before starting creatine.",
    priority: 60,
  },
];

/**
 * SAMPLE products only — fictional brands with illustrative prices so the app works
 * out of the box. Replace them with your real, verified catalog in the backoffice.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-whey-isolate",
    supplementSlug: "protein",
    brand: "Sample Co.",
    name: "Sample Whey Isolate (Unflavoured)",
    form: "whey_isolate",
    servingSizeG: 30,
    activePerServingG: 27,
    sugarPerServingG: 0.5,
    servingsPerContainer: 66,
    allergens: ["dairy"],
    vegan: false,
    halalCertified: true,
    certifications: ["Informed Sport"],
    prices: [
      { country: "MY", currency: "MYR", price: 389 },
      { country: "SG", currency: "SGD", price: 129 },
      { country: "ID", currency: "IDR", price: 1450000 },
    ],
  },
  {
    id: "sample-whey-concentrate",
    supplementSlug: "protein",
    brand: "Sample Co.",
    name: "Sample Whey Blend (Chocolate)",
    form: "whey_concentrate",
    servingSizeG: 35,
    activePerServingG: 24,
    sugarPerServingG: 3,
    servingsPerContainer: 64,
    allergens: ["dairy", "soy"],
    vegan: false,
    halalCertified: true,
    certifications: [],
    prices: [
      { country: "MY", currency: "MYR", price: 249 },
      { country: "SG", currency: "SGD", price: 89 },
      { country: "TH", currency: "THB", price: 2290 },
      { country: "PH", currency: "PHP", price: 3990 },
    ],
  },
  {
    id: "sample-plant-blend",
    supplementSlug: "protein",
    brand: "Green Sample",
    name: "Sample Pea & Rice Protein",
    form: "plant_blend",
    servingSizeG: 33,
    activePerServingG: 24,
    sugarPerServingG: 1,
    servingsPerContainer: 30,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: ["Informed Choice"],
    prices: [
      { country: "MY", currency: "MYR", price: 189 },
      { country: "SG", currency: "SGD", price: 69 },
      { country: "ID", currency: "IDR", price: 690000 },
      { country: "TH", currency: "THB", price: 1690 },
    ],
  },
  {
    id: "sample-creatine-mono",
    supplementSlug: "creatine",
    brand: "Sample Co.",
    name: "Sample Creatine Monohydrate (Unflavoured)",
    form: "creatine_monohydrate",
    servingSizeG: 5,
    activePerServingG: 5,
    sugarPerServingG: 0,
    servingsPerContainer: 100,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: ["Informed Sport"],
    prices: [
      { country: "MY", currency: "MYR", price: 129 },
      { country: "SG", currency: "SGD", price: 45 },
      { country: "ID", currency: "IDR", price: 450000 },
      { country: "TH", currency: "THB", price: 990 },
      { country: "PH", currency: "PHP", price: 1590 },
      { country: "VN", currency: "VND", price: 690000 },
    ],
  },
  {
    id: "sample-creatine-hcl",
    supplementSlug: "creatine",
    brand: "Budget Sample",
    name: "Sample Creatine HCl Capsules",
    form: "creatine_hcl",
    servingSizeG: 3,
    activePerServingG: 3,
    sugarPerServingG: 0,
    servingsPerContainer: 60,
    allergens: [],
    vegan: false,
    halalCertified: false,
    certifications: [],
    prices: [
      { country: "MY", currency: "MYR", price: 99 },
      { country: "SG", currency: "SGD", price: 39 },
    ],
  },
];
