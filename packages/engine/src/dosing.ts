import type { Dose, DosingConfig, UserProfile } from "./types";

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
        text: dosing.min === dosing.max ? `${dosing.min} ${dosing.unit}/day` : `${dosing.min}–${dosing.max} ${dosing.unit}/day`,
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
      text: min === max ? `${min} g protein/day` : `${min}–${max} g protein/day`,
    },
    reasons,
  };
}
