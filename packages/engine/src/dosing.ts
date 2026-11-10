import { msgs, unitLabel, type Locale } from "./i18n";
import type { Dose, DoseSchedule, DosingConfig, UserProfile } from "./types";

/** Thousands separator: comma in English and Malay, dot in Indonesian. */
export const groupDigits = (n: string, locale: Locale = "en") =>
  n.replace(/\B(?=(\d{3})+(?!\d))/g, locale === "id" || locale === "vi" ? "." : ",");

export function doseText(min: number, max: number, unit: string, schedule: DoseSchedule, locale: Locale = "en"): string {
  const amount = min === max ? `${min}` : `${min}–${max}`;
  return `${groupDigits(amount, locale)} ${unitLabel(unit, locale)}${msgs(locale).schedule[schedule]}`;
}

export type DoseOutcome =
  | { kind: "dose"; dose: Dose; reasons: string[] }
  | { kind: "not_needed"; reasons: string[] };

const round = (n: number, step = 5) => Math.round(n / step) * step;

export function computeDose(dosing: DosingConfig, profile: UserProfile, locale: Locale = "en"): DoseOutcome {
  const m = msgs(locale);
  if (dosing.kind === "fixed") {
    return {
      kind: "dose",
      dose: {
        min: dosing.min,
        max: dosing.max,
        unit: dosing.unit,
        schedule: dosing.schedule,
        text: doseText(dosing.min, dosing.max, dosing.unit, dosing.schedule, locale),
      },
      reasons: [],
    };
  }

  // protein_gap: work out the total daily target, then subtract food intake.
  const target = dosing.targetGPerKg[profile.goal] ?? { min: 0.8, max: 1.2 };
  let minPerKg = target.min;
  let maxPerKg = target.max;
  const reasons: string[] = [];

  if (profile.age >= 65 && minPerKg < dosing.olderAdultMinGPerKg) {
    minPerKg = dosing.olderAdultMinGPerKg;
    maxPerKg = Math.max(maxPerKg, minPerKg);
    reasons.push(m.older65(dosing.olderAdultMinGPerKg));
  }

  const targetMin = Math.round(minPerKg * profile.weightKg);
  const targetMax = Math.round(maxPerKg * profile.weightKg);
  reasons.push(m.proteinTarget(minPerKg, maxPerKg, targetMin, targetMax));

  let fromFood: number;
  if (profile.dietaryProteinG !== undefined) {
    fromFood = profile.dietaryProteinG;
    reasons.push(m.fromFood(Math.round(fromFood)));
  } else {
    fromFood = Math.round(dosing.assumedDietaryGPerKg * profile.weightKg);
    reasons.push(m.assumedFood(fromFood));
  }

  const gapMin = targetMin - fromFood;
  const gapMax = targetMax - fromFood;

  if (gapMax <= 0) {
    reasons.push(m.foodMeets);
    return { kind: "not_needed", reasons };
  }

  const min = Math.min(round(Math.max(gapMin, 20)), dosing.maxSupplementG);
  const max = Math.min(Math.max(round(gapMax), min), dosing.maxSupplementG);
  if (round(gapMax) > dosing.maxSupplementG) {
    reasons.push(m.gapTooLarge(dosing.maxSupplementG));
  }

  return {
    kind: "dose",
    dose: {
      min,
      max,
      unit: "g protein",
      schedule: "daily",
      text: doseText(min, max, "g protein", "daily", locale),
    },
    reasons,
  };
}
