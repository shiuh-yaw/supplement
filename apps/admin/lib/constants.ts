export const PRODUCT_FORMS = [
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
  "vitamin_d3",
  "vitamin_d2",
  "fish_oil",
  "algae_oil",
  "krill_oil",
  "ferrous_sulfate",
  "ferrous_fumarate",
  "iron_bisglycinate",
  "cyanocobalamin",
  "methylcobalamin",
  "electrolyte_tablet",
  "electrolyte_powder",
] as const;

/** The unit a product's "active amount per serving" is measured in = the supplement's dose unit. */
export function doseUnitOf(dosing: unknown): string {
  if (dosing && typeof dosing === "object" && "kind" in dosing) {
    if ((dosing as { kind: string }).kind === "protein_gap") return "g protein";
    const unit = (dosing as { unit?: unknown }).unit;
    if (typeof unit === "string") return unit;
  }
  return "g";
}
