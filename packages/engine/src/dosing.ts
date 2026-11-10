import type { Dose, DoseSchedule, DosingConfig, UserProfile } from "./types";

const SCHEDULE_TEXT: Record<DoseSchedule, string> = {
  daily: "/day",
  every_other_day: " every other day",
  per_exercise_hour: " per hour of exercise",
};

export function doseText(min: number, max: number, unit: string, schedule: DoseSchedule): string {
  const amount = min === max ? `${min}` : `${min}–${max}`;
  const fmt = (n: string) => n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${fmt(amount)} ${unit}${SCHEDULE_TEXT[schedule]}`;
}

export type DoseOutcome =
  | { kind: "dose"; dose: Dose; reasons: string[] }
  | { kind: "not_needed"; reasons: string[] };

const round = (n: number, step = 5) => Math.round(n / step) * step;

export function computeDose(dosing: DosingConfig, profile: UserProfile): DoseOutcome {
  if (dosing.kind === "fixed") {
    return {
      kind: "dose",
      dose: {
        min: dosing.min,
        max: dosing.max,
        unit: dosing.unit,
        schedule: dosing.schedule,
        text: doseText(dosing.min, dosing.max, dosing.unit, dosing.schedule),
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
    reasons.push(`Adults 65+ need at least ${dosing.olderAdultMinGPerKg} g/kg/day to maintain muscle.`);
  }

  const targetMin = Math.round(minPerKg * profile.weightKg);
  const targetMax = Math.round(maxPerKg * profile.weightKg);
  reasons.push(
    `Your total protein target is ${minPerKg}–${maxPerKg} g/kg/day ≈ ${targetMin}–${targetMax} g/day for your goal and weight.`,
  );

  let fromFood: number;
  if (profile.dietaryProteinG !== undefined) {
    fromFood = profile.dietaryProteinG;
    reasons.push(`You get about ${Math.round(fromFood)} g/day from food.`);
  } else {
    fromFood = Math.round(dosing.assumedDietaryGPerKg * profile.weightKg);
    reasons.push(
      `You didn't tell us your food intake, so we assumed ~${fromFood} g/day. Track a few days of meals for a more accurate number.`,
    );
  }

  const gapMin = targetMin - fromFood;
  const gapMax = targetMax - fromFood;

  if (gapMax <= 0) {
    reasons.push("Food alone already meets your target — a protein supplement is optional, not needed.");
    return { kind: "not_needed", reasons };
  }

  const min = Math.min(round(Math.max(gapMin, 20)), dosing.maxSupplementG);
  const max = Math.min(Math.max(round(gapMax), min), dosing.maxSupplementG);
  if (round(gapMax) > dosing.maxSupplementG) {
    reasons.push(
      `Your gap is larger than ${dosing.maxSupplementG} g/day; cover the rest with protein-rich meals rather than more powder.`,
    );
  }

  return {
    kind: "dose",
    dose: {
      min,
      max,
      unit: "g protein",
      schedule: "daily",
      text: doseText(min, max, "g protein", "daily"),
    },
    reasons,
  };
}
