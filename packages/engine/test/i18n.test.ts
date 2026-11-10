import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  DEFAULT_SUPPLEMENTS,
  ENGINE_MESSAGES,
  LABELS,
  RULE_TRANSLATIONS,
  SAMPLE_PRODUCTS,
  SUPPLEMENT_TRANSLATIONS,
  TRANSLATED_LOCALES,
  recommend,
  type KnowledgeBase,
} from "../src";

const kb: KnowledgeBase = { supplements: DEFAULT_SUPPLEMENTS, rules: DEFAULT_RULES, products: SAMPLE_PRODUCTS };

describe("translations are complete", () => {
  it("covers every starter rule in every language", () => {
    for (const r of DEFAULT_RULES) {
      for (const loc of TRANSLATED_LOCALES) expect(RULE_TRANSLATIONS[r.id]?.[loc], `${r.id}/${loc}`).toBeTruthy();
    }
  });

  it("covers every starter supplement, with the same number of notes", () => {
    for (const s of DEFAULT_SUPPLEMENTS) {
      for (const loc of TRANSLATED_LOCALES) {
        const t = SUPPLEMENT_TRANSLATIONS[s.slug]?.[loc];
        expect(t, `${s.slug}/${loc}`).toBeTruthy();
        expect(t!.notes.length, `${s.slug}/${loc} notes`).toBe(s.notes.length);
      }
    }
  });

  it("has every label and engine message in each language", () => {
    for (const loc of TRANSLATED_LOCALES) {
      for (const group of Object.keys(LABELS.en) as (keyof typeof LABELS.en)[]) {
        expect(Object.keys(LABELS[loc][group]).sort(), `${loc}.${group}`).toEqual(Object.keys(LABELS.en[group]).sort());
      }
      expect(Object.keys(ENGINE_MESSAGES[loc]).sort()).toEqual(Object.keys(ENGINE_MESSAGES.en).sort());
    }
  });
});

describe("engine output follows the locale", () => {
  const vegan = { age: 30, sex: "female" as const, weightKg: 55, country: "MY" as const, goal: "strength" as const,
    trainingDaysPerWeek: 4, diet: "vegan" as const, labs: { vitaminDNmolL: 40, ferritinUgL: 15 } };

  it("writes doses, reasons and the disclaimer in Malay", () => {
    const r = recommend(vegan, kb, { locale: "ms" });
    const d = r.items.find((i) => i.supplement.slug === "vitamin_d")!;
    expect(d.dose?.text).toBe("1,000 IU/hari");
    expect(r.items.find((i) => i.supplement.slug === "iron")!.dose?.text).toBe("60–65 mg zat besi selang sehari");
    expect(r.disclaimer).toMatch(/bukan nasihat perubatan/);
    expect(r.items.find((i) => i.supplement.slug === "protein")!.reasons.join(" ")).toMatch(/Sasaran protein harian/);
  });

  it("uses dot thousands and Indonesian wording", () => {
    const r = recommend(vegan, kb, { locale: "id" });
    expect(r.items.find((i) => i.supplement.slug === "vitamin_d")!.dose?.text).toBe("1.000 IU/hari");
    expect(r.items.find((i) => i.supplement.slug === "iron")!.dose?.text).toBe("60–65 mg zat besi dua hari sekali");
    expect(r.disclaimer).toMatch(/bukan saran medis/);
  });

  it("writes Thai and Vietnamese, with dot thousands in Vietnamese", () => {
    const th = recommend(vegan, kb, { locale: "th" });
    expect(th.items.find((i) => i.supplement.slug === "vitamin_d")!.dose?.text).toMatch(/^1,000 IU/);
    expect(th.disclaimer).toMatch(/[\u0E00-\u0E7F]/);
    const vi = recommend(vegan, kb, { locale: "vi" });
    expect(vi.items.find((i) => i.supplement.slug === "vitamin_d")!.dose?.text).toMatch(/^1\.000 IU/);
    expect(vi.disclaimer).toMatch(/bác sĩ|y tế/);
  });

  it("keeps English by default", () => {
    expect(recommend(vegan, kb).disclaimer).toMatch(/not medical advice/);
  });
});

describe("product notes keep Indonesian capitalisation", () => {
  it("lowercases only the first letter of the reason", () => {
    const r = recommend({ age: 30, sex: "male", weightKg: 70, country: "VN", goal: "strength", trainingDaysPerWeek: 4, diet: "omnivore" }, kb, { locale: "id" });
    const protein = r.items.find((i) => i.supplement.slug === "protein")!;
    expect(protein.productsNote).toContain("tidak dijual di negara Anda");
  });
});
