import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  DEFAULT_SUPPLEMENTS,
  NEW_RECOMMEND_RULE_IDS,
  SAMPLE_PRODUCTS,
  recommend,
  validateCondition,
  type KnowledgeBase,
  type UserProfileInput,
} from "../src";

const kb: KnowledgeBase = { supplements: DEFAULT_SUPPLEMENTS, rules: DEFAULT_RULES, products: SAMPLE_PRODUCTS };

const base: UserProfileInput = {
  age: 32,
  sex: "female",
  weightKg: 58,
  country: "MY",
  goal: "general_health",
  trainingDaysPerWeek: 1,
  diet: "omnivore",
  fishServingsPerWeek: 2,
};

const item = (input: UserProfileInput, slug: string) => {
  const found = recommend(input, kb).items.find((i) => i.supplement.slug === slug);
  if (!found) throw new Error(`no item ${slug}`);
  return found;
};
const ids = (notices: { ruleId: string }[]) => notices.map((n) => n.ruleId);

describe("knowledge base", () => {
  it("has valid conditions for every rule", () => {
    for (const rule of DEFAULT_RULES) expect(validateCondition(rule.condition), rule.id).toMatchObject({ ok: true });
  });

  it("only marks recommend rules as needing review, never safety rules", () => {
    expect(NEW_RECOMMEND_RULE_IDS.size).toBeGreaterThan(0);
    for (const id of NEW_RECOMMEND_RULE_IDS) {
      expect(DEFAULT_RULES.find((r) => r.id === id)?.effect).toBe("recommend");
    }
  });

  it("recommends nothing new to a healthy omnivore with no lab results", () => {
    const statuses = recommend(base, kb).items.filter((i) => i.status === "recommended").map((i) => i.supplement.slug);
    expect(statuses).toEqual([]); // general_health, under 65, eats fish, no labs → nothing
  });
});

describe("vitamin D", () => {
  it("is recommended for a low level, with a caution when very low", () => {
    const d = item({ ...base, labs: { vitaminDNmolL: 25 } }, "vitamin_d");
    expect(d.status).toBe("recommended");
    expect(d.dose?.text).toBe("1,000 IU/day");
    expect(ids(d.cautions)).toContain("vitd-caution-very-low");
  });

  it("is not recommended at an adequate level, and blocked when already high", () => {
    expect(item({ ...base, labs: { vitaminDNmolL: 80 } }, "vitamin_d").status).toBe("not_recommended");
    expect(item({ ...base, labs: { vitaminDNmolL: 180 } }, "vitamin_d").status).toBe("blocked");
  });

  it("is recommended for 75+ without a test", () => {
    expect(item({ ...base, age: 78 }, "vitamin_d").status).toBe("recommended");
  });

  it("warns about double-dosing with a multivitamin", () => {
    const d = item({ ...base, labs: { vitaminDNmolL: 40 }, currentSupplements: ["multivitamin"] }, "vitamin_d");
    expect(ids(d.cautions)).toContain("vitd-caution-multivitamin");
  });
});

describe("omega-3", () => {
  it("is recommended when fish is rare, and offers algae oil to vegans", () => {
    expect(item({ ...base, fishServingsPerWeek: 0 }, "omega_3").status).toBe("recommended");
    const vegan = item({ ...base, diet: "vegan", fishServingsPerWeek: undefined }, "omega_3");
    expect(vegan.status).toBe("recommended");
    expect(vegan.products.map((p) => p.product.form)).toEqual(["algae_oil"]);
  });

  it("excludes fish oil for fish allergy and cautions with blood thinners", () => {
    const o = item({ ...base, fishServingsPerWeek: 0, allergies: ["fish"], medications: ["anticoagulant"] }, "omega_3");
    expect(o.products.every((p) => !p.product.allergens.includes("fish"))).toBe(true);
    expect(ids(o.cautions)).toContain("omega3-caution-anticoagulant");
  });
});

describe("iron", () => {
  it("is never recommended without a ferritin result", () => {
    expect(item(base, "iron").status).toBe("not_recommended");
  });

  it("is recommended every other day for low ferritin in women under 50", () => {
    const iron = item({ ...base, labs: { ferritinUgL: 12 } }, "iron");
    expect(iron.status).toBe("recommended");
    expect(iron.dose?.text).toBe("60–65 mg iron every other day");
  });

  it("is blocked for men and women 50+ with low ferritin (cause must be found)", () => {
    expect(item({ ...base, sex: "male", labs: { ferritinUgL: 12 } }, "iron").status).toBe("blocked");
    expect(item({ ...base, age: 55, labs: { ferritinUgL: 12 } }, "iron").status).toBe("blocked");
  });

  it("is blocked with thalassaemia even when ferritin is low", () => {
    const iron = item({ ...base, conditions: ["iron_overload_risk"], labs: { ferritinUgL: 12 } }, "iron");
    expect(iron.status).toBe("blocked");
    expect(ids(iron.blocks)).toContain("iron-block-overload-risk");
  });

  it("tells someone already taking iron with high ferritin to check with a doctor", () => {
    const iron = item({ ...base, currentSupplements: ["iron"], labs: { ferritinUgL: 300 } }, "iron");
    expect(iron.status).toBe("blocked");
    expect(iron.alreadyTaking).toBe(true);
    expect(iron.reasons.join(" ")).toMatch(/check with your doctor/);
  });
});

