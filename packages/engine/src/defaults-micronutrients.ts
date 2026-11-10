/**
 * Second wave of supplements: vitamin D, omega-3, iron, vitamin B12 and electrolytes.
 *
 * The seed publishes the SAFETY rules here (block / caution) immediately, because they
 * can only hold a recommendation back. The RECOMMEND rules are seeded as
 * "pending review": nothing new is recommended to users until a reviewer approves it
 * in the backoffice. See NEW_RECOMMEND_RULE_IDS.
 */
import type { Product, Rule, Supplement } from "./types";

export const MICRONUTRIENT_SUPPLEMENTS: Supplement[] = [
  {
    slug: "vitamin_d",
    name: "Vitamin D3",
    summary:
      "Corrects low vitamin D. It doesn't add benefit if your level is already adequate. " +
      "Despite the sun, low vitamin D is common in Southeast Asia, especially for people who work indoors.",
    evidenceGrade: "A",
    dosing: { kind: "fixed", min: 1000, max: 2000, unit: "IU", schedule: "daily" },
    timing: "Once a day with a meal that contains some fat.",
    notes: [
      "Keep your total from all products (including multivitamins) under 4,000 IU a day unless your doctor prescribes more.",
      "Re-test your level after about 3 months.",
    ],
    references: [
      {
        title: "Endocrine Society guideline: Vitamin D for the prevention of disease (2024)",
        url: "https://doi.org/10.1210/clinem/dgae290",
      },
      { title: "NIH Office of Dietary Supplements — Vitamin D", url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/" },
    ],
  },
  {
    slug: "omega_3",
    name: "Omega-3 (EPA + DHA)",
    summary:
      "Fish oil, or algae oil if you're vegetarian or vegan, for people who rarely eat oily fish. " +
      "Supports heart health; benefits for healthy people are modest.",
    evidenceGrade: "B",
    dosing: { kind: "fixed", min: 250, max: 500, unit: "mg EPA+DHA", schedule: "daily" },
    timing: "With a meal, to reduce fishy burps.",
    notes: ["Count the EPA + DHA on the label, not the total fish-oil amount."],
    references: [
      {
        title: "NIH Office of Dietary Supplements — Omega-3 fatty acids",
        url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
      },
    ],
  },
  {
    slug: "iron",
    name: "Iron",
    summary:
      "Only for confirmed low iron stores (low ferritin on a blood test). Iron you don't need can be harmful, " +
      "so we never suggest it without a test result.",
    evidenceGrade: "A",
    dosing: { kind: "fixed", min: 60, max: 65, unit: "mg iron", schedule: "every_other_day" },
    timing:
      "Every other day, on an empty stomach or with vitamin C–rich food. Not with tea, coffee, milk or calcium.",
    notes: [
      "Taking iron every other day is absorbed better and causes fewer stomach upsets than daily.",
      "Constipation and nausea are common. Re-test ferritin after 2–3 months.",
    ],
    references: [
      {
        title: "Stoffel et al. 2017 — alternate-day iron improves absorption (Lancet Haematology)",
        url: "https://doi.org/10.1016/S2352-3026(17)30182-5",
      },
      { title: "NIH Office of Dietary Supplements — Iron", url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/" },
    ],
  },
  {
    slug: "vitamin_b12",
    name: "Vitamin B12",
    summary:
      "Essential if you eat little or no animal food. Also useful for older adults and people on long-term metformin.",
    evidenceGrade: "A",
    dosing: { kind: "fixed", min: 50, max: 100, unit: "µg", schedule: "daily" },
    timing: "Any time of day. Chewable or under-the-tongue forms are fine.",
    notes: ["No upper limit has been set for B12; side effects at these doses are rare."],
    references: [
      {
        title: "NIH Office of Dietary Supplements — Vitamin B12",
        url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
      },
    ],
  },
  {
    slug: "electrolytes",
    name: "Electrolytes (sodium)",
    summary:
      "For long or very sweaty sessions in hot, humid weather. Not needed for short workouts — water is enough.",
    evidenceGrade: "B",
    dosing: { kind: "fixed", min: 300, max: 600, unit: "mg sodium", schedule: "per_exercise_hour" },
    timing: "During sessions longer than 60–90 minutes, mixed into your water.",
    notes: ["Many electrolyte drinks are high in sugar. Choose sugar-free tablets unless you also need the energy."],
    references: [
      {
        title: "ACSM position stand: Exercise and fluid replacement (2007)",
        url: "https://doi.org/10.1249/mss.0b013e31802ca597",
      },
    ],
  },
];

export const MICRONUTRIENT_RULES: Rule[] = [
  // ---------------------------------------------------------------- global
  {
    id: "global-herbal",
    name: "Takes herbal products — check interactions",
    supplementSlug: null,
    effect: "caution",
    condition: { fact: "currentSupplements", op: "contains", value: "herbal" },
    message:
      "Herbal products (for example St John's Wort, ginkgo or high-dose turmeric) can interact with medicines. Show the labels to your pharmacist.",
    priority: 40,
  },

  // ---------------------------------------------------------------- vitamin D
  {
    id: "vitd-recommend-low",
    name: "Vitamin D for a low blood level",
    supplementSlug: "vitamin_d",
    effect: "recommend",
    condition: { fact: "labs.vitaminDNmolL", op: "lt", value: 50 },
    message: "Your vitamin D is below 50 nmol/L (20 ng/mL), the level most guidelines consider adequate.",
    priority: 10,
  },
  {
    id: "vitd-recommend-75plus",
    name: "Vitamin D for adults 75+ without a test",
    supplementSlug: "vitamin_d",
    effect: "recommend",
    condition: {
      all: [
        { fact: "age", op: "gte", value: 75 },
        { fact: "labs.vitaminDNmolL", op: "notExists" },
      ],
    },
    message: "For adults 75 and over, guidelines suggest a daily vitamin D supplement even without a blood test.",
    priority: 8,
  },
  {
    id: "vitd-caution-very-low",
    name: "Very low vitamin D — see doctor",
    supplementSlug: "vitamin_d",
    effect: "caution",
    condition: { fact: "labs.vitaminDNmolL", op: "lt", value: 30 },
    message:
      "Your level is very low (below 30 nmol/L / 12 ng/mL). Your doctor may prescribe a higher treatment dose and check why it's low.",
    priority: 80,
  },
  {
    id: "vitd-block-high",
    name: "High vitamin D — don't add more",
    supplementSlug: "vitamin_d",
    effect: "block",
    condition: { fact: "labs.vitaminDNmolL", op: "gt", value: 150 },
    message: "Your vitamin D level is already high (above 150 nmol/L / 60 ng/mL). Don't take more; ask your doctor.",
    priority: 100,
  },
  {
    id: "vitd-caution-kidney",
    name: "Kidney disease — vitamin D via nephrologist",
    supplementSlug: "vitamin_d",
    effect: "caution",
    condition: {
      any: [
        { fact: "conditions", op: "contains", value: "kidney_disease" },
        { fact: "labs.egfr", op: "lt", value: 60 },
      ],
    },
    message: "With reduced kidney function, vitamin D should be managed by your nephrologist.",
    priority: 80,
  },
  {
    id: "vitd-caution-multivitamin",
    name: "Multivitamin may already contain vitamin D",
    supplementSlug: "vitamin_d",
    effect: "caution",
    condition: { fact: "currentSupplements", op: "contains", value: "multivitamin" },
    message: "Your multivitamin probably contains vitamin D too. Add it to your total and stay under 4,000 IU a day.",
    priority: 50,
  },

  // ---------------------------------------------------------------- omega-3
  {
    id: "omega3-recommend-low-fish",
    name: "Omega-3 when oily fish is rare",
    supplementSlug: "omega_3",
    effect: "recommend",
    condition: { fact: "fishServingsPerWeek", op: "lt", value: 1 },
    message: "You eat fish less than once a week; guidelines suggest about two servings of oily fish a week.",
    priority: 10,
  },
  {
    id: "omega3-recommend-plant-based",
    name: "Omega-3 for vegetarians and vegans",
    supplementSlug: "omega_3",
    effect: "recommend",
    condition: { fact: "diet", op: "in", value: ["vegetarian", "vegan"] },
    message: "Plant-based diets provide almost no EPA or DHA; algae oil is a vegan source.",
    priority: 9,
  },
  {
    id: "omega3-caution-anticoagulant",
    name: "Blood thinners — check before omega-3",
    supplementSlug: "omega_3",
    effect: "caution",
    condition: { fact: "medications", op: "contains", value: "anticoagulant" },
    message: "Omega-3 can add to the effect of blood thinners. Ask your doctor before starting.",
    priority: 80,
  },

  // ---------------------------------------------------------------- iron
  {
    id: "iron-recommend-low-ferritin",
    name: "Iron for low ferritin (women under 50)",
    supplementSlug: "iron",
    effect: "recommend",
    condition: {
      all: [
        { fact: "sex", op: "eq", value: "female" },
        { fact: "age", op: "lt", value: 50 },
        { fact: "labs.ferritinUgL", op: "lt", value: 30 },
      ],
    },
    message: "Your ferritin is below 30 µg/L, which suggests low iron stores — common with periods.",
    priority: 10,
  },
  {
    id: "iron-block-investigate",
    name: "Low ferritin in men / women 50+ — find the cause",
    supplementSlug: "iron",
    effect: "block",
    condition: {
      all: [
        { fact: "labs.ferritinUgL", op: "lt", value: 30 },
        {
          any: [
            { fact: "sex", op: "eq", value: "male" },
            { fact: "age", op: "gte", value: 50 },
          ],
        },
      ],
    },
    message:
      "Low iron in men and in women over 50 needs a doctor to find the cause (for example hidden blood loss) before taking iron.",
    priority: 100,
  },
  {
    id: "iron-block-overload-risk",
    name: "Thalassaemia / haemochromatosis",
    supplementSlug: "iron",
    effect: "block",
    condition: { fact: "conditions", op: "contains", value: "iron_overload_risk" },
    message: "With thalassaemia or haemochromatosis, take iron only if your doctor confirms you're iron deficient.",
    priority: 100,
  },
  {
    id: "iron-block-high-ferritin",
    name: "High ferritin — no iron",
    supplementSlug: "iron",
    effect: "block",
    condition: { fact: "labs.ferritinUgL", op: "gt", value: 150 },
    message: "Your ferritin is high. Don't take iron unless your doctor tells you to.",
    priority: 100,
  },
  {
    id: "iron-caution-calcium",
    name: "Iron and calcium — space apart",
    supplementSlug: "iron",
    effect: "caution",
    condition: { fact: "currentSupplements", op: "contains", value: "calcium" },
    message: "Calcium blocks iron absorption. Take them at least 2 hours apart.",
    priority: 50,
  },
  {
    id: "iron-caution-multivitamin",
    name: "Multivitamin may contain iron",
    supplementSlug: "iron",
    effect: "caution",
    condition: { fact: "currentSupplements", op: "contains", value: "multivitamin" },
    message: "Your multivitamin may already contain iron. Check the label so you don't double up.",
    priority: 50,
  },

  // ---------------------------------------------------------------- vitamin B12
  {
    id: "b12-recommend-vegan",
    name: "B12 for vegans",
    supplementSlug: "vitamin_b12",
    effect: "recommend",
    condition: { fact: "diet", op: "eq", value: "vegan" },
    message: "Vegans need a reliable B12 source; plant foods don't provide it.",
    priority: 10,
  },
  {
    id: "b12-recommend-vegetarian",
    name: "B12 for vegetarians",
    supplementSlug: "vitamin_b12",
    effect: "recommend",
    condition: { fact: "diet", op: "eq", value: "vegetarian" },
    message: "Vegetarians often get too little B12 from eggs and dairy alone.",
    priority: 8,
  },
  {
    id: "b12-recommend-low-lab",
    name: "B12 for a low blood level",
    supplementSlug: "vitamin_b12",
    effect: "recommend",
    condition: { fact: "labs.b12PmolL", op: "lt", value: 148 },
    message: "Your B12 level is low (below 148 pmol/L / 200 pg/mL).",
    priority: 11,
  },
  {
    id: "b12-recommend-diabetes-meds",
    name: "B12 with diabetes medicine (metformin)",
    supplementSlug: "vitamin_b12",
    effect: "recommend",
    condition: { fact: "medications", op: "contains", value: "diabetes_medication" },
    message: "If you take metformin, long-term use can lower B12. Ask your doctor to check your level yearly.",
    priority: 7,
  },
  {
    id: "b12-recommend-older",
    name: "B12 for adults 65+",
    supplementSlug: "vitamin_b12",
    effect: "recommend",
    condition: { fact: "age", op: "gte", value: 65 },
    message: "B12 absorption from food falls with age.",
    priority: 6,
  },
  {
    id: "b12-caution-low-lab",
    name: "Low B12 — see doctor",
    supplementSlug: "vitamin_b12",
    effect: "caution",
    condition: { fact: "labs.b12PmolL", op: "lt", value: 148 },
    message:
      "Low B12 should be checked by a doctor: you may need a higher dose or injections, and the cause should be found.",
    priority: 80,
  },

  // ---------------------------------------------------------------- electrolytes
  {
    id: "electrolytes-recommend-endurance",
    name: "Electrolytes for endurance training",
    supplementSlug: "electrolytes",
    effect: "recommend",
    condition: {
      all: [
        { fact: "goal", op: "eq", value: "endurance" },
        { fact: "trainingDaysPerWeek", op: "gte", value: 3 },
      ],
    },
    message: "Long sessions in Southeast Asia's heat and humidity mean large sweat and salt losses.",
    priority: 10,
  },
  {
    id: "electrolytes-block-kidney",
    name: "Kidney disease — no electrolyte products",
    supplementSlug: "electrolytes",
    effect: "block",
    condition: {
      any: [
        { fact: "conditions", op: "contains", value: "kidney_disease" },
        { fact: "labs.egfr", op: "lt", value: 60 },
      ],
    },
    message:
      "With reduced kidney function, ask your doctor before using electrolyte products (they contain sodium and potassium).",
    priority: 100,
  },
  {
    id: "electrolytes-caution-bp",
    name: "Blood pressure / heart — check sodium",
    supplementSlug: "electrolytes",
    effect: "caution",
    condition: {
      any: [
        { fact: "conditions", op: "containsAny", value: ["hypertension", "heart_disease"] },
        { fact: "medications", op: "containsAny", value: ["blood_pressure", "diuretic"] },
      ],
    },
    message:
      "Electrolyte products add sodium (and often potassium). With high blood pressure, heart disease or blood pressure medicine, check with your doctor first.",
    priority: 80,
  },
];

/** Recommend rules seeded as PENDING_REVIEW, so a reviewer must approve them first. */
export const NEW_RECOMMEND_RULE_IDS = new Set(
  MICRONUTRIENT_RULES.filter((r) => r.effect === "recommend").map((r) => r.id),
);

const price = (MY: number, SG: number, extra: Partial<Record<"ID" | "TH" | "PH" | "VN", number>> = {}) => [
  { country: "MY" as const, currency: "MYR", price: MY },
  { country: "SG" as const, currency: "SGD", price: SG },
  ...(extra.ID ? [{ country: "ID" as const, currency: "IDR", price: extra.ID }] : []),
  ...(extra.TH ? [{ country: "TH" as const, currency: "THB", price: extra.TH }] : []),
  ...(extra.PH ? [{ country: "PH" as const, currency: "PHP", price: extra.PH }] : []),
  ...(extra.VN ? [{ country: "VN" as const, currency: "VND", price: extra.VN }] : []),
];

/** SAMPLE products only — fictional brands. `activePerServingG` is in the supplement's dose unit. */
export const MICRONUTRIENT_SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-vitd3-1000",
    supplementSlug: "vitamin_d",
    brand: "Sample Co.",
    name: "Sample Vitamin D3 1000 IU Softgels",
    form: "vitamin_d3",
    servingSizeG: 0.3,
    activePerServingG: 1000,
    sugarPerServingG: 0,
    servingsPerContainer: 120,
    allergens: [],
    vegan: false,
    halalCertified: true,
    certifications: ["USP Verified"],
    prices: price(39, 15, { ID: 120000, TH: 290, PH: 450, VN: 180000 }),
  },
  {
    id: "sample-vitd3-vegan",
    supplementSlug: "vitamin_d",
    brand: "Green Sample",
    name: "Sample Vegan D3 2000 IU (lichen)",
    form: "vitamin_d3",
    servingSizeG: 0.3,
    activePerServingG: 2000,
    sugarPerServingG: 0,
    servingsPerContainer: 60,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: [],
    prices: price(55, 22, { ID: 165000 }),
  },
  {
    id: "sample-fish-oil",
    supplementSlug: "omega_3",
    brand: "Sample Co.",
    name: "Sample Fish Oil (600 mg EPA+DHA)",
    form: "fish_oil",
    servingSizeG: 1.2,
    activePerServingG: 600,
    sugarPerServingG: 0,
    servingsPerContainer: 90,
    allergens: ["fish"],
    vegan: false,
    halalCertified: true,
    certifications: ["IFOS"],
    prices: price(69, 28, { ID: 210000, TH: 590, PH: 890 }),
  },
  {
    id: "sample-algae-oil",
    supplementSlug: "omega_3",
    brand: "Green Sample",
    name: "Sample Algae Omega-3 (300 mg EPA+DHA)",
    form: "algae_oil",
    servingSizeG: 1,
    activePerServingG: 300,
    sugarPerServingG: 0,
    servingsPerContainer: 60,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: [],
    prices: price(99, 39, { ID: 290000 }),
  },
  {
    id: "sample-ferrous-sulfate",
    supplementSlug: "iron",
    brand: "Sample Co.",
    name: "Sample Ferrous Sulfate 325 mg (65 mg iron)",
    form: "ferrous_sulfate",
    servingSizeG: 0.4,
    activePerServingG: 65,
    sugarPerServingG: 0,
    servingsPerContainer: 100,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: ["USP Verified"],
    prices: price(25, 9, { ID: 45000, TH: 150, PH: 250, VN: 90000 }),
  },
  {
    id: "sample-b12-100",
    supplementSlug: "vitamin_b12",
    brand: "Green Sample",
    name: "Sample B12 100 µg Chewables",
    form: "cyanocobalamin",
    servingSizeG: 0.5,
    activePerServingG: 100,
    sugarPerServingG: 0,
    servingsPerContainer: 100,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: [],
    prices: price(20, 8, { ID: 60000, TH: 190, PH: 280, VN: 120000 }),
  },
  {
    id: "sample-electrolyte-tabs",
    supplementSlug: "electrolytes",
    brand: "Sample Co.",
    name: "Sample Electrolyte Tablets (sugar-free)",
    form: "electrolyte_tablet",
    servingSizeG: 4,
    activePerServingG: 300,
    sugarPerServingG: 0,
    servingsPerContainer: 20,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: ["Informed Sport"],
    prices: price(35, 14, { ID: 95000, TH: 290, PH: 420, VN: 150000 }),
  },
  {
    id: "sample-electrolyte-drink",
    supplementSlug: "electrolytes",
    brand: "Budget Sample",
    name: "Sample Isotonic Drink Mix",
    form: "electrolyte_powder",
    servingSizeG: 35,
    activePerServingG: 500,
    sugarPerServingG: 28,
    servingsPerContainer: 10,
    allergens: [],
    vegan: true,
    halalCertified: true,
    certifications: [],
    prices: price(25, 12, { PH: 300 }),
  },
];
