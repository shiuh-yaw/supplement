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

export const REAL_CATALOG: CatalogProduct[] = [
  {
    "supplementSlug": "protein",
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Whey, Double Rich Chocolate, 5 lb",
    "form": "whey_concentrate",
    "servingSizeG": 31,
    "activePerServingG": 24,
    "sugarPerServingG": 1,
    "servingsPerContainer": 74,
    "allergens": [
      "dairy",
      "soy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 293.1,
        "url": "https://www.doctoroncall.com.my/medicine/en/health-food-drinks/optimum-nutrition-gold-standard-100-whey-double-rich-chocolate-powder-5lbs"
      }
    ],
    "sources": [
      "https://www.doctoroncall.com.my/medicine/en/health-food-drinks/optimum-nutrition-gold-standard-100-whey-double-rich-chocolate-powder-5lbs",
      "https://uk.iherb.com/pr/OPN-02866",
      "https://support.optimumnutrition.com/en/support/solutions/folders/80000564395"
    ],
    "notes": "Blend of isolate, concentrate and peptides. Nutrition from the US 5 lb label; the MY pack may differ slightly. Price seen at DoctorOnCall (was out of stock); add a Shopee/Lazada official-store link. ON's support site says this product is NOT halal certified."
  },
  {
    "supplementSlug": "protein",
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Plant Protein, Rich Chocolate Fudge, 480 g",
    "form": "plant_blend",
    "servingSizeG": 40,
    "activePerServingG": 24,
    "sugarPerServingG": 0,
    "servingsPerContainer": 12,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 145.3,
        "url": "https://www.watsons.com.my/optimum-nutrition-gold-standard-plant-protein-rich-chocolate-fudge-480g/p/BP_1028819"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/optimum-nutrition-gold-standard-plant-protein-rich-chocolate-fudge-480g/p/BP_1028819",
      "https://optimumnutrition.com/en-us/p/C100027"
    ],
    "notes": "Pea, rice and fava bean protein. Price is the Watsons member price. Serving and sugar from ON's US/AU listings, not the MY label. Allergen statement not checked on the MY label."
  },
  {
    "supplementSlug": "creatine",
    "brand": "Myprotein",
    "name": "Impact Creatine Monohydrate, Unflavoured, 250 g",
    "form": "creatine_monohydrate",
    "servingSizeG": 3,
    "activePerServingG": 3,
    "sugarPerServingG": 0,
    "servingsPerContainer": 83,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 99.0,
        "url": "https://www.watsons.com.my/myprotein-impact-creatine-monohydrate-unflavoured-250g/p/BP_1015973"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/myprotein-impact-creatine-monohydrate-unflavoured-250g/p/BP_1015973",
      "https://myprotein.ie/p/sports-nutrition/creatine-monohydrate-powder/10530050"
    ],
    "notes": "Serving size from Myprotein IE/AE pages. Single ingredient, likely vegan-suitable but not confirmed for this SKU (vegan left false). Not Informed Sport certified."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Blackmores",
    "name": "Vitamin D3 1000 IU, 60 softgel capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": true,
    "halalBody": "JAKIM",
    "certifications": [],
    "registrationNo": "MAL12085091XC",
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 48.9,
        "url": "https://www.farmasics.com.my/product/blackmores-vitamin-d3-1000iu-60-capsules-bone-muscle-immune-health"
      }
    ],
    "sources": [
      "https://www.blackmores.com/en-my/products/vitamin-d3-1000-iu",
      "https://www.watsons.com.my/blackmores-vitamin-d3-1000-iu-60-s/p/BP_85945",
      "https://thehighlightermy.com/blackmores-malaysia-earns-jakim-halal-certification/"
    ],
    "notes": "25 µg (1000 IU) per softgel; bovine gelatin shell. Halal shown on the Blackmores MY page (JAKIM, announced Dec 2025) — confirm in the JAKIM directory. Watsons RM81.00 regular."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Vitalita",
    "name": "Vitamin D3 1000IU Vegetable Capsule, 60s",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "MAL23016045N",
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 33.9,
        "url": "https://estore.caring2u.com/products/vitalita-vitamin-d3-1000iu-veg-cap-60s"
      }
    ],
    "sources": [
      "https://www.vitalita.com.my/product-page/vitalita-vitamin-d3-1000iu-vegetable-capsule",
      "https://estore.caring2u.com/products/vitalita-vitamin-d3-1000iu-veg-cap-60s"
    ],
    "notes": "Algae-derived D3 in a vegetable capsule; vegan inferred (brand doesn't say 'vegan'). Halal not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Blackmores",
    "name": "Omega-3 Fish Oil 1000mg Odourless, 30 softgel capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 30,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": true,
    "halalBody": "JAKIM",
    "certifications": [],
    "registrationNo": "MAL19990319XC",
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 32.9,
        "url": "https://htmpharmacy.my/products/blackmores-fish-oil-1000mg-30s"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/blackmores-omega-3-fish-oil-1000mg-odourless-30s/p/BP_22207",
      "https://htmpharmacy.my/products/blackmores-fish-oil-1000mg-30s",
      "https://aapharmacy.com.my/products/120s-blackmores-omega-3-fish-oil-capsules-1000mg-120s-halal"
    ],
    "notes": "EPA 180 mg + DHA 120 mg per capsule; bovine gelatin. Halal applies to the Malaysian packs (some imported packs are not halal). MAL number from the 120s pack. Watsons regular price RM48.00."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "Nature's Bounty",
    "name": "Vitamin B-12 500mcg, 100 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 500,
    "sugarPerServingG": 0,
    "servingsPerContainer": 100,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 35.75,
        "url": "https://www.watsons.com.my/nature-s-bounty-vitamin-b-12-500mcg-100-s/p/BP_38851"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/nature-s-bounty-vitamin-b-12-500mcg-100-s/p/BP_38851",
      "https://www.kcgroup.com.my/showproducts/productid/3805223/cid/350869/nature039s-bounty-vitamin-b12-500-mcg-100s/"
    ],
    "notes": "High strength (lower-dose B12 isn't sold as a standalone product in MY). Form assumed cyanocobalamin from the US line — check the MY label. Vegan/halal not verified."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "LAC",
    "name": "Vitamin B-12 600mcg (film coated), 120 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 600,
    "sugarPerServingG": 0,
    "servingsPerContainer": 120,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 95.9,
        "url": "https://www.watsons.com.my/vitamin-b-12-600mcg-120s/p/BP_1014868"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/vitamin-b-12-600mcg-120s/p/BP_1014868",
      "https://www.lacworldwide.com.my/en/vitamins-and-supplements_letter-vitamins_vitamin-b/vitamins-and-supplements-vitamin-b-lac-vitamin-b-12-600mcg-01406840.html/"
    ],
    "notes": "High strength. No listed allergens in the excipients. Vegan/halal not verified. LAC member price lower."
  },
  {
    "supplementSlug": "iron",
    "brand": "Mega We Care",
    "name": "Mega Ferrovit Capsules 50's",
    "form": "ferrous_fumarate",
    "servingSizeG": 0,
    "activePerServingG": 53.25,
    "sugarPerServingG": 0,
    "servingsPerContainer": 50,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "MAL19913041X",
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 28.0,
        "url": "https://www.watsons.com.my/mega-ferrovit-50-s/p/BP_46937"
      }
    ],
    "sources": [
      "https://www.watsons.com.my/mega-ferrovit-50-s/p/BP_46937",
      "https://shop.biolife.megawecare.com/products/ferrovit-5-x-10-tablets",
      "https://lk.megawecare.com/general-well-being/ferrovit"
    ],
    "notes": "Ferrous fumarate 162 mg = 53.25 mg elemental iron, PLUS folic acid 0.75 mg and B12 7.5 µg per capsule. Retailers say halal but name no body (left false). Some pharmacies list the 50s as prescription — check. Sugar not stated."
  },
  {
    "supplementSlug": "electrolytes",
    "brand": "Science in Sport (SiS)",
    "name": "GO Hydro Tablets, Pineapple & Mango, 20 tablets",
    "form": "electrolyte_tablet",
    "servingSizeG": 0,
    "activePerServingG": 345,
    "sugarPerServingG": 0.5,
    "servingsPerContainer": 20,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [
      "Informed Sport"
    ],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 42.0,
        "url": "https://www.rodalink.com/my/sis-hydro-tablets-go-pineapple-mango-736709.html"
      }
    ],
    "sources": [
      "https://www.rodalink.com/my/sis-hydro-tablets-go-pineapple-mango-736709.html",
      "https://www.scienceinsport.com/eu/go-hydro-tablets-sis",
      "https://thefeed.com/products/science-in-sport-go-hydro-tablets"
    ],
    "notes": "~345 mg sodium per tablet in 500 ml; sweetened with sucralose (sugar ≤0.5 g). Informed Sport per SiS's statement that all SiS products are certified (batch-based). Sold at Rodalink MY (cycling shops)."
  },
  {
    "supplementSlug": "electrolytes",
    "brand": "Aspen Nutrition",
    "name": "JusteLyte Isotonic Electrolyte Drink, Lemon Lime, 56 g x 6 sachets",
    "form": "electrolyte_powder",
    "servingSizeG": 56,
    "activePerServingG": 625,
    "sugarPerServingG": 15.6,
    "servingsPerContainer": 6,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "MY",
        "currency": "MYR",
        "price": 27.72,
        "url": "https://www.watsons.com.my/aspen-nutrition-isotonic-electrolyte-drink-lemon-lime-flavour-56gx6s/p/BP_1003141"
      }
    ],
    "sources": [
      "https://www.aspensarl.com/product/sports-nutrition/justelyte/",
      "https://www.watsons.com.my/aspen-nutrition-isotonic-electrolyte-drink-lemon-lime-flavour-56gx6s/p/BP_1003141"
    ],
    "notes": "Carbohydrate-electrolyte drink formulated with Institut Sukan Negara for activity over 60 min. Per sachet ~625 mg sodium, 49 g carbohydrate. Halal/vegan not stated."
  },
];
