import { evaluateCondition } from "./conditions";
import { computeDose } from "./dosing";
import { filterProducts, rankProducts } from "./ranking";
import { msgs, type Locale } from "./i18n";
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

export const DISCLAIMER = msgs("en").disclaimer;

export interface RecommendOptions {
  /** Language for the text the engine writes. KB content must already be in this language. */
  locale?: Locale;
}

const toNotice = (rule: Rule): Notice => ({ ruleId: rule.id, message: rule.message });

export function recommend(input: UserProfileInput, kb: KnowledgeBase, options: RecommendOptions = {}): RecommendationResult {
  const locale = options.locale ?? "en";
  const m = msgs(locale);
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

    const alreadyTaking = (profile.currentSupplements as string[]).includes(supplement.slug);
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
      alreadyTaking,
    };

    // Safety first: any block (global or specific) wins over every recommendation.
    if (generalBlocks.length > 0 || blocks.length > 0) {
      return {
        ...base,
        status: "blocked",
        reasons: alreadyTaking ? [m.alreadyBlocked] : [],
      };
    }

    if (recommendRules.length === 0) {
      return {
        ...base,
        reasons: [
          alreadyTaking ? m.alreadyNotNeeded : m.notIndicated,
        ],
      };
    }

    const reasons = recommendRules.map((r) => r.message);
    if (alreadyTaking) reasons.unshift(m.alreadyTaking);
    const outcome = computeDose(supplement.dosing, profile, locale);
    if (outcome.kind === "not_needed") {
      return { ...base, status: "not_needed", reasons: [...reasons, ...outcome.reasons] };
    }

    const candidates = kb.products.filter((p) => p.supplementSlug === supplement.slug);
    const products = rankProducts(candidates, profile, outcome.dose, locale);
    let productsNote: string | null = null;
    if (products.length === 0) {
      const { excluded } = filterProducts(candidates, profile, locale);
      // Lowercase only the first letter: Indonesian capitalises "Anda" mid-sentence.
      const why = [...new Set(excluded.map((e) => e.reason.charAt(0).toLowerCase() + e.reason.slice(1)))];
      productsNote = candidates.length === 0 ? m.noProducts : m.noMatch(why.join("; "));
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

  return { profile, generalBlocks, generalCautions, items, disclaimer: m.disclaimer };
}
