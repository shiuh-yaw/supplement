import { TH_ENGINE } from "./locales/th";
import { VI_ENGINE } from "./locales/vi";
import type { DoseSchedule } from "./types";

export const LOCALES = ["en", "ms", "id", "th", "vi"] as const;
/** Languages other than English (the knowledge base's main language). */
export const TRANSLATED_LOCALES = ["ms", "id", "th", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  id: "Bahasa Indonesia",
  th: "ไทย",
  vi: "Tiếng Việt",
};
export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Everything the engine itself writes for people. KB content (rules, supplements) is translated in the database. */
export interface EngineMessages {
  schedule: Record<DoseSchedule, string>;
  /** Dose units stored on supplements, e.g. "mg iron". Unknown units are shown as stored. */
  units: Record<string, string>;
  older65: (min: number) => string;
  proteinTarget: (minKg: number, maxKg: number, min: number, max: number) => string;
  fromFood: (g: number) => string;
  assumedFood: (g: number) => string;
  foodMeets: string;
  gapTooLarge: (max: number) => string;
  notSold: string;
  contains: (allergen: string) => string;
  notVegan: string;
  lactose: string;
  notHalal: string;
  tested: (list: string) => string;
  noTesting: string;
  bestValue: string;
  sugarEnergy: (g: number) => string;
  lowSugar: string;
  sugarBad: (g: number) => string;
  overBudget: string;
  halal: string;
  moreThanSuggested: (active: string, max: string, unit: string) => string;
  isolateLactose: string;
  creatineMono: string;
  creatineOther: string;
  vitD3: string;
  vitD2: string;
  algaeOil: string;
  fishOil: string;
  proteinPct: (pct: number) => string;
  proteinPctLow: (pct: number) => string;
  alreadyBlocked: string;
  alreadyNotNeeded: string;
  notIndicated: string;
  alreadyTaking: string;
  noProducts: string;
  noMatch: (why: string) => string;
  disclaimer: string;
  allergens: Record<string, string>;
}

const en: EngineMessages = {
  schedule: { daily: "/day", every_other_day: " every other day", per_exercise_hour: " per hour of exercise" },
  units: {},
  older65: (min) => `Adults 65+ need at least ${min} g/kg/day to maintain muscle.`,
  proteinTarget: (a, b, min, max) =>
    `Your total protein target is ${a}–${b} g/kg/day ≈ ${min}–${max} g/day for your goal and weight.`,
  fromFood: (g) => `You get about ${g} g/day from food.`,
  assumedFood: (g) =>
    `You didn't tell us your food intake, so we assumed ~${g} g/day. Track a few days of meals for a more accurate number.`,
  foodMeets: "Food alone already meets your target — a protein supplement is optional, not needed.",
  gapTooLarge: (max) =>
    `Your gap is larger than ${max} g/day; cover the rest with protein-rich meals rather than more powder.`,
  notSold: "Not sold in your country",
  contains: (a) => `Contains ${a}`,
  notVegan: "Not confirmed vegan",
  lactose: "Contains lactose",
  notHalal: "Not confirmed halal",
  tested: (list) => `Third-party tested (${list})`,
  noTesting: "No third-party testing certification on record",
  bestValue: "Among the best value per gram",
  sugarEnergy: (g) => `${g} g sugar per serving — useful energy for long sessions, but it adds up`,
  lowSugar: "Low sugar — suits blood-sugar management",
  sugarBad: (g) => `${g} g sugar per serving — not ideal for blood-sugar control`,
  overBudget: "Above your monthly budget",
  halal: "Halal certified",
  moreThanSuggested: (active, max, unit) => `One serving has ${active} ${unit} — more than the ${max} ${unit} suggested`,
  isolateLactose: "Isolate — usually under 1 g lactose per serving; start with a small dose",
  creatineMono: "Creatine monohydrate — the most researched form",
  creatineOther: "Less-researched creatine form; no proven advantage over monohydrate",
  vitD3: "Vitamin D3 — raises blood levels better than D2",
  vitD2: "Vitamin D2 — works, but D3 raises levels more",
  algaeOil: "Algae oil — plant-based EPA/DHA",
  fishOil: "Fish oil with EPA + DHA",
  proteinPct: (p) => `${p}% protein by weight`,
  proteinPctLow: (p) => `Only ${p}% protein by weight (lots of filler)`,
  alreadyBlocked: "You told us you take this now. Please check with your doctor before continuing.",
  alreadyNotNeeded:
    "You take this now, but nothing in your answers shows you need it. Ask your doctor or pharmacist whether to continue.",
  notIndicated: "Not indicated for your goal and profile.",
  alreadyTaking: "You already take this — keep going, and check your product gives the amount below.",
  noProducts: "No products in our catalog yet.",
  noMatch: (why) => `No catalog products match your needs (${why}).`,
  disclaimer:
    "This is general education, not medical advice. It doesn't diagnose or treat any condition. " +
    "Talk to your doctor, dietitian or pharmacist before starting a supplement — especially if you have a " +
    "medical condition, take medication, or are pregnant or breastfeeding.",
  allergens: {
    dairy: "dairy", soy: "soy", gluten: "gluten", egg: "egg", peanut: "peanut", tree_nut: "tree nuts", fish: "fish", shellfish: "shellfish",
  },
};

