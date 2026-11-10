/**
 * Real products, researched and verified on the date in `checkedOn`.
 * Every fact has a source; fields that couldn't be verified are left out
 * (e.g. halalCertified is only true where a named certifier was found).
 *
 * The seed adds these if missing (matched on brand + name) and then removes the
 * SAMPLE products for any supplement that has at least one real product.
 * Prices change — keep them up to date in the backoffice.
 */
import type { Allergen, Country } from "@supplement/engine";

export interface CatalogProduct {
  supplementSlug: string;
  brand: string;
  name: string;
  form: string;
  servingSizeG: number;
  /** In the supplement's dose unit (g protein, g creatine, IU, mg EPA+DHA, µg, mg iron, mg sodium). */
  activePerServingG: number;
  sugarPerServingG: number;
  servingsPerContainer: number;
  allergens: Allergen[];
  vegan: boolean;
  halalCertified: boolean;
  halalBody: string | null;
  certifications: string[];
  registrationNo: string | null;
  prices: { country: Country; currency: string; price: number; url: string | null }[];
  sources: string[];
  notes: string | null;
}

export const CATALOG_CHECKED_ON = "2026-11-10";

export const REAL_CATALOG: CatalogProduct[] = [];
