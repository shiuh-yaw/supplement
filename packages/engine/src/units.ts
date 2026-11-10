import type { Country } from "./types";

/**
 * Lab values are stored in SI units (µmol/L). Many labs in Indonesia, Thailand,
 * the Philippines and Vietnam report creatinine and uric acid in mg/dL, so the
 * questionnaire lets people enter either and converts here.
 */
export type ConvertibleLab = "creatinineUmolL" | "uricAcidUmolL";
export type LabUnit = "umol" | "mgdl";

interface LabUnitSpec {
  /** µmol/L per 1 mg/dL */
  factor: number;
  /** Typical adult reference range, for hints. */
  typical: Record<LabUnit, [number, number]>;
  /** Values outside these bounds almost certainly mean the other unit was used. */
  implausible: { umolBelow: number; mgdlAbove: number };
}

export const LAB_UNIT_SPECS: Record<ConvertibleLab, LabUnitSpec> = {
  creatinineUmolL: {
    factor: 88.42,
    typical: { umol: [45, 110], mgdl: [0.5, 1.25] },
    implausible: { umolBelow: 15, mgdlAbove: 20 },
  },
  uricAcidUmolL: {
    factor: 59.48,
    typical: { umol: [150, 420], mgdl: [2.5, 7] },
    implausible: { umolBelow: 30, mgdlAbove: 25 },
  },
};

export const LAB_UNIT_LABELS: Record<LabUnit, string> = { umol: "µmol/L", mgdl: "mg/dL" };

/** The unit people in each country most often see on their lab report. */
export const DEFAULT_LAB_UNIT: Record<Country, LabUnit> = {
  MY: "umol",
  SG: "umol",
  ID: "mgdl",
  TH: "mgdl",
  PH: "mgdl",
  VN: "mgdl",
};

export function toUmolL(lab: ConvertibleLab, value: number, unit: LabUnit): number {
  const v = unit === "umol" ? value : value * LAB_UNIT_SPECS[lab].factor;
  return Math.round(v * 10) / 10;
}

export function fromUmolL(lab: ConvertibleLab, umol: number, unit: LabUnit): number {
  if (unit === "umol") return umol;
  return Math.round((umol / LAB_UNIT_SPECS[lab].factor) * 100) / 100;
}

/** Returns the unit the value was probably meant in, if it doesn't fit the chosen one. */
export function suggestOtherUnit(lab: ConvertibleLab, value: number, unit: LabUnit): LabUnit | null {
  const { implausible } = LAB_UNIT_SPECS[lab];
  if (unit === "umol" && value > 0 && value < implausible.umolBelow) return "mgdl";
  if (unit === "mgdl" && value > implausible.mgdlAbove) return "umol";
  return null;
}