describe("vitamin B12", () => {
  it("is recommended for vegans, vegetarians, 65+ and diabetes medicine", () => {
    for (const p of [
      { ...base, diet: "vegan" as const },
      { ...base, diet: "vegetarian" as const },
      { ...base, age: 70 },
      { ...base, medications: ["diabetes_medication" as const] },
    ]) {
      expect(item(p, "vitamin_b12").status).toBe("recommended");
    }
    expect(item(base, "vitamin_b12").status).toBe("not_recommended");
  });

  it("asks for a doctor's check when the level is low", () => {
    const b12 = item({ ...base, labs: { b12PmolL: 100 } }, "vitamin_b12");
    expect(b12.status).toBe("recommended");
    expect(ids(b12.cautions)).toContain("b12-caution-low-lab");
  });
});

describe("electrolytes", () => {
  const runner = { ...base, goal: "endurance" as const, trainingDaysPerWeek: 5 };

  it("is recommended per hour of exercise for endurance athletes", () => {
    const e = item(runner, "electrolytes");
    expect(e.status).toBe("recommended");
    expect(e.dose?.text).toBe("300–600 mg sodium per hour of exercise");
    expect(e.products.map((p) => p.product.id).sort()).toEqual(["sample-electrolyte-drink", "sample-electrolyte-tabs"]);
    const sugary = e.products.find((p) => p.product.sugarPerServingG > 0);
    expect(sugary?.reasons.join(" ")).toMatch(/sugar per serving/);
  });

  it("puts the sugar-free option first for someone managing blood sugar", () => {
    const e = item({ ...runner, conditions: ["diabetes"] }, "electrolytes");
    expect(e.products[0]?.product.sugarPerServingG).toBe(0);
  });

  it("is blocked with kidney disease and cautioned with high blood pressure", () => {
    expect(item({ ...runner, conditions: ["kidney_disease"] }, "electrolytes").status).toBe("blocked");
    expect(ids(item({ ...runner, conditions: ["hypertension"] }, "electrolytes").cautions)).toContain(
      "electrolytes-caution-bp",
    );
  });
});

describe("already taking", () => {
  it("acknowledges a supplement the user already takes", () => {
    const creatine = item({ ...base, goal: "strength", trainingDaysPerWeek: 4, currentSupplements: ["creatine"] }, "creatine");
    expect(creatine.alreadyTaking).toBe(true);
    expect(creatine.reasons[0]).toMatch(/already take/);
  });

  it("questions a supplement the user takes but doesn't need", () => {
    const d = item({ ...base, currentSupplements: ["vitamin_d"], labs: { vitaminDNmolL: 90 } }, "vitamin_d");
    expect(d.status).toBe("not_recommended");
    expect(d.reasons[0]).toMatch(/nothing in your answers shows you need it/);
  });

  it("raises a general caution for herbal products", () => {
    expect(ids(recommend({ ...base, currentSupplements: ["herbal"] }, kb).generalCautions)).toContain("global-herbal");
  });
});

describe("servings for capsules and high-strength products", () => {
  const capsule = (active: number, slug = "omega_3", form = "fish_oil") => ({
    id: "x", supplementSlug: slug, brand: "B", name: "N", form, servingSizeG: 0, activePerServingG: active,
    sugarPerServingG: 0, servingsPerContainer: 30, allergens: [], vegan: false, halalCertified: false,
    certifications: [], prices: [{ country: "MY" as const, currency: "MYR", price: 30 }],
  });
  it("counts capsules in whole units", async () => {
    const { servingsFor } = await import("../src/ranking");
    expect(servingsFor({ min: 250, max: 500, unit: "mg EPA+DHA", schedule: "daily", text: "" }, capsule(300))).toEqual({ min: 1, max: 2 });
  });
  it("shows one tablet for high-strength B12 and says it's more than needed", () => {
    const kbB12: KnowledgeBase = { ...kb, products: [{ ...capsule(600, "vitamin_b12", "cyanocobalamin"), vegan: true }] };
    const b12 = recommend({ ...base, diet: "vegan" }, kbB12).items.find((i) => i.supplement.slug === "vitamin_b12")!;
    expect(b12.products[0]?.servingsPerDose).toEqual({ min: 1, max: 1 });
    expect(b12.products[0]?.reasons.join(" ")).toMatch(/more than the 100 µg suggested/);
  });
  it("leaves out products far stronger than the dose when there's an upper limit", () => {
    const kbD: KnowledgeBase = { ...kb, products: [capsule(5000, "vitamin_d", "vitamin_d3")] };
    const d = recommend({ ...base, labs: { vitaminDNmolL: 30 } }, kbD).items.find((i) => i.supplement.slug === "vitamin_d")!;
    expect(d.status).toBe("recommended");
    expect(d.products).toHaveLength(0);
  });
});
