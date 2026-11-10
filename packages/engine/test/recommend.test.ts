import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  DEFAULT_SUPPLEMENTS,
  SAMPLE_PRODUCTS,
  recommend,
  type KnowledgeBase,
  type UserProfileInput,
} from "../src";

const kb: KnowledgeBase = { supplements: DEFAULT_SUPPLEMENTS, rules: DEFAULT_RULES, products: SAMPLE_PRODUCTS };

const base: UserProfileInput = {
  age: 28,
  sex: "male",
  weightKg: 75,
  country: "MY",
  goal: "muscle_gain",
  trainingDaysPerWeek: 4,
  diet: "omnivore",
  dietaryProteinG: 90,
};

const item = (input: UserProfileInput, slug: string) => {
  const result = recommend(input, kb);
  const found = result.items.find((i) => i.supplement.slug === slug);
  if (!found) throw new Error(`no item ${slug}`);
  return found;
};

describe("recommendations", () => {
  it("recommends protein and creatine for a healthy adult lifting for muscle gain", () => {
    const protein = item(base, "protein");
    const creatine = item(base, "creatine");
    expect(protein.status).toBe("recommended");
    expect(creatine.status).toBe("recommended");
    expect(creatine.dose).toMatchObject({ min: 3, max: 5, unit: "g" });
  });

  it("sizes the protein dose to fill the gap left by food", () => {
    // 75 kg × 1.6–2.2 = 120–165 g; food 90 g → gap 30–75 g, capped at 60.
    const protein = item(base, "protein");
    expect(protein.dose).toMatchObject({ min: 30, max: 60 });
  });

  it("says protein isn't needed when food already meets the target", () => {
    const protein = item({ ...base, dietaryProteinG: 180 }, "protein");
    expect(protein.status).toBe("not_needed");
    expect(protein.products).toHaveLength(0);
  });

  it("assumes food intake and says so when the user doesn't know it", () => {
    const protein = item({ ...base, dietaryProteinG: undefined }, "protein");
    expect(protein.status).toBe("recommended");
    expect(protein.reasons.join(" ")).toMatch(/assumed/);
  });

  it("does not recommend creatine to someone who doesn't train", () => {
    expect(item({ ...base, trainingDaysPerWeek: 0 }, "creatine").status).toBe("not_recommended");
  });
});

describe("safety rules", () => {
  it("blocks everything under 18", () => {
    const result = recommend({ ...base, age: 16 }, kb);
    expect(result.generalBlocks.map((b) => b.ruleId)).toContain("global-under-18");
    expect(result.items.every((i) => i.status === "blocked")).toBe(true);
    expect(result.items.every((i) => i.products.length === 0)).toBe(true);
  });

  it("blocks everything during pregnancy or breastfeeding", () => {
    for (const c of ["pregnant", "breastfeeding"] as const) {
      const result = recommend({ ...base, sex: "female", conditions: [c] }, kb);
      expect(result.items.every((i) => i.status === "blocked")).toBe(true);
    }
  });

  it("blocks creatine and protein with kidney disease", () => {
    const input = { ...base, conditions: ["kidney_disease" as const] };
    expect(item(input, "creatine").status).toBe("blocked");
    expect(item(input, "protein").status).toBe("blocked");
  });

  it("blocks creatine and protein when eGFR < 60 even if no condition is reported", () => {
    const input = { ...base, labs: { egfr: 55 } };
    expect(item(input, "creatine").blocks.map((b) => b.ruleId)).toContain("creatine-block-ckd");
    expect(item(input, "protein").status).toBe("blocked");
  });

  it("does not block at normal eGFR", () => {
    expect(item({ ...base, labs: { egfr: 95 } }, "creatine").status).toBe("recommended");
  });

  it("cautions about creatine with kidney-affecting medication", () => {
    const creatine = item({ ...base, medications: ["diuretic"] }, "creatine");
    expect(creatine.status).toBe("recommended");
    expect(creatine.cautions.map((c) => c.ruleId)).toContain("creatine-caution-kidney-meds");
  });

  it("asks for a kidney test before creatine for 50+ without labs, but not once eGFR is known", () => {
    const older = { ...base, age: 55 };
    expect(item(older, "creatine").cautions.map((c) => c.ruleId)).toContain("creatine-caution-no-kidney-labs");
    expect(item({ ...older, labs: { egfr: 85 } }, "creatine").cautions).toHaveLength(0);
  });

  it("raises a general caution for very high ALT", () => {
    const result = recommend({ ...base, labs: { altUL: 200 } }, kb);
    expect(result.generalCautions.map((c) => c.ruleId)).toContain("global-high-alt");
  });

  it("always includes the medical disclaimer", () => {
    expect(recommend(base, kb).disclaimer).toMatch(/not medical advice/);
  });
});