const ms: EngineMessages = {
  schedule: { daily: "/hari", every_other_day: " selang sehari", per_exercise_hour: " bagi setiap jam bersenam" },
  units: { "g protein": "g protein", "mg iron": "mg zat besi", "mg sodium": "mg natrium", "mg EPA+DHA": "mg EPA+DHA" },
  older65: (min) => `Orang dewasa 65 tahun ke atas memerlukan sekurang-kurangnya ${min} g/kg/hari untuk mengekalkan otot.`,
  proteinTarget: (a, b, min, max) =>
    `Sasaran protein harian anda ialah ${a}–${b} g/kg/hari ≈ ${min}–${max} g/hari berdasarkan matlamat dan berat badan anda.`,
  fromFood: (g) => `Anda mendapat kira-kira ${g} g/hari daripada makanan.`,
  assumedFood: (g) =>
    `Anda tidak memberitahu pengambilan makanan anda, jadi kami anggarkan ~${g} g/hari. Catat makanan anda selama beberapa hari untuk angka yang lebih tepat.`,
  foodMeets: "Makanan sahaja sudah mencukupi sasaran anda — suplemen protein adalah pilihan, bukan keperluan.",
  gapTooLarge: (max) =>
    `Kekurangan anda melebihi ${max} g/hari; penuhi selebihnya dengan makanan kaya protein, bukan lebih banyak serbuk.`,
  notSold: "Tidak dijual di negara anda",
  contains: (a) => `Mengandungi ${a}`,
  notVegan: "Status vegan belum disahkan",
  lactose: "Mengandungi laktosa",
  notHalal: "Status halal belum disahkan",
  tested: (list) => `Diuji oleh pihak ketiga (${list})`,
  noTesting: "Tiada rekod pensijilan ujian pihak ketiga",
  bestValue: "Antara yang paling berbaloi bagi setiap gram",
  sugarEnergy: (g) => `${g} g gula setiap hidangan — tenaga berguna untuk sesi panjang, tetapi ia boleh bertambah`,
  lowSugar: "Rendah gula — sesuai untuk kawalan gula darah",
  sugarBad: (g) => `${g} g gula setiap hidangan — kurang sesuai untuk kawalan gula darah`,
  overBudget: "Melebihi bajet bulanan anda",
  halal: "Diperakui halal",
  moreThanSuggested: (active, max, unit) => `Satu hidangan mengandungi ${active} ${unit} — lebih daripada ${max} ${unit} yang dicadangkan`,
  isolateLactose: "Isolat — biasanya kurang daripada 1 g laktosa setiap hidangan; mulakan dengan dos kecil",
  creatineMono: "Kreatin monohidrat — bentuk yang paling banyak dikaji",
  creatineOther: "Bentuk kreatin yang kurang dikaji; tiada kelebihan terbukti berbanding monohidrat",
  vitD3: "Vitamin D3 — meningkatkan paras darah lebih baik daripada D2",
  vitD2: "Vitamin D2 — berkesan, tetapi D3 meningkatkan paras lebih banyak",
  algaeOil: "Minyak alga — EPA/DHA berasaskan tumbuhan",
  fishOil: "Minyak ikan dengan EPA + DHA",
  proteinPct: (p) => `${p}% protein mengikut berat`,
  proteinPctLow: (p) => `Hanya ${p}% protein mengikut berat (banyak bahan pengisi)`,
  alreadyBlocked: "Anda memberitahu kami anda sedang mengambil ini. Sila dapatkan nasihat doktor sebelum meneruskannya.",
  alreadyNotNeeded:
    "Anda sedang mengambil ini, tetapi jawapan anda tidak menunjukkan anda memerlukannya. Tanya doktor atau ahli farmasi sama ada perlu diteruskan.",
  notIndicated: "Tidak disyorkan untuk matlamat dan profil anda.",
  alreadyTaking: "Anda sudah mengambil ini — teruskan, dan pastikan produk anda memberikan jumlah di bawah.",
  noProducts: "Belum ada produk dalam katalog kami.",
  noMatch: (why) => `Tiada produk dalam katalog yang sesuai dengan keperluan anda (${why}).`,
  disclaimer:
    "Ini maklumat pendidikan umum, bukan nasihat perubatan. Ia tidak mendiagnosis atau merawat sebarang penyakit. " +
    "Berbincang dengan doktor, pakar diet atau ahli farmasi anda sebelum memulakan suplemen — terutamanya jika anda " +
    "mempunyai masalah kesihatan, mengambil ubat, atau sedang hamil atau menyusukan bayi.",
  allergens: {
    dairy: "susu", soy: "soya", gluten: "gluten", egg: "telur", peanut: "kacang tanah", tree_nut: "kekacang", fish: "ikan", shellfish: "kerang-kerangan",
  },
};

