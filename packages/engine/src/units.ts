import type { Country } from "./types";

/**
 * Lab values are stored in SI units. Many labs in Indonesia, Thailand, the
 * Philippines and Vietnam report in conventional units instead (mg/dL, ng/mL,
 * pg/mL), so the questionnaire lets people enter either and converts here.
 */
export type ConvertibleLab = "creatinineUmolL" | "uricAcidUmolL" | "vitaminDNmolL" | "b12PmolL";
/** "si" = the unit we store; "conv" = the conventional unit. */
export type LabUnit = "si" | "conv";

interface LabUnitSpec {
  labels: Record<LabUnit, string>;
  /** SI units per 1 conventional unit. */
  factor: number;
  /** Typical adult reference range, for hints. */
  typical: Record<LabUnit, [number, number]>;
  /** Values beyond these almost certainly mean the other unit was used. */
  implausible: { siBelow: number; convAbove: number };
}

export const LAB_UNIT_SPECS: Record<ConvertibleLab, LabUnitSpec> = {
  creatinineUmolL: {
    labels: { si: "µmol/L", conv: "mg/dL" },
    factor: 88.42,
    typical: { si: [45, 110], conv: [0.5, 1.25] },
    implausible: { siBelow: 15, convAbove: 20 },
  },
  uricAcidUmolL: {
    labels: { si: "µmol/L", conv: "mg/dL" },
    factor: 59.48,
    typical: { si: [150, 420], conv: [2.5, 7] },
    implausible: { siBelow: 30, convAbove: 25 },
  },
  vitaminDNmolL: {
    labels: { si: "nmol/L", conv: "ng/mL" },
    factor: 2.496,
    typical: { si: [50, 125], conv: [20, 50] },
    implausible: { siBelow: 8, convAbove: 150 },
  },
  b12PmolL: {
    labels: { si: "pmol/L", conv: "pg/mL" },
    factor: 0.738,
    typical: { si: [150, 600], conv: [200, 900] },
    implausible: { siBelow: 30, convAbove: 3000 },
  },
};

/** Malaysia and Singapore labs mostly report SI units; the rest of the region mostly conventional. */
const SI_COUNTRIES: Country[] = ["MY", "SG"];
export const defaultLabUnit = (country: Country): LabUnit => (SI_COUNTRIES.includes(country) ? "si" : "conv");

export const labUnitLabel = (lab: ConvertibleLab, unit: LabUnit) => LAB_UNIT_SPECS[lab].labels[unit];

export function toSi(lab: ConvertibleLab, value: number, unit: LabUnit): number {
  const v = unit === "si" ? value : value * LAB_UNIT_SPECS[lab].factor;
  return Math.round(v * 10) / 10;
}

export function fromSi(lab: ConvertibleLab, si: number, unit: LabUnit): number {
  if (unit === "si") return si;
  return Math.round((si / LAB_UNIT_SPECS[lab].factor) * 100) / 100;
}

/** Returns the unit the value was probably meant in, if it doesn't fit the chosen one. */
export function suggestOtherUnit(lab: ConvertibleLab, value: number, unit: LabUnit): LabUnit | null {
  const { implausible } = LAB_UNIT_SPECS[lab];
  if (unit === "si" && value > 0 && value < implausible.siBelow) return "conv";
  if (unit === "conv" && value > implausible.convAbove) return "si";
  return null;
}
