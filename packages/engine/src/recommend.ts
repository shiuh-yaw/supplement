import { evaluateCondition } from "./conditions";
import { computeDose } from "./dosing";
import { filterProducts, rankProducts } from "./ranking";
import type {
  KnowledgeBase,
  Notice,
  RecommendationResult,
  Rule,
  SupplementRecommendation,
  UserProfile,
  UserProfileInput,
} from "./types";
import { userProfileSchema } from "./types";

export const DISCLAIMER =
  "This is general education, not medical advice. It doesn't diagnose or treat any condition. " +
  "Talk to your doctor, dietitian or pharmacist before starting a supplement — especially if you have a " +
  "medical condition, take medication, or are pregnant or breastfeeding.";

const toNotice = (rule: Rule): Notice => ({ ruleId: rule.id, message: rule.message });

export function recommend(input: UserProfileInput, kb: KnowledgeBase): RecommendationResult {
  const profile: UserProfile = userProfileSchema.parse(input);

  const fired = kb.rules.filter((rule) => evaluateCondition(profile, rule.condition));
  const globalRules = fired.filter((r) => r.supplementSlug === null);
  const generalBlocks = globalRules.filter((r) => r.effect === "block").map(toNotice);
  const generalCautions = globalRules.filter((r) => r.effect === "caution").map(toNotice);

  const items: SupplementRecommendation[] = kb.supplements.map((supplement) => {
    const own = fired.filter((r) => r.supplementSlug === supplement.slug);
    const blocks = own.filter((r) => r.effect === "block").map(toNotice);
    const cautions = own.filter((r) => r.effect === "caution").map(toNotice);
    const recommendRules = own
      .filter((r) => r.effect === "recommend")
      .sort((a, b) => b.priority - a.priority);

    const base: SupplementRecommendation = {
      supplement: {
        slug: supplement.slug,
        name: supplement.name,
        summary: supplement.summary,
        evidenceGrade: supplement.evidenceGrade,
        timing: supplement.timing,
        notes: supplement.notes,
        references: supplement.references,
      },
      status: "not_recommended",
      dose: null,
      reasons: [],
      cautions,
      blocks,
      products: [],
      productsNote: null,
    };

    // Safety first: any block (global or specific) wins over every recommendation.
    if (generalBlocks.length > 0 || blocks.length > 0) {
      return { ...base, status: "blocked" };
    }

    if (recommendRules.length === 0) {
      return { ...base, reasons: ["Not indicated for your goal and profile."] };
    }

    const reasons = recommendRules.map((r) => r.message);
    const outcome = computeDose(supplement.dosing, profile);
    if (outcome.kind === "not_needed") {
      return { ...base, status: "not_needed", reasons: [...reasons, ...outcome.reasons] };
    }

    const candidates = kb.products.filter((p) => p.supplementSlug === supplement.slug);
    const products = rankProducts(candidates, profile, outcome.dose);
    let productsNote: string | null = null;
    if (products.length === 0) {
      const { excluded } = filterProducts(candidates, profile);
      const why = [...new Set(excluded.map((e) => e.reason.toLowerCase()))];
      productsNote =
        candidates.length === 0
          ? "No products in our catalog yet."
          : `No catalog products match your needs (${why.join("; ")}).`;
    }

    return {
      ...base,
      status: "recommended",
      dose: outcome.dose,
      reasons: [...reasons, ...outcome.reasons],
      products,
      productsNote,
    };
  });

  return { profile, generalBlocks, generalCautions, items, disclaimer: DISCLAIMER };
}
