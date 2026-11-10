import { groupDigits } from "./dosing";
import { msgs, unitLabel, type EngineMessages, type Locale } from "./i18n";
import type { Dose, Product, RankedProduct, UserProfile } from "./types";

/** Forms that still contain meaningful lactose. Isolates are usually <1 g/serving. */
const HIGH_LACTOSE_FORMS = new Set(["whey_concentrate", "casein", "milk_protein"]);

export interface FilterResult {
  eligible: Product[];
  excluded: { product: Product; reason: string }[];
}

export function filterProducts(products: Product[], profile: UserProfile, locale: Locale = "en"): FilterResult {
  const m = msgs(locale);
  const eligible: Product[] = [];
  const excluded: FilterResult["excluded"] = [];

  for (const product of products) {
    const reason = exclusionReason(product, profile, m);
    if (reason) excluded.push({ product, reason });
    else eligible.push(product);
  }
  return { eligible, excluded };
}

function exclusionReason(product: Product, profile: UserProfile, m: EngineMessages): string | null {
  if (!product.prices.some((p) => p.country === profile.country)) return m.notSold;
  const allergen = product.allergens.find((a) => profile.allergies.includes(a));
  if (allergen) return m.contains(m.allergens[allergen] ?? allergen);
  if (profile.diet === "vegan" && !product.vegan) return m.notVegan;
  if (profile.lactoseIntolerant && HIGH_LACTOSE_FORMS.has(product.form)) return m.lactose;
  if (profile.halalRequired && !product.halalCertified) return m.notHalal;
  return null;
}

const WEIGHTS = { testing: 35, cost: 35, quality: 15, fit: 15 } as const;

export function rankProducts(products: Product[], profile: UserProfile, dose: Dose, locale: Locale = "en"): RankedProduct[] {
  const m = msgs(locale);
  const eligible = filterProducts(products, profile, locale).eligible.filter((p) => !tooStrong(dose, p));
  if (eligible.length === 0) return [];

  // Use the middle of the dose range for cost estimates, averaged per day.
  const dosesPerDay =
    dose.schedule === "every_other_day"
      ? 0.5
      : dose.schedule === "per_exercise_hour"
        ? profile.trainingDaysPerWeek / 7 // assume about one long session per training day
        : 1;
  const dailyActive = ((dose.min + dose.max) / 2) * dosesPerDay;

  const priced = eligible.map((product) => {
    const price = product.prices.find((p) => p.country === profile.country)!;
    const costPerServing = price.price / product.servingsPerContainer;
    const costPerActiveGram = costPerServing / product.activePerServingG;
    const costPerDay = costPerActiveGram * dailyActive;
    return { product, price, costPerActiveGram, costPerDay };
  });

  const cheapest = Math.min(...priced.map((p) => p.costPerActiveGram));
  const priciest = Math.max(...priced.map((p) => p.costPerActiveGram));

  const ranked = priced.map(({ product, price, costPerActiveGram, costPerDay }) => {
    const reasons: string[] = [];
    let score = 0;

    // 1. Independent testing for contaminants / banned substances.
    if (product.certifications.length > 0) {
      score += WEIGHTS.testing;
      reasons.push(m.tested(product.certifications.join(", ")));
    } else {
      reasons.push(m.noTesting);
    }

    // 2. Value: cost per gram of the active ingredient, relative to alternatives.
    const valueScore =
      priciest === cheapest ? 1 : 1 - (costPerActiveGram - cheapest) / (priciest - cheapest);
    score += WEIGHTS.cost * valueScore;
    if (valueScore >= 0.8) reasons.push(m.bestValue);

    // 3. Formulation quality.
    const qualityScore = qualityOf(product, m);
    score += WEIGHTS.quality * qualityScore.score;
    if (qualityScore.reason) reasons.push(qualityScore.reason);

    // 4. Personal fit: sugar for diabetes, budget.
    const costPerMonth = costPerDay * 30;
    const withinBudget = profile.monthlyBudget === undefined ? null : costPerMonth <= profile.monthlyBudget;
    let fit = 1;
    const managesGlucose =
      profile.conditions.includes("diabetes") || (profile.labs.hba1cPercent ?? 0) >= 5.7;
    if (!managesGlucose && product.sugarPerServingG >= 5) {
      reasons.push(m.sugarEnergy(product.sugarPerServingG));
    }
    if (managesGlucose) {
      if (product.sugarPerServingG <= 2) reasons.push(m.lowSugar);
      else {
        fit -= 0.6;
        reasons.push(m.sugarBad(product.sugarPerServingG));
      }
    }
    if (withinBudget === false) {
      fit -= 0.6;
      reasons.push(m.overBudget);
    }
    score += WEIGHTS.fit * Math.max(fit, 0);

    if (product.halalCertified) reasons.push(m.halal);
    if (exceedsDose(dose, product)) {
      reasons.push(
        m.moreThanSuggested(
          groupDigits(String(product.activePerServingG), locale),
          groupDigits(String(dose.max), locale),
          unitLabel(dose.unit, locale),
        ),
      );
    }
    if (profile.lactoseIntolerant && product.form === "whey_isolate") {
      reasons.push(m.isolateLactose);
    }

    return {
      product,
      price,
      servingsPerDose: servingsFor(dose, product),
      score: Math.round(score),
      costPerDay: round2(costPerDay),
      costPerMonth: round2(costPerMonth),
      withinBudget,
      reasons,
    } satisfies RankedProduct;
  });

  return ranked.sort((a, b) => b.score - a.score || a.costPerDay - b.costPerDay);
}

