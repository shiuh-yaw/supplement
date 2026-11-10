import type { LabUnit } from "@supplement/engine";

/** Test names in the AI extraction schema. */
export type ExtractedTest = "egfr" | "creatinine" | "alt" | "uricAcid" | "hba1c" | "vitaminD" | "ferritin" | "b12";

// ---------------------------------------------------------------------------
// Unit normalisation: map whatever the report printed onto our form's units.
// ---------------------------------------------------------------------------

const norm = (u: string) =>
  u
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[μµ]/g, "u")
    .replace(/litre|liter/g, "l");

export type FormLab =
  | "egfr"
  | "creatinineUmolL"
  | "altUL"
  | "uricAcidUmolL"
  | "hba1cPercent"
  | "vitaminDNmolL"
  | "ferritinUgL"
  | "b12PmolL";

interface Mapped {
  value: number;
  unit?: LabUnit;
}

/** Returns the value in a unit the form understands, or null if the unit isn't recognised. */
export function mapMeasurement(key: FormLab, m: { value: number; unit: string }): Mapped | null {
  const u = norm(m.unit);
  const si = (value = m.value): Mapped => ({ value, unit: "si" });
  const conv = (value = m.value): Mapped => ({ value, unit: "conv" });
  switch (key) {
    case "egfr":
      return /ml\/min/.test(u) ? { value: m.value } : null;
    case "altUL":
      return /^(iu|u)\/l$/.test(u) ? { value: m.value } : null;
    case "hba1cPercent":
      if (u === "%") return { value: m.value };
      // IFCC mmol/mol → NGSP %
      if (u === "mmol/mol") return { value: Math.round((m.value * 0.0915 + 2.15) * 10) / 10 };
      return null;
    case "ferritinUgL":
      return /^(ug\/l|ng\/ml)$/.test(u) ? { value: m.value } : null;
    case "creatinineUmolL":
      if (u === "umol/l") return si();
      if (u === "mg/dl") return conv();
      return null;
    case "uricAcidUmolL":
      if (u === "umol/l") return si();
      if (u === "mmol/l") return si(Math.round(m.value * 1000));
      if (u === "mg/dl") return conv();
      return null;
    case "vitaminDNmolL":
      if (u === "nmol/l") return si();
      if (u === "ng/ml" || u === "ug/l") return conv();
      return null;
    case "b12PmolL":
      if (u === "pmol/l") return si();
      if (u === "pg/ml" || u === "ng/l") return conv();
      return null;
  }
}

export const FIELDS: [ExtractedTest, FormLab, string][] = [
  ["egfr", "egfr", "eGFR"],
  ["creatinine", "creatinineUmolL", "Creatinine"],
  ["alt", "altUL", "ALT"],
  ["uricAcid", "uricAcidUmolL", "Uric acid"],
  ["hba1c", "hba1cPercent", "HbA1c"],
  ["vitaminD", "vitaminDNmolL", "Vitamin D"],
  ["ferritin", "ferritinUgL", "Ferritin"],
  ["b12", "b12PmolL", "Vitamin B12"],
];