describe("product filtering and ranking", () => {
  it("only shows vegan products to vegans", () => {
    const protein = item({ ...base, diet: "vegan" }, "protein");
    expect(protein.products.length).toBeGreaterThan(0);
    expect(protein.products.every((p) => p.product.vegan)).toBe(true);
  });

  it("excludes high-lactose forms for lactose intolerance but keeps isolates", () => {
    const forms = item({ ...base, lactoseIntolerant: true }, "protein").products.map((p) => p.product.form);
    expect(forms).not.toContain("whey_concentrate");
    expect(forms).toContain("whey_isolate");
    const isolate = item({ ...base, lactoseIntolerant: true }, "protein").products.find((p) => p.product.form === "whey_isolate");
    expect(isolate?.reasons.join(" ")).toMatch(/lactose/);
  });

  it("excludes products with the user's allergens", () => {
    const protein = item({ ...base, allergies: ["dairy"] }, "protein");
    expect(protein.products.every((p) => !p.product.allergens.includes("dairy"))).toBe(true);
  });

  it("only shows halal-certified products when halal is required", () => {
    const creatine = item({ ...base, halalRequired: true }, "creatine");
    expect(creatine.products.every((p) => p.product.halalCertified)).toBe(true);
    expect(creatine.products.map((p) => p.product.id)).not.toContain("sample-creatine-hcl");
  });

  it("only shows products sold in the user's country, priced in local currency", () => {
    const protein = item({ ...base, country: "VN" }, "protein");
    expect(protein.products).toHaveLength(0);
    expect(protein.productsNote).toMatch(/not sold in your country/);
    const creatine = item({ ...base, country: "VN" }, "creatine");
    expect(creatine.products[0]?.price.currency).toBe("VND");
  });

  it("ranks tested creatine monohydrate above an untested, less-researched form", () => {
    const ids = item(base, "creatine").products.map((p) => p.product.id);
    expect(ids[0]).toBe("sample-creatine-mono");
  });

  it("flags products over budget", () => {
    const protein = item({ ...base, monthlyBudget: 50 }, "protein");
    expect(protein.products.every((p) => p.withinBudget === false)).toBe(true);
  });

  it("penalises sugary products for people managing blood sugar", () => {
    const protein = item({ ...base, conditions: ["diabetes"] }, "protein");
    const sugary = protein.products.find((p) => p.product.sugarPerServingG > 2);
    expect(sugary?.reasons.join(" ")).toMatch(/not ideal for blood-sugar/);
  });
});

describe("servings per day", () => {
  it("converts the dose into servings of each product", () => {
    // Dose 30–60 g protein; isolate has 27 g protein per scoop → 1–2 scoops.
    const isolate = item(base, "protein").products.find((p) => p.product.id === "sample-whey-isolate");
    expect(isolate?.servingsPerDose).toEqual({ min: 1, max: 2 });
    // Creatine 3–5 g; one 5 g scoop already covers the dose → 1 scoop.
    const creatine = item(base, "creatine").products[0];
    expect(creatine?.servingsPerDose).toEqual({ min: 1, max: 1 });
  });
});