function qualityOf(product: Product, m: EngineMessages): { score: number; reason?: string } {
  switch (product.supplementSlug) {
    case "creatine":
      return product.form === "creatine_monohydrate"
        ? { score: 1, reason: m.creatineMono }
        : { score: 0.3, reason: m.creatineOther };
    case "vitamin_d":
      return product.form === "vitamin_d3" ? { score: 1, reason: m.vitD3 } : { score: 0.5, reason: m.vitD2 };
    case "omega_3":
      return product.form === "algae_oil" ? { score: 1, reason: m.algaeOil } : { score: 1, reason: m.fishOil };
    case "protein":
      break;
    default:
      return { score: 0.7 };
  }
  if (!(product.servingSizeG > 0)) return { score: 0.6 };
  const ratio = product.activePerServingG / product.servingSizeG;
  const pct = Math.round(ratio * 100);
  if (ratio >= 0.8) return { score: 1, reason: m.proteinPct(pct) };
  if (ratio >= 0.7) return { score: 0.6, reason: m.proteinPct(pct) };
  return { score: 0.2, reason: m.proteinPctLow(pct) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Supplements where a product stronger than the suggested dose is still fine to
 * recommend (no upper limit has been set). For everything else, a product more
 * than twice the suggested dose per serving is left out.
 */
const HIGH_STRENGTH_OK = new Set(["vitamin_b12"]);
const exceedsDose = (dose: Dose, product: Product) => product.activePerServingG > dose.max * 1.05;
export const tooStrong = (dose: Dose, product: Product) =>
  !HIGH_STRENGTH_OK.has(product.supplementSlug) && product.activePerServingG > dose.max * 2;

/** Forms you can measure part of (powders); everything else is taken in whole capsules or tablets. */
const DIVISIBLE_FORMS = new Set([
  "whey_isolate",
  "whey_concentrate",
  "casein",
  "milk_protein",
  "plant_blend",
  "soy",
  "pea",
  "egg_white",
  "creatine_monohydrate",
  "creatine_hcl",
  "creatine_other",
  "electrolyte_powder",
]);

/**
 * Servings per dose: half scoops for powders, whole units for capsules and tablets,
 * and one serving if a single one already covers the dose.
 */
export function servingsFor(dose: Dose, product: Product): { min: number; max: number } {
  if (product.activePerServingG >= dose.max) return { min: 1, max: 1 };
  const round = DIVISIBLE_FORMS.has(product.form)
    ? (n: number) => Math.max(0.5, Math.round(n * 2) / 2)
    : (n: number) => Math.max(1, Math.round(n));
  const min = round(dose.min / product.activePerServingG);
  return { min, max: Math.max(min, round(dose.max / product.activePerServingG)) };
}
