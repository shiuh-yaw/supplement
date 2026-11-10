import type { Dose, Product, RankedProduct, UserProfile } from "./types";

/** Forms that still contain meaningful lactose. Isolates are usually <1 g/serving. */
const HIGH_LACTOSE_FORMS = new Set(["whey_concentrate", "casein", "milk_protein"]);

export interface FilterResult {
  eligible: Product[];
  excluded: { product: Product; reason: string }[];
}

export function filterProducts(products: Product[], profile: UserProfile): FilterResult {
  const eligible: Product[] = [];
  const excluded: FilterResult["excluded"] = [];

  for (const product of products) {
    const reason = exclusionReason(product, profile);
    if (reason) excluded.push({ product, reason });
    else eligible.push(product);
  }
  return { eligible, excluded };
}

function exclusionReason(product: Product, profile: UserProfile): string | null {
  if (!product.prices.some((p) => p.country === profile.country)) return "Not sold in your country";
  const allergen = product.allergens.find((a) => profile.allergies.includes(a));
  if (allergen) return `Contains ${allergen.replace("_", " ")}`;
  if (profile.diet === "vegan" && !product.vegan) return "Not confirmed vegan";
  if (profile.lactoseIntolerant && HIGH_LACTOSE_FORMS.has(product.form)) return "Contains lactose";
  if (profile.halalRequired && !product.halalCertified) return "Not confirmed halal";
  return null;
}

const WEIGHTS = { testing: 35, cost: 35, quality: 15, fit: 15 } as const;

export function rankProducts(products: Product[], profile: UserProfile, dose: Dose): RankedProduct[] {
  const eligible = filterProducts(products, profile).eligible.filter((p) => !tooStrong(dose, p));
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
      reasons.push(`Third-party tested (${product.certifications.join(", ")})`);
    } else {
      reasons.push("No third-party testing certification on record");
    }

    // 2. Value: cost per gram of the active ingredient, relative to alternatives.
    const valueScore =
      priciest === cheapest ? 1 : 1 - (costPerActiveGram - cheapest) / (priciest - cheapest);
    score += WEIGHTS.cost * valueScore;
    if (valueScore >= 0.8) reasons.push("Among the best value per gram");

    // 3. Formulation quality.
    const qualityScore = qualityOf(product);
    score += WEIGHTS.quality * qualityScore.score;
    if (qualityScore.reason) reasons.push(qualityScore.reason);

    // 4. Personal fit: sugar for diabetes, budget.
    const costPerMonth = costPerDay * 30;
    const withinBudget = profile.monthlyBudget === undefined ? null : costPerMonth <= profile.monthlyBudget;
    let fit = 1;
    const managesGlucose =
      profile.conditions.includes("diabetes") || (profile.labs.hba1cPercent ?? 0) >= 5.7;
    if (!managesGlucose && product.sugarPerServingG >= 5) {
      reasons.push(`${product.sugarPerServingG} g sugar per serving — useful energy for long sessions, but it adds up`);
    }
    if (managesGlucose) {
      if (product.sugarPerServingG <= 2) reasons.push("Low sugar — suits blood-sugar management");
      else {
        fit -= 0.6;
        reasons.push(`${product.sugarPerServingG} g sugar per serving — not ideal for blood-sugar control`);
      }
    }
    if (withinBudget === false) {
      fit -= 0.6;
      reasons.push("Above your monthly budget");
    }
    score += WEIGHTS.fit * Math.max(fit, 0);

    if (product.halalCertified) reasons.push("Halal certified");
    if (exceedsDose(dose, product)) {
      reasons.push(
        `One serving has ${product.activePerServingG.toLocaleString("en")} ${dose.unit} — more than the ${dose.max.toLocaleString("en")} ${dose.unit} suggested`,
      );
    }
    if (profile.lactoseIntolerant && product.form === "whey_isolate") {
      reasons.push("Isolate — usually under 1 g lactose per serving; start with a small dose");
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

function qualityOf(product: Product): { score: number; reason?: string } {
  switch (product.supplementSlug) {
    case "creatine":
      return product.form === "creatine_monohydrate"
        ? { score: 1, reason: "Creatine monohydrate — the most researched form" }
        : { score: 0.3, reason: "Less-researched creatine form; no proven advantage over monohydrate" };
    case "vitamin_d":
      return product.form === "vitamin_d3"
        ? { score: 1, reason: "Vitamin D3 — raises blood levels better than D2" }
        : { score: 0.5, reason: "Vitamin D2 — works, but D3 raises levels more" };
    case "omega_3":
      return product.form === "algae_oil"
        ? { score: 1, reason: "Algae oil — plant-based EPA/DHA" }
        : { score: 1, reason: "Fish oil with EPA + DHA" };
    case "protein":
      break;
    default:
      return { score: 0.7 };
  }
  if (!(product.servingSizeG > 0)) return { score: 0.6 };
  const ratio = product.activePerServingG / product.servingSizeG;
  if (ratio >= 0.8) return { score: 1, reason: `${Math.round(ratio * 100)}% protein by weight` };
  if (ratio >= 0.7) return { score: 0.6, reason: `${Math.round(ratio * 100)}% protein by weight` };
  return { score: 0.2, reason: `Only ${Math.round(ratio * 100)}% protein by weight (lots of filler)` };
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
