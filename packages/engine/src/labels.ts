import type { Allergen, Country, Diet, Goal, HealthCondition, MedicationClass } from "./types";

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
