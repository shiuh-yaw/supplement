import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, evaluateCondition, userProfileSchema, validateCondition } from "../src";

const profile = userProfileSchema.parse({
  age: 40,
  sex: "female",
  weightKg: 60,
  country: "SG",
  goal: "strength",
  trainingDaysPerWeek: 3,
  diet: "vegetarian",
  conditions: ["hypertension"],
  labs: { egfr: 80 },
});

describe("evaluateCondition", () => {
  it("handles comparison, list and nested operators", () => {
    expect(evaluateCondition(profile, { fact: "age", op: "gte", value: 40 })).toBe(true);
    expect(evaluateCondition(profile, { fact: "goal", op: "in", value: ["strength"] })).toBe(true);
    expect(evaluateCondition(profile, { fact: "conditions", op: "contains", value: "hypertension" })).toBe(true);
    expect(
      evaluateCondition(profile, {
        all: [{ fact: "labs.egfr", op: "gt", value: 60 }, { not: { fact: "diet", op: "eq", value: "vegan" } }],
      }),
    ).toBe(true);
  });

  it("treats missing facts as false except for exists/notExists", () => {
    expect(evaluateCondition(profile, { fact: "labs.altUL", op: "gt", value: 0 })).toBe(false);
    expect(evaluateCondition(profile, { fact: "labs.altUL", op: "lt", value: 1000 })).toBe(false);
    expect(evaluateCondition(profile, { fact: "labs.altUL", op: "notExists" })).toBe(true);
  });
});

describe("validateCondition", () => {
  it("accepts every default rule", () => {
    for (const rule of DEFAULT_RULES) {
      expect(validateCondition(rule.condition), rule.id).toMatchObject({ ok: true });
    }
  });

  it("rejects unknown facts, bad operators and missing values", () => {
    expect(validateCondition({ fact: "shoeSize", op: "gt", value: 9 })).toMatchObject({ ok: false });
    expect(validateCondition({ fact: "age", op: "approx", value: 9 })).toMatchObject({ ok: false });
    expect(validateCondition({ fact: "age", op: "gt" })).toMatchObject({ ok: false });
    expect(validateCondition({ fact: "goal", op: "in", value: "strength" })).toMatchObject({ ok: false });
  });
});
