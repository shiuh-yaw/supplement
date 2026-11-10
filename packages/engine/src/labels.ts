import type { Allergen, Country, CurrentSupplement, Diet, Goal, HealthCondition, MedicationClass } from "./types";

export const GOAL_LABELS: Record<Goal, string> = {
  muscle_gain: "Build muscle",
  strength: "Get stronger",
  fat_loss: "Lose fat, keep muscle",
  endurance: "Endurance (running, cycling…)",
  general_health: "General health",
};

export const DIET_LABELS: Record<Diet, string> = {
  omnivore: "I eat meat / fish",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

export const COUNTRY_LABELS: Record<Country, string> = {
  MY: "Malaysia",
  SG: "Singapore",
  ID: "Indonesia",
  TH: "Thailand",
  PH: "Philippines",
  VN: "Vietnam",
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: "Dairy / milk",
  soy: "Soy",
  gluten: "Gluten",
  egg: "Egg",
  peanut: "Peanut",
  tree_nut: "Tree nuts",
  fish: "Fish",
  shellfish: "Shellfish",
};

export const CONDITION_LABELS: Record<HealthCondition, string> = {
  kidney_disease: "Kidney disease",
  liver_disease: "Liver disease",
  diabetes: "Diabetes / prediabetes",
  hypertension: "High blood pressure",
  heart_disease: "Heart disease",
  gout: "Gout / high uric acid",
  pregnant: "Pregnant",
  breastfeeding: "Breastfeeding",
  iron_overload_risk: "Thalassaemia (incl. trait) or haemochromatosis",
};

export const CURRENT_SUPPLEMENT_LABELS: Record<CurrentSupplement, string> = {
  protein: "Protein powder",
  creatine: "Creatine",
  vitamin_d: "Vitamin D",
  omega_3: "Fish oil / omega-3",
  iron: "Iron",
  vitamin_b12: "Vitamin B12",
  electrolytes: "Electrolytes",
  multivitamin: "Multivitamin",
  calcium: "Calcium",
  magnesium: "Magnesium",
  zinc: "Zinc",
  herbal: "Herbal products (e.g. St John's Wort, ginkgo)",
};

export const MEDICATION_LABELS: Record<MedicationClass, string> = {
  diuretic: "Diuretics (water pills)",
  nsaid_regular: "Painkillers like ibuprofen / naproxen, most days",
  nephrotoxic: "Other medicine my doctor said affects kidneys",
  anticoagulant: "Blood thinners (e.g. warfarin)",
  diabetes_medication: "Diabetes medicine (e.g. metformin, insulin)",
  blood_pressure: "Blood pressure medicine",
  other: "Other prescription medicine",
};
