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

// ---------------------------------------------------------------------------
// Translations. English above stays the default export used by the backoffice.
// ---------------------------------------------------------------------------
import type { Locale } from "./i18n";

export interface LabelSet {
  goals: Record<Goal, string>;
  diets: Record<Diet, string>;
  countries: Record<Country, string>;
  allergens: Record<Allergen, string>;
  conditions: Record<HealthCondition, string>;
  medications: Record<MedicationClass, string>;
  currentSupplements: Record<CurrentSupplement, string>;
}

const EN_LABELS: LabelSet = {
  goals: GOAL_LABELS,
  diets: DIET_LABELS,
  countries: COUNTRY_LABELS,
  allergens: ALLERGEN_LABELS,
  conditions: CONDITION_LABELS,
  medications: MEDICATION_LABELS,
  currentSupplements: CURRENT_SUPPLEMENT_LABELS,
};

const MS_LABELS: LabelSet = {
  goals: {
    muscle_gain: "Bina otot",
    strength: "Jadi lebih kuat",
    fat_loss: "Kurangkan lemak, kekalkan otot",
    endurance: "Ketahanan (larian, berbasikal…)",
    general_health: "Kesihatan umum",
  },
  diets: { omnivore: "Saya makan daging / ikan", vegetarian: "Vegetarian", vegan: "Vegan" },
  countries: { MY: "Malaysia", SG: "Singapura", ID: "Indonesia", TH: "Thailand", PH: "Filipina", VN: "Vietnam" },
  allergens: {
    dairy: "Tenusu / susu", soy: "Soya", gluten: "Gluten", egg: "Telur", peanut: "Kacang tanah",
    tree_nut: "Kekacang", fish: "Ikan", shellfish: "Kerang-kerangan",
  },
  conditions: {
    kidney_disease: "Penyakit buah pinggang",
    liver_disease: "Penyakit hati",
    diabetes: "Diabetes / pradiabetes",
    hypertension: "Tekanan darah tinggi",
    heart_disease: "Penyakit jantung",
    gout: "Gout / asid urik tinggi",
    pregnant: "Hamil",
    breastfeeding: "Menyusukan bayi",
    iron_overload_risk: "Talasemia (termasuk pembawa) atau hemokromatosis",
  },
  medications: {
    diuretic: "Diuretik (ubat buang air)",
    nsaid_regular: "Ubat tahan sakit seperti ibuprofen / naproxen, hampir setiap hari",
    nephrotoxic: "Ubat lain yang doktor kata menjejaskan buah pinggang",
    anticoagulant: "Ubat pencair darah (cth. warfarin)",
    diabetes_medication: "Ubat diabetes (cth. metformin, insulin)",
    blood_pressure: "Ubat tekanan darah",
    other: "Ubat preskripsi lain",
  },
  currentSupplements: {
    protein: "Serbuk protein", creatine: "Kreatin", vitamin_d: "Vitamin D", omega_3: "Minyak ikan / omega-3",
    iron: "Zat besi", vitamin_b12: "Vitamin B12", electrolytes: "Elektrolit", multivitamin: "Multivitamin",
    calcium: "Kalsium", magnesium: "Magnesium", zinc: "Zink", herbal: "Produk herba (cth. St John's Wort, ginkgo)",
  },
};

const ID_LABELS: LabelSet = {
  goals: {
    muscle_gain: "Membentuk otot",
    strength: "Menjadi lebih kuat",
    fat_loss: "Turunkan lemak, pertahankan otot",
    endurance: "Daya tahan (lari, bersepeda…)",
    general_health: "Kesehatan umum",
  },
  diets: { omnivore: "Saya makan daging / ikan", vegetarian: "Vegetarian", vegan: "Vegan" },
  countries: { MY: "Malaysia", SG: "Singapura", ID: "Indonesia", TH: "Thailand", PH: "Filipina", VN: "Vietnam" },
  allergens: {
    dairy: "Susu / produk susu", soy: "Kedelai", gluten: "Gluten", egg: "Telur", peanut: "Kacang tanah",
    tree_nut: "Kacang pohon", fish: "Ikan", shellfish: "Kerang",
  },
  conditions: {
    kidney_disease: "Penyakit ginjal",
    liver_disease: "Penyakit hati",
    diabetes: "Diabetes / prediabetes",
    hypertension: "Tekanan darah tinggi",
    heart_disease: "Penyakit jantung",
    gout: "Asam urat tinggi",
    pregnant: "Hamil",
    breastfeeding: "Menyusui",
    iron_overload_risk: "Talasemia (termasuk pembawa sifat) atau hemokromatosis",
  },
  medications: {
    diuretic: "Diuretik (obat peluruh air)",
    nsaid_regular: "Obat pereda nyeri seperti ibuprofen / naproxen, hampir setiap hari",
    nephrotoxic: "Obat lain yang menurut dokter memengaruhi ginjal",
    anticoagulant: "Obat pengencer darah (mis. warfarin)",
    diabetes_medication: "Obat diabetes (mis. metformin, insulin)",
    blood_pressure: "Obat tekanan darah",
    other: "Obat resep lainnya",
  },
  currentSupplements: {
    protein: "Bubuk protein", creatine: "Kreatin", vitamin_d: "Vitamin D", omega_3: "Minyak ikan / omega-3",
    iron: "Zat besi", vitamin_b12: "Vitamin B12", electrolytes: "Elektrolit", multivitamin: "Multivitamin",
    calcium: "Kalsium", magnesium: "Magnesium", zinc: "Zinc", herbal: "Produk herbal (mis. St John's Wort, ginkgo)",
  },
};

export const LABELS: Record<Locale, LabelSet> = { en: EN_LABELS, ms: MS_LABELS, id: ID_LABELS };