const id: EngineMessages = {
  schedule: { daily: "/hari", every_other_day: " dua hari sekali", per_exercise_hour: " per jam olahraga" },
  units: { "g protein": "g protein", "mg iron": "mg zat besi", "mg sodium": "mg natrium", "mg EPA+DHA": "mg EPA+DHA" },
  older65: (min) => `Orang dewasa usia 65+ membutuhkan setidaknya ${min} g/kg/hari untuk menjaga otot.`,
  proteinTarget: (a, b, min, max) =>
    `Target protein harian Anda ${a}–${b} g/kg/hari ≈ ${min}–${max} g/hari sesuai tujuan dan berat badan Anda.`,
  fromFood: (g) => `Anda mendapat sekitar ${g} g/hari dari makanan.`,
  assumedFood: (g) =>
    `Anda tidak menyebutkan asupan makanan, jadi kami perkirakan ~${g} g/hari. Catat makanan Anda selama beberapa hari untuk angka yang lebih akurat.`,
  foodMeets: "Makanan saja sudah memenuhi target Anda — suplemen protein bersifat opsional, tidak diperlukan.",
  gapTooLarge: (max) =>
    `Kekurangan Anda lebih dari ${max} g/hari; penuhi sisanya dengan makanan tinggi protein, bukan dengan lebih banyak bubuk.`,
  notSold: "Tidak dijual di negara Anda",
  contains: (a) => `Mengandung ${a}`,
  notVegan: "Status vegan belum terkonfirmasi",
  lactose: "Mengandung laktosa",
  notHalal: "Status halal belum terkonfirmasi",
  tested: (list) => `Diuji pihak ketiga (${list})`,
  noTesting: "Tidak ada catatan sertifikasi uji pihak ketiga",
  bestValue: "Termasuk paling hemat per gram",
  sugarEnergy: (g) => `${g} g gula per sajian — energi berguna untuk sesi panjang, tetapi bisa menumpuk`,
  lowSugar: "Rendah gula — cocok untuk mengontrol gula darah",
  sugarBad: (g) => `${g} g gula per sajian — kurang ideal untuk mengontrol gula darah`,
  overBudget: "Melebihi anggaran bulanan Anda",
  halal: "Bersertifikat halal",
  moreThanSuggested: (active, max, unit) => `Satu sajian berisi ${active} ${unit} — lebih dari ${max} ${unit} yang disarankan`,
  isolateLactose: "Isolat — biasanya kurang dari 1 g laktosa per sajian; mulai dengan dosis kecil",
  creatineMono: "Kreatin monohidrat — bentuk yang paling banyak diteliti",
  creatineOther: "Bentuk kreatin yang kurang diteliti; tidak terbukti lebih baik dari monohidrat",
  vitD3: "Vitamin D3 — menaikkan kadar dalam darah lebih baik dari D2",
  vitD2: "Vitamin D2 — efektif, tetapi D3 menaikkan kadar lebih banyak",
  algaeOil: "Minyak alga — EPA/DHA nabati",
  fishOil: "Minyak ikan dengan EPA + DHA",
  proteinPct: (p) => `${p}% protein berdasarkan berat`,
  proteinPctLow: (p) => `Hanya ${p}% protein berdasarkan berat (banyak bahan pengisi)`,
  alreadyBlocked: "Anda menyebutkan sedang mengonsumsi ini. Konsultasikan dengan dokter sebelum melanjutkan.",
  alreadyNotNeeded:
    "Anda sedang mengonsumsi ini, tetapi jawaban Anda tidak menunjukkan bahwa Anda membutuhkannya. Tanyakan dokter atau apoteker apakah perlu dilanjutkan.",
  notIndicated: "Tidak dianjurkan untuk tujuan dan profil Anda.",
  alreadyTaking: "Anda sudah mengonsumsi ini — lanjutkan, dan pastikan produk Anda memberi jumlah di bawah ini.",
  noProducts: "Belum ada produk di katalog kami.",
  noMatch: (why) => `Tidak ada produk di katalog yang sesuai dengan kebutuhan Anda (${why}).`,
  disclaimer:
    "Ini adalah informasi edukasi umum, bukan saran medis. Informasi ini tidak mendiagnosis atau mengobati penyakit apa pun. " +
    "Konsultasikan dengan dokter, ahli gizi, atau apoteker sebelum mulai mengonsumsi suplemen — terutama jika Anda " +
    "memiliki kondisi medis, sedang minum obat, atau sedang hamil atau menyusui.",
  allergens: {
    dairy: "susu", soy: "kedelai", gluten: "gluten", egg: "telur", peanut: "kacang tanah", tree_nut: "kacang pohon", fish: "ikan", shellfish: "kerang",
  },
};

export const ENGINE_MESSAGES: Record<Locale, EngineMessages> = { en, ms, id, th: TH_ENGINE, vi: VI_ENGINE };
export const msgs = (locale: Locale = "en") => ENGINE_MESSAGES[locale];
export const unitLabel = (unit: string, locale: Locale = "en") => msgs(locale).units[unit] ?? unit;
