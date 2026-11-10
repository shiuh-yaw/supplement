/**
 * Products for Singapore, Indonesia, Thailand, the Philippines and Vietnam, researched on
 * SEA_CATALOG_CHECKED_ON from search-result snapshots of retailer and brand pages. The retailer sites
 * couldn't be opened from the research environment, so NOTHING here has been checked on a live page.
 *
 * The seed therefore adds new products as INACTIVE: someone checks the price, label and registration
 * on the shop page, fixes anything wrong in the backoffice, and then ticks "Active".
 * SEA_EXTRA_PRICES adds other countries' prices to products already in the Malaysian catalog.
 */
import type { CatalogProduct } from "./catalog";

export const SEA_CATALOG_CHECKED_ON = "2026-11-10";

export const SEA_CATALOG: CatalogProduct[] = [
  {
    "supplementSlug": "protein",
    "brand": "GNC",
    "name": "Pro Performance 100% Whey, Chocolate Supreme, 2112 g",
    "form": "whey_concentrate",
    "servingSizeG": 33,
    "activePerServingG": 24,
    "sugarPerServingG": 2,
    "servingsPerContainer": 64,
    "allergens": [
      "dairy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 174.5,
        "url": "https://www.watsons.com.sg/gnc-pro-performance%C2%AE-100-whey-chocolate-supreme-2112g/p/BP_78147"
      }
    ],
    "sources": [
      "https://www.watsons.com.sg/gnc-pro-performance%C2%AE-100-whey-chocolate-supreme-2112g/p/BP_78147",
      "https://www.safeway.com/shop/product-details.960493683.3132.html",
      "https://www.carbmanager.com/food-detail/nb:54748707cabbc1f8661c0678/pro-performance-100-whey-protein-powder-chocolate-supreme"
    ],
    "notes": "Whey concentrate/isolate blend. Watsons SG lists 64 servings; serving size 33 g derived from 2112 g / 64. 24 g protein and 2 g sugar per scoop from US label data (third-party databases), not the SG label. Soy (lecithin) not checked — allergens may be incomplete. One Watsons listing for this SKU carried an 'Expiry: Sep 2026' tag, so stock may be clearance/limited. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "creatine",
    "brand": "GNC",
    "name": "Pro Performance Creatine Monohydrate Powder, Unflavoured, 1 kg",
    "form": "creatine_monohydrate",
    "servingSizeG": 5,
    "activePerServingG": 5,
    "sugarPerServingG": 0,
    "servingsPerContainer": 200,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 87.95,
        "url": "https://www.gnc.com.sg/en/brands/gnc-pro-performance/creatine-monohydrate-powder-00800480.html"
      }
    ],
    "sources": [
      "https://www.gnc.com.sg/en/brands/gnc-pro-performance/creatine-monohydrate-powder-00800480.html",
      "https://www.gnc.com.sg/en/protein-and-fitness_creatine/gnc-pro-performance/creatine-monohydrate-unflavored-00802200.html",
      "https://www.gnc.com/creatine-shopall/gnc-pro-performance-creatine-monohydrate.html"
    ],
    "notes": "GNC Singapore official site: 5 g creatine monohydrate per rounded teaspoon, 200 servings. The 250 g tub (item 00802200) is S$34.95 / 50 servings but showed as out of stock. Single ingredient; vegan not confirmed (left false). Not third-party certified as far as checked. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Blackmores",
    "name": "Sunny D 1000 Gold, 60 capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 23.0,
        "url": "https://www.watsons.com.sg/blackmores-sunny-d-1000-gold-capsules-60s/p/BP_28702"
      }
    ],
    "sources": [
      "https://www.blackmores.com/en-sg/products/sunny-d-1000-gold",
      "https://www.watsons.com.sg/blackmores-sunny-d-1000-gold-capsules-60s/p/BP_28702",
      "https://www.blackmores.com/en-sg/products/halal"
    ],
    "notes": "Colecalciferol 25 µg (1000 IU) per capsule; Blackmores SG RSP S$23.00, same at Watsons SG. Appears in Blackmores SG's 'Halal' range but the certifier wasn't named in what I could see, so halal left false (likely MUIS or JAKIM — verify). Capsule shell/gelatin not checked; vegan false. This is the SG equivalent of the MY 'Vitamin D3 1000 IU' SKU, sold under a different name."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Blackmores",
    "name": "Fish Oil 1000 Odourless, 400 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 400,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 100.5,
        "url": "https://www.watsons.com.sg/blackmores-odourless-fish-oil-1000mg-capsules-400s/p/BP_38715"
      }
    ],
    "sources": [
      "https://www.blackmores.com/en-sg/products/fish-oil-1000-odourless",
      "https://www.watsons.com.sg/blackmores-odourless-fish-oil-1000mg-capsules-400s/p/BP_38715",
      "https://www.guardian.com.sg/blackmores-odourless-fish-oil-400s/p/172523?lang=en",
      "https://www.fairprice.com.sg/product/blackmores-dietary-supplement-fish-oil-1000-odourless-400-per-pack-13068340"
    ],
    "notes": "EPA 180 mg + DHA 120 mg per capsule. Watsons SG S$100.50 (Blackmores SG RSP S$94.80); Guardian frequently discounts to ~S$60.30 and FairPrice showed S$65.33. Halal for SG pack not verified. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Blackmores",
    "name": "Omega Triple Concentrated Fish Oil, 60 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 900,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 69.95,
        "url": "https://www.watsons.com.sg/blackmores-omega-triple-concentrated-fish-oil-capsules-60s/p/BP_55773"
      }
    ],
    "sources": [
      "https://www.blackmores.com/en-sg/products/omega-triple",
      "https://www.watsons.com.sg/blackmores-omega-triple-concentrated-fish-oil-capsules-60s/p/BP_55773",
      "https://www.guardian.com.sg/blackmores-omega-triple-concentrated-fish-oil-60-capsules-172521.html"
    ],
    "notes": "Blackmores SG: EPA 540 mg + DHA 360 mg per capsule (Watsons/Guardian text says 528 + 372; total 900 either way). Above the 250–500 mg/day target per capsule. Watsons S$69.95 (Blackmores RSP S$66.00, Guardian S$70.00; Watsons sometimes ~S$41.97 on sale). Halal not verified. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "iron",
    "brand": "Natures Aid",
    "name": "Iron Bisglycinate 14 mg (with Vitamin C, B12 & Folic Acid), 90 tablets",
    "form": "iron_bisglycinate",
    "servingSizeG": 0,
    "activePerServingG": 14,
    "sugarPerServingG": 0,
    "servingsPerContainer": 90,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 33.0,
        "url": "https://www.guardian.com.sg/natures-aid-iron-bisglycinate-90-tablets/p/601424"
      }
    ],
    "sources": [
      "https://www.guardian.com.sg/natures-aid-iron-bisglycinate-90-tablets/p/601424",
      "https://www.watsons.com.sg/natures-aid-iron-bisglycinate-14mg-elemental-90s/p/BP_87794",
      "https://provita.com.mt/products/natures-aid-iron-bisglycinate-14mg-x-90-tablets",
      "https://naturaldispensary.co.uk/921_iron-bisglycinate-elemental-14mg-90s"
    ],
    "notes": "14 mg elemental iron (bisglycinate) per tablet plus Ester-C (80 mg vitamin C), folic acid and B12 (methylcobalamin) — amounts of folate/B12 not confirmed. Vegan Society approved per brand. Low dose: ~4–5 tablets would be needed for 60–65 mg. Guardian SG S$33.00 (brand page showed an S$26.00 offer). Also at Watsons SG (price not seen). Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "GNC",
    "name": "Vitamin B12 500mcg, 90 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 500,
    "sugarPerServingG": 0,
    "servingsPerContainer": 90,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 18.0,
        "url": "https://www.watsons.com.sg/gnc-vitamin-b12-500mcg-tablet-90s/p/BP_69202"
      }
    ],
    "sources": [
      "https://www.watsons.com.sg/gnc-vitamin-b12-500mcg-tablet-90s/p/BP_69202",
      "https://www.watsons.com.sg/gnc-vitamins/c/gncsupplementvitamins"
    ],
    "notes": "Watsons SG S$18.00. Listing says vegetarian; no wheat, soy, dairy, gluten; contains dextrose (amount not stated). B12 form NOT confirmed on the listing — cyanocobalamin assumed (GNC's other SG B products use it). Vegan not stated (left false). Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "Nature's Plus",
    "name": "Vitamin B-12 500mcg, 90 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 500,
    "sugarPerServingG": 0,
    "servingsPerContainer": 90,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 17.55,
        "url": "https://www.guardian.com.sg/natures-plus-vitamin-b12-500mcg-90s-617562.html"
      }
    ],
    "sources": [
      "https://www.guardian.com.sg/natures-plus-vitamin-b12-500mcg-90s-617562.html",
      "https://www.watsons.com.sg/nature-s-plus-vitamin-b-12-500mg-tablet-gluten-free-high-potency-90s/p/BP_56730",
      "https://naturesplus.com/products/vitamin-b12-500-mcg-tablets"
    ],
    "notes": "Guardian SG S$17.55 (35% off S$27.00 regular; Watsons SG same S$17.55). Watsons ingredients say cyanocobalamin while Guardian text says methylcobalamin — cyanocobalamin used (ingredient list). Gluten free; vegan not confirmed. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "electrolytes",
    "brand": "Science in Sport (SiS)",
    "name": "GO Hydro Tablets, Grapefruit, 20 tablets",
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
        "country": "SG",
        "currency": "SGD",
        "price": 13.9,
        "url": "https://www.decathlon.sg/p/sis-hydro-electrolyte-tablets-grapefruit-4-2g-per-tablet-20-tablets-science-in-sport-8730996.html"
      }
    ],
    "sources": [
      "https://www.decathlon.sg/p/sis-hydro-electrolyte-tablets-grapefruit-4-2g-per-tablet-20-tablets-science-in-sport-8730996.html",
      "https://www.rodalink.com/sg/sis-hydro-tablets-go-pineapple-mango-736709.html",
      "https://www.scienceinsport.com/eu/go-hydro-tablets-sis"
    ],
    "notes": "Same GO Hydro formula as the MY Pineapple & Mango entry: 30 mmol/L sodium in 500 ml ≈ 345 mg per tablet, 4.2 g tablet, sucralose-sweetened (sugar ≤0.5 g taken from the MY entry/SiS data, not re-checked for this flavour). Informed Sport per SiS's all-products statement (batch-based). Decathlon SG S$13.90. Rodalink SG lists the Pineapple & Mango SKU (the existing catalog product) at S$13.00 but out of stock, so no SG price was added to that entry. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "electrolytes",
    "brand": "Nuun",
    "name": "Sport Hydration Tablets, Tri-Berry, 10 tablets",
    "form": "electrolyte_tablet",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 1,
    "servingsPerContainer": 10,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "SG",
        "currency": "SGD",
        "price": 11.9,
        "url": "https://www.decathlon.sg/p/nuun-hydration-electrolytes-tri-berry-5-5g-per-tablet-10-tablets-nuun-8730661.html"
      }
    ],
    "sources": [
      "https://www.decathlon.sg/p/nuun-hydration-electrolytes-tri-berry-5-5g-per-tablet-10-tablets-nuun-8730661.html",
      "https://nuunlife.com/products/nuun-sport"
    ],
    "notes": "300 mg sodium per tablet per Nuun's official page; Decathlon SG names it 'Nuun Hydration' (5.5 g tablet), which matches the Nuun Sport tablet but the sodium was not confirmed on the Decathlon page. Sugar 1 g from Nuun's US label (not re-verified in this pass). Vegan per Nuun. No third-party certification verified. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "creatine",
    "brand": "Optimum Nutrition",
    "name": "Micronized Creatine Powder, Unflavored, 300 g",
    "form": "creatine_monohydrate",
    "servingSizeG": 5,
    "activePerServingG": 5,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "PH",
        "currency": "PHP",
        "price": 1845.0,
        "url": "https://www.lac.com.ph/en/brands_optimum-nutrition/optimum-nutrition/micronized-creatine-powder-unflavored-06100220.html"
      },
      {
        "country": "ID",
        "currency": "IDR",
        "price": 391600,
        "url": "https://www.tokopedia.com/optimumnutrition/etalase/halal-certified"
      },
      {
        "country": "TH",
        "currency": "THB",
        "price": 849.0,
        "url": "https://www.central.co.th/th/optimumnutrition-micronized-creatine-300g-mkp0673253"
      }
    ],
    "sources": [
      "https://www.lac.com.ph/en/brands_optimum-nutrition/optimum-nutrition/micronized-creatine-powder-unflavored-06100220.html",
      "https://www.lac.com.ph/en/protein-and-fitness/protein-and-fitness_creatine.html/",
      "https://www.tokopedia.com/optimumnutrition/etalase/halal-certified",
      "https://www.tokopedia.com/find/creatine-optimum-nutrition",
      "https://www.vitacost.com/optimum-nutrition-micronized-creatine-powder-unflavored",
      "https://www.central.co.th/th/optimumnutrition-micronized-creatine-300g-mkp0673253",
      "https://www.lazada.co.th/products/optimum-nutrition-micronized-creatine-monohydrate-powder-i4882715399.html",
      "https://www.lazada.co.th/products/optimum-nutrition-micronized-creatine-powder-300g-i256938413.html"
    ],
    "notes": "LAC Philippines ₱1,845 for 300 g (600 g ₱3,690 / member ₱2,350). Serving 5 g and 60 servings are from ON's standard label, NOT confirmed on the PH page — check. LAC cached pages may be old. Vegan not stated. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live. | 5 g creatine monohydrate per 5 g serving, 60 servings (US Supplement Facts). Sold by the official 'Optimum Nutrition Indonesia' Tokopedia store as 'Creatine Powder - Recovery and Muscle Growth 300gr' at Rp391,600–392,000 (list Rp730,000), from a search snapshot; exact product URL not captured, so the URL is the store's 'Halal Certified' showcase where it's listed. The store files it as halal but names no certifier, so halal is left false. BPOM number not found. Vegan not confirmed. | Single-ingredient micronized creatine monohydrate. 300 g = 60 servings per the Lazada TH listing (i4882715399, ฿1,210 from ฿1,565), i.e. 5 g per serving. Central Online price ฿849 (from ฿1,275, 33% off) seen in the search index, not a live page view. Thai label (อย. number, allergen statement) not seen; vegan/halal not verified."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Forti-D",
    "name": "Colecalciferol (Vitamin D3) 800 IU softgel capsule, sold per piece",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 800,
    "sugarPerServingG": 0,
    "servingsPerContainer": 1,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "PH",
        "currency": "PHP",
        "price": 8.5,
        "url": "https://www.watsons.com.ph/colecalciferol-800iu-1-softgel-capsule-sold-per-piece/p/BP_10095314"
      }
    ],
    "sources": [
      "https://www.watsons.com.ph/colecalciferol-800iu-1-softgel-capsule-sold-per-piece/p/BP_10095314",
      "https://southstardrug.com.ph/products/forti-d-800-iu-capsule-30s-600-in-house-trade-account"
    ],
    "notes": "Watsons PH ₱8.50 per softgel (sold per piece, so servingsPerContainer = 1). Also sold as 30s at Southstar Drug (price not seen). Gelatin softgel assumed (vegan false). PH FDA registration number not seen. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Forti-D",
    "name": "Colecalciferol (Vitamin D3) 2000 IU softgel capsule, sold per piece",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 2000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 1,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "PH",
        "currency": "PHP",
        "price": 11.5,
        "url": "https://www.watsons.com.ph/forti-d-forti-d-forti-d-2000iu-colecalciferol-vitamin-d3-softgel-capsule-sold-per-piece/p/BP_50050228"
      }
    ],
    "sources": [
      "https://www.watsons.com.ph/forti-d-forti-d-forti-d-2000iu-colecalciferol-vitamin-d3-softgel-capsule-sold-per-piece/p/BP_50050228"
    ],
    "notes": "Watsons PH ₱11.50 per softgel (sold per piece). At the 2000 IU ceiling. PH FDA registration number not seen. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Omegabloc",
    "name": "Fish Oil Concentrate + EPA + DHA softgel, sold per piece",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 1,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "PH",
        "currency": "PHP",
        "price": 13.5,
        "url": "https://www.watsons.com.ph/omegabloc-fish-oil-concentrate-epa-dha-100mg-food-supplements/p/BP_10034052"
      }
    ],
    "sources": [
      "https://www.watsons.com.ph/omegabloc-fish-oil-concentrate-epa-dha-100mg-food-supplements/p/BP_10034052"
    ],
    "notes": "Watsons PH ₱13.50 per softgel; listing ingredients give EPA 180 mg + DHA 120 mg per softgel (the listing title says '100mg', which conflicts — check the label). Sold per piece. PH FDA FR number not seen. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "iron",
    "brand": "UHP",
    "name": "Ferrous Sulfate 325 mg tablet, sold per piece",
    "form": "ferrous_sulfate",
    "servingSizeG": 0,
    "activePerServingG": 65,
    "sugarPerServingG": 0,
    "servingsPerContainer": 1,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "PH",
        "currency": "PHP",
        "price": 2.25,
        "url": "https://www.watsons.com.ph/uhp-ferrous-sulfate-1-tablet-325mg/p/BP_10000322"
      }
    ],
    "sources": [
      "https://www.watsons.com.ph/uhp-ferrous-sulfate-1-tablet-325mg/p/BP_10000322",
      "https://www.rosepharmacy.com/product/uhp-ferrous-sulfate-tablet/",
      "https://southstardrug.com.ph/products/fersulfate-iron-65-mg-tablet-600-in-house-trade-account"
    ],
    "notes": "Ferrous sulfate 325 mg = 65 mg elemental iron (Southstar lists it as 'Fersulfate Iron 65 mg'). Watsons PH ₱2.25 per tablet; Rose Pharmacy ₱3.25. Generic OTC medicine; PH FDA DR number not seen. Matches the 60–65 mg dose exactly. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "Healthy Options",
    "name": "Vitamin B12 500mcg, 100 tablets",
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
        "country": "PH",
        "currency": "PHP",
        "price": 1095.0,
        "url": "https://shop.healthyoptions.com.ph/products/healthy-options-vitamin-b12-500mcg-100-tablets"
      }
    ],
    "sources": [
      "https://shop.healthyoptions.com.ph/products/healthy-options-vitamin-b12-500mcg-100-tablets",
      "https://www.lazada.com.ph/products/healthy-options-b-12-500-mcg-100-tablets-i1799331586.html"
    ],
    "notes": "Healthy Options' own brand on its official PH shop, ₱1,095, in stock. B12 form NOT confirmed — cyanocobalamin assumed. Vegan/allergens not checked. Price read from the retailer page via a search-index snapshot (the retailer site could not be opened directly from this environment); re-check live."
  },
  {
    "supplementSlug": "protein",
    "brand": "L-Men",
    "name": "Platinum Whey, Chocolate, 800 g",
    "form": "whey_concentrate",
    "servingSizeG": 33,
    "activePerServingG": 25,
    "sugarPerServingG": 0,
    "servingsPerContainer": 24,
    "allergens": [
      "dairy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 488700,
        "url": "https://www.tokopedia.com/floweeshop/l-men-platinum-whey-protein"
      }
    ],
    "sources": [
      "https://www.tokopedia.com/floweeshop/l-men-platinum-whey-protein",
      "https://www.halodoc.com/obat-dan-vitamin/l-men-platinum-chocolate-800-g",
      "https://www.tokopedia.com/find/l-men-platinum"
    ],
    "notes": "Local brand (Nutrifood). Listings give 25 g protein/serving and 24 servings per 800 g (one seller says 21); serving size 33 g is derived (800 g / 24), not read from a label. Sugar: listing says 0 g sucrose per serving — total sugars (lactose) not verified. Whey form (concentrate vs isolate blend) not verified. Seller-claimed 'Halal BPOM' with no certificate number, so halal left false; a BPOM number on the listing (862310136187) couldn't be checked. Price is a third-party Tokopedia seller (Floweeshop); Nutrifood's own 'Nutrimart' Tokopedia store listed the Platinum Basic Whey Unflavoured 800 g at ~Rp494,000 (list Rp680,000) but its URL wasn't captured."
  },
  {
    "supplementSlug": "protein",
    "brand": "Evolene",
    "name": "Evowhey Whey Protein, 50 sachets x 35 g (1,750 g)",
    "form": "whey_concentrate",
    "servingSizeG": 35,
    "activePerServingG": 25,
    "sugarPerServingG": 0,
    "servingsPerContainer": 50,
    "allergens": [
      "dairy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 1297000,
        "url": "https://www.tokopedia.com/evoleneofficial"
      }
    ],
    "sources": [
      "https://www.tokopedia.com/find/evolene-evowhey-protein-50-sachet",
      "https://www.tokopedia.com/suplemenvolcano/evolene-whey-protein-1750-gr-gram-1-7-kilo-kg-evo-cutting",
      "https://productlist.id/products/ccafad3819af968d"
    ],
    "notes": "Local brand. Per 35 g sachet: 25 g protein, 4 g carbohydrate, 1 g fat, 125 kcal (from a Tokopedia listing); protein from whey concentrate, whey isolate, skim milk and sodium caseinate (so form recorded as whey_concentrate). Sugar not stated (carbs 4 g) — left 0 but unverified. Price Rp1,297,000 is the Evolene Official Store on Tokopedia from a search snapshot (exact product URL not captured, store URL given); other sellers Rp1.25–1.31 million. BPOM MD numbers seen for Evowhey variants (MD 223176011600279, MD 273176021200068) — per-flavour, so not recorded. Halal not verified for this SKU."
  },
  {
    "supplementSlug": "creatine",
    "brand": "Evolene",
    "name": "Crevolene Creatine Monohydrate, Original, 165 g",
    "form": "creatine_monohydrate",
    "servingSizeG": 5,
    "activePerServingG": 5,
    "sugarPerServingG": 0,
    "servingsPerContainer": 33,
    "allergens": [],
    "vegan": false,
    "halalCertified": true,
    "halalBody": "MUI",
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 115000,
        "url": "https://tokopedia.com/evoleneofficial/new-crevolene-monohydrate-evolene-creatine-monohydrate"
      }
    ],
    "sources": [
      "https://tokopedia.com/evoleneofficial/new-crevolene-monohydrate-evolene-creatine-monohydrate",
      "https://www.stack3d.com/2024/01/evolene-crevolene-standard-creatine.html",
      "https://www.halodoc.com/obat-dan-vitamin/evolene-crevolene-creapure-grape-165-g"
    ],
    "notes": "Local brand; the standard (non-Creapure) Crevolene. The official Evolene store listing says 1 serving = 5 g, 1 serving a day, and that the product is 'tersertifikasi BPOM, Halal MUI' (brand claim; no certificate number seen — confirm on halal.go.id). Rp115,000 is the lowest variant price on that listing (it has 3 sizes/flavours, not identified); Halodoc lists 'Crevolene Original 165 g' at Rp109,400. 165 g / 5 g = 33 servings is derived — check the size you buy. Sugar 0 assumed for the unflavoured Original (not verified). The Creapure version (165 g, BPOM MD 867031081523) is a different SKU (~Rp152,600)."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Wellness",
    "name": "Vitamin D3 1000 IU, 60 softgels",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SI214300701",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 208000,
        "url": "https://www.k24klik.com/p/wellness-vitamin-d3-1000iu-softgel-60s-btl-29052"
      }
    ],
    "sources": [
      "https://www.k24klik.com/p/wellness-vitamin-d3-1000iu-softgel-60s-btl-29052",
      "https://www.halodoc.com/obat-dan-vitamin/wellness-vitamin-d3-1000-iu-60-softgel",
      "https://www.alodokter.com/aloshop/products/wellness-vitamin-d3-1000-iu-60-kapsul/61dffb2fe139ec05b9c8cb45",
      "https://www.watsons.co.id/en/wellness-vitamin-d3-1000iu-softgel-60-s/p/BP_19470"
    ],
    "notes": "Made in the USA (Eckhart Corp), imported by PT Natural Nutrindo. Softgel (gelatin source not stated), so vegan false. K24Klik and Alodokter Rp208,000; Halodoc Rp175,900–195,000. Halal not verified."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Oxyvit",
    "name": "D3 1000 IU, 60 softgels",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SD211363741",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 179500,
        "url": "https://www.watsons.co.id/en/oxyvit-d3-1000iu-60-s/p/BP_44283"
      }
    ],
    "sources": [
      "https://www.watsons.co.id/en/oxyvit-d3-1000iu-60-s/p/BP_44283",
      "https://www.k24klik.com/p/oxyvit-d3-1000iu-softcap-60s-btl-29769"
    ],
    "notes": "Locally registered (SD = made in Indonesia). Watsons ID price Rp179,500 from a search snapshot. D3 form inferred from the product name; softgel, vegan false. Halal not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Nutrimax",
    "name": "Omega 3 Pro, 60 softgels",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 450,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": true,
    "halalBody": "BPJPH",
    "certifications": [],
    "registrationNo": "SD202356301",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 386250,
        "url": "https://watsons.co.id/en/nutrimax-omega-3-pro-60-s/p/BP_17058"
      }
    ],
    "sources": [
      "https://watsons.co.id/en/nutrimax-omega-3-pro-60-s/p/BP_17058",
      "https://www.halodoc.com/obat-dan-vitamin/nutrimax-omega-3-pro-30-kapsul",
      "https://productlist.id/products/nutrimax-omega-3-pro-sd202356301",
      "https://res.cloudinary.com/tiwebpro-com/image/upload/v1650338181/NUTRIMAX/Product%20Knowledge%20PDF/OMEGA_3_PRO.pdf"
    ],
    "notes": "Per softgel: fish oil 1000 mg, EPA 270 mg + DHA 180 mg (Watsons ID composition); MEG-3 (DSM) oil. Watsons ID Rp386,250 (25% off); Prodia shop Rp460,000. BPOM SD202356301 and BPJPH halal certificate ID00410000257541121 are shown on the Halodoc listing for the 30s pack — assumed to cover the 60s; confirm on halal.go.id."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Hemaviton",
    "name": "FitOmega-3, 30 softgels",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 180,
    "sugarPerServingG": 0,
    "servingsPerContainer": 30,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SD253028711",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 64999,
        "url": "https://www.k24klik.com/p/hemaviton-fitomega-3-softcap-30s-btl-47095"
      }
    ],
    "sources": [
      "https://www.k24klik.com/p/hemaviton-fitomega-3-softcap-30s-btl-47095",
      "https://www.watsons.co.id/en/hemaviton-fitomega-3-kapsul-30-s/p/BP_62237",
      "https://www.halodoc.com/obat-dan-vitamin/hemaviton-fitomega-3-30-kapsul",
      "https://productlist.id/products/b389410d5f276d64"
    ],
    "notes": "Budget local brand (PT Tempo Scan Pacific). Watsons lists fish oil 1200 mg, EPA 216 mg + DHA 144 mg per 2 softgels, i.e. 180 mg EPA+DHA per softgel (label dose is 2 softgels a day; Halodoc says 1). K24Klik Rp64,999 (Halodoc Rp60,000–63,000; Watsons promo Rp30,000 at 60% off). Halal not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Wellness",
    "name": "Omega 3 1000 mg, 75 softgels",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 75,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SI074325111",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 300300,
        "url": "https://www.halodoc.com/obat-dan-vitamin/wellness-omega-3-1000-mg-75-kapsul"
      }
    ],
    "sources": [
      "https://www.halodoc.com/obat-dan-vitamin/wellness-omega-3-1000-mg-75-kapsul"
    ],
    "notes": "Per softgel: omega-3 fish oil 1000 mg with EPA 180 mg + DHA 120 mg, vitamin E 5 IU (Halodoc). Imported (SI). Price from Halodoc via a search snapshot. Halal not verified."
  },
  {
    "supplementSlug": "iron",
    "brand": "Kimia Farma",
    "name": "Tablet Tambah Darah (Ferrous Fumarate 60 mg Fe / Folic Acid 0.4 mg), strip of 10",
    "form": "ferrous_fumarate",
    "servingSizeG": 0,
    "activePerServingG": 60,
    "sugarPerServingG": 0,
    "servingsPerContainer": 10,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 6396,
        "url": "https://www.k24klik.com/p/tablet-tambah-darah-neo-kf-tab-100s-24966"
      }
    ],
    "sources": [
      "https://www.k24klik.com/p/tablet-tambah-darah-neo-kf-tab-100s-24966",
      "https://satusehat.kemkes.go.id/kfa-browser/poa-detail/93000935",
      "https://www.alodokter.com/aloshop/products/tablet-tambah-darah-10-tablet-kimia-farma/62a1917bf15ee840f5660406"
    ],
    "notes": "Indonesia's standard 'tablet tambah darah' (TTD): ferrous fumarate equivalent to 60 mg elemental iron plus folic acid 0.4 mg, sugar-coated tablet (sugar per tablet not stated, left 0). Over-the-counter medicine (obat bebas). K24Klik Rp6,396 per strip of 10 (Alodokter Rp14,838). Registration number not captured. Halal not verified."
  },
  {
    "supplementSlug": "iron",
    "brand": "Mega Lifesciences",
    "name": "Tablet Tambah Darah (Ferrous Fumarate 180 mg / Folic Acid 0.4 mg), strip of 10",
    "form": "ferrous_fumarate",
    "servingSizeG": 0,
    "activePerServingG": 59,
    "sugarPerServingG": 0,
    "servingsPerContainer": 10,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "GBL2039204617A1",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 4295,
        "url": "https://www.k24klik.com/p/tablet-tambah-darah-mega-lifesciences-tab-100s-37327"
      }
    ],
    "sources": [
      "https://www.k24klik.com/p/tablet-tambah-darah-mega-lifesciences-tab-100s-37327",
      "https://satusehat.kemkes.go.id/kfa-browser/poa-detail/93014372",
      "https://satusehat.kemkes.go.id/kfa-browser/poak-detail/94008887"
    ],
    "notes": "Ferrous fumarate 180 mg (≈59 mg elemental iron, calculated at 32.9% Fe — not printed on the listing) plus folic acid 0.4 mg; sugar-coated (sugar not stated). Obat bebas; NIE from the Kemenkes KFA browser. K24Klik Rp4,295 per strip of 10. Halal not verified."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "NaturesPlus",
    "name": "Vitamin B-12 500 mcg, 90 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 500,
    "sugarPerServingG": 0,
    "servingsPerContainer": 90,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SI214511881",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 224000,
        "url": "https://www.watsons.co.id/en/natures-plus-vitamin-b12-500mcg-tablet-90-s/p/BP_25371"
      }
    ],
    "sources": [
      "https://www.watsons.co.id/en/natures-plus-vitamin-b12-500mcg-tablet-90-s/p/BP_25371",
      "https://www.halodoc.com/obat-dan-vitamin/nature-s-plus-vitamin-b-12-500-mcg-90-tablet",
      "https://naturesplus.com/products/vitamin-b12-500-mcg-tablets",
      "https://vitanetonline.com/description/NP1710/vitamins/VITAMIN-B-12-500-MCG-90"
    ],
    "notes": "High strength. Watsons ID Rp224,000 (20% off); Halodoc Rp250,000–291,600. B12 form unclear: one US retailer lists cyanocobalamin, another methylcobalamin — check the ID label. NaturesPlus says vegetarian (not vegan). Halal not verified."
  },
  {
    "supplementSlug": "vitamin_b12",
    "brand": "IPI",
    "name": "Vitamin B12 Tablet, 45 tablets",
    "form": "cyanocobalamin",
    "servingSizeG": 0,
    "activePerServingG": 25,
    "sugarPerServingG": 0,
    "servingsPerContainer": 45,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "SD141546081",
    "prices": [
      {
        "country": "ID",
        "currency": "IDR",
        "price": 7000,
        "url": "https://www.watsons.co.id/en/ipi-vitamin-b12-tablet-45-s/p/BP_59609"
      }
    ],
    "sources": [
      "https://www.watsons.co.id/en/ipi-vitamin-b12-tablet-45-s/p/BP_59609",
      "https://www.k24klik.com/p/vitamin-b12-ipi-tab-45s-tube-20008",
      "https://medicastore.com/produk/Suplemen/24362/vitamin-b12-ipi-45-tablet",
      "https://vivaapotek.co.id/kamus-obat-dan-medis/vitamin-b12-ipi/"
    ],
    "notes": "Very cheap local B12 (PT Supra Ferbindo Farma). Strength conflict: Watsons ID (and the KFA name on K24Klik) say 25 mcg per tablet; Medicastore/K24Klik text says 50 mcg — 25 recorded, check the tube. Below the 50–100 µg/day target unless 2–4 tablets are taken. Watsons Rp7,000 (26% off); K24Klik Rp7,568. Halal not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Blackmores",
    "name": "Fish Oil 1000 mg, 80 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 80,
    "allergens": [
      "fish",
      "soy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "TH",
        "currency": "THB",
        "price": 410.0,
        "url": "https://www.watsons.co.th/en/blackmores-blackmores-fish-oil-1000-mg-80-capsule/p/BP_128078"
      }
    ],
    "sources": [
      "https://www.watsons.co.th/en/blackmores-blackmores-fish-oil-1000-mg-80-capsule/p/BP_128078",
      "https://store.boots.co.th/brands/608117dc34d9000e20aef107?page=2",
      "https://www.chemistwarehouse.com.au/buy/42904/blackmores-fish-oil-1000mg-200-capsules"
    ],
    "notes": "EPA 180 mg + DHA 120 mg per capsule per the Australian label (Chemist Warehouse AU); the Thai label wasn't seen. AU label declares fish, soya and sulfites. Watsons TH: ฿410 sale (50% off ฿820 regular); other Watsons pages showed ฿355-399. Boots TH listed ฿399. Prices are from the search index, not a live page view. Thai อย. number and halal status not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Mega We Care",
    "name": "Fish Oil 1000 mg, 30 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 30,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "11-1-32732-1-0130",
    "prices": [
      {
        "country": "TH",
        "currency": "THB",
        "price": 265.0,
        "url": "https://www.watsons.co.th/en/mega-mega-fish-oil-1000mg-30capsule/p/BP_261609"
      }
    ],
    "sources": [
      "https://www.watsons.co.th/en/mega-mega-fish-oil-1000mg-30capsule/p/BP_261609",
      "https://store.boots.co.th/th/products/66b2f17e1a1d4b6b2aadb49a",
      "https://www.homepro.co.th/p/888134800640"
    ],
    "notes": "Each capsule: fish oil 1000 mg giving EPA 180 mg + DHA 120 mg, vitamin E 1.4 mg (Watsons TH). Label dose is 1 capsule 3x daily with food; serving here = 1 capsule. ฿265 is the Watsons regular price (promos seen at ฿130-230; Boots TH ฿115 promo / ฿265 regular). อย. 11-1-32732-1-0130 is from the HomePro listing of Mega Fish Oil 1000 mg (200-capsule pack) - not checked on oryor.com. Halal not verified. Watsons also lists a 200-capsule pack at ฿795."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Nutrakal",
    "name": "Deli D Vitamin D3 1,000 IU, 60 capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "TH",
        "currency": "THB",
        "price": 487.0,
        "url": "https://www.lazada.co.th/products/nutrakal-deli-d-60-capsules-3-1000-iu-i1159770426.html"
      }
    ],
    "sources": [
      "https://www.lazada.co.th/products/nutrakal-deli-d-60-capsules-3-1000-iu-i1159770426.html"
    ],
    "notes": "Thai brand. Dose (1,000 IU D3) and count (60 capsules) from the Lazada TH product title only; listing showed ฿487 (from ฿620) in the search index. The listing reportedly shows a Thai อย. number but it wasn't captured - left null. Capsule shell (gelatin?), excipients, allergens, halal and whether the seller is the official store are NOT verified. Weakest entry in this file - verify before seeding."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Pharmacity",
    "name": "Vitamin D3 1000 IU, 60 soft capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 60,
    "allergens": [
      "soy"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "2284/2022/ĐKSP",
    "prices": [
      {
        "country": "VN",
        "currency": "VND",
        "price": 125000.0,
        "url": "https://www.pharmacity.vn/pmc-vitamin-d3-1000iu-hop-60-vien.html"
      }
    ],
    "sources": [
      "https://www.pharmacity.vn/pmc-vitamin-d3-1000iu-hop-60-vien.html"
    ],
    "notes": "Pharmacity house brand, made by Phil Inter Pharma (VN). 1000 IU cholecalciferol per softgel; excipients soybean oil, gelatin, glycerin, sunset yellow FCF, brilliant blue FCF (soy listed because of soybean oil; gelatin -> not vegan). Price 125,000đ is a 50% promo (regular 250,000đ), seen in the search index. Số công bố 2284/2022/ĐKSP as printed on the Pharmacity page, not checked in the VFA database. Label dose: 1/day for >6 y and adults."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Herbs of Gold",
    "name": "Vitamin D3 1000, 120 capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 120,
    "allergens": [],
    "vegan": true,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": "3727/2024/ĐKSP",
    "prices": [
      {
        "country": "VN",
        "currency": "VND",
        "price": 435000.0,
        "url": "https://www.pharmacity.vn/herbs-of-gold-vitamin-d3-1000-bo-sung-vitamin-d-lo-120-vien.html"
      }
    ],
    "sources": [
      "https://www.pharmacity.vn/herbs-of-gold-vitamin-d3-1000-bo-sung-vitamin-d-lo-120-vien.html"
    ],
    "notes": "Australian brand. Pharmacity describes it as a vegan soft capsule without gelatin (vegan from the retailer's description). Số công bố 3727/2024/ĐKSP and ad approval 1962/2024/XNQC-ATTP from the Pharmacity page (not checked in the VFA database). Price 435,000đ incl. VAT, seen in the search index. Allergens not checked on the label."
  },
  {
    "supplementSlug": "vitamin_d",
    "brand": "Solgar",
    "name": "Vitamin D3 1000 IU, 90 capsules",
    "form": "vitamin_d3",
    "servingSizeG": 0,
    "activePerServingG": 1000,
    "sugarPerServingG": 0,
    "servingsPerContainer": 90,
    "allergens": [],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "VN",
        "currency": "VND",
        "price": 554000.0,
        "url": "https://www.pharmacity.vn/vien-bo-sung-vitamin-d3-1000iu-solgar-lo-90-vien.html"
      }
    ],
    "sources": [
      "https://www.pharmacity.vn/vien-bo-sung-vitamin-d3-1000iu-solgar-lo-90-vien.html"
    ],
    "notes": "25 µg (1000 IU) cholecalciferol per unit per Pharmacity; 90 per bottle; 36-month shelf life. Pharmacity's pages give inconsistent directions (1-2/day vs 2/day). Capsule type/excipients, số công bố, vegan and halal not verified. Price seen in the search index."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Nature's Care",
    "name": "Omega 3 Fish Oil 1000mg, 200 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 200,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "VN",
        "currency": "VND",
        "price": 305900.0,
        "url": "https://www.pharmacity.vn/dau-ca-natures-care-omega-3-fish-oil-1000mg-hop-200-vien.html"
      }
    ],
    "sources": [
      "https://www.pharmacity.vn/dau-ca-natures-care-omega-3-fish-oil-1000mg-hop-200-vien.html"
    ],
    "notes": "Made in Australia by Nature's Care Manufacture Pty Ltd. Per softgel: fish oil 1000 mg with omega-3 300 mg (EPA 180 mg + DHA 120 mg) per Pharmacity. Price 305,900đ is 30% off (regular 437,000đ), seen in the search index. Số công bố not captured; halal not verified."
  },
  {
    "supplementSlug": "omega_3",
    "brand": "Healthy Care",
    "name": "Fish Oil 1000mg Omega 3, 400 capsules",
    "form": "fish_oil",
    "servingSizeG": 0,
    "activePerServingG": 300,
    "sugarPerServingG": 0,
    "servingsPerContainer": 400,
    "allergens": [
      "fish"
    ],
    "vegan": false,
    "halalCertified": false,
    "halalBody": null,
    "certifications": [],
    "registrationNo": null,
    "prices": [
      {
        "country": "VN",
        "currency": "VND",
        "price": 560000.0,
        "url": "https://www.pharmacity.vn/healthy-care-fish-oil-1000mg-omega-3-chai-400-vien.html"
      }
    ],
    "sources": [
      "https://www.pharmacity.vn/healthy-care-fish-oil-1000mg-omega-3-chai-400-vien.html"
    ],
    "notes": "Made in Australia. Per capsule: fish oil 1000 mg with omega-3 marine triglycerides 300 mg (EPA 180 mg + DHA 120 mg) per Pharmacity. Price 560,000đ incl. VAT, seen in the search index. VN distributor: Cuộc Sống Hoàn Hảo Co. Số công bố not shown in what I could see; halal not verified."
  }
];

export interface ExtraPrice {
  brand: string;
  name: string;
  country: CatalogProduct["prices"][number]["country"];
  currency: string;
  price: number;
  url: string | null;
  source: string | null;
}

export const SEA_EXTRA_PRICES: ExtraPrice[] = [
  {
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Whey, Double Rich Chocolate, 5 lb",
    "country": "SG",
    "currency": "SGD",
    "price": 152.35,
    "url": "https://www.fairprice.com.sg/product/optimum-nutrition-gold-standard-double-rich-chocolate-1",
    "source": "https://support.optimumnutrition.com/en/support/solutions/folders/80000564395"
  },
  {
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Whey, Double Rich Chocolate, 5 lb",
    "country": "PH",
    "currency": "PHP",
    "price": 6990.0,
    "url": "https://www.lac.com.ph/en/brands_optimum-nutrition/optimum-nutrition/gold-standard-100-whey-double-rich-chocolate-06100030.html",
    "source": "https://support.optimumnutrition.com/en/support/solutions/folders/80000564395"
  },
  {
    "brand": "Myprotein",
    "name": "Impact Creatine Monohydrate, Unflavoured, 250 g",
    "country": "SG",
    "currency": "SGD",
    "price": 65.19,
    "url": "https://www.myprotein.com.sg/sports-nutrition/creatine-monohydrate-powder/10530050.html",
    "source": "https://myprotein.ie/p/sports-nutrition/creatine-monohydrate-powder/10530050"
  },
  {
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Whey, Double Rich Chocolate, 5 lb",
    "country": "ID",
    "currency": "IDR",
    "price": 1589267,
    "url": "https://www.tokopedia.com/optimumnutrition/etalase/halal-certified",
    "source": "https://www.tokopedia.com/find/whey-gold-standard-5-lbs"
  },
  {
    "brand": "Blackmores",
    "name": "Vitamin D3 1000 IU, 60 softgel capsules",
    "country": "ID",
    "currency": "IDR",
    "price": 182780,
    "url": "https://www.k24klik.com/p/blackmores-bio-d3-1000iu-softcap-60s-btl-35975",
    "source": "https://productlist.id/products/c199a915b48e6962"
  },
  {
    "brand": "Blackmores",
    "name": "Omega-3 Fish Oil 1000mg Odourless, 30 softgel capsules",
    "country": "ID",
    "currency": "IDR",
    "price": 115595,
    "url": "https://www.k24klik.com/p/blackmores-odourless-fish-oil-1000-softcap-30s-btl-25333",
    "source": "https://www.halodoc.com/obat-dan-vitamin/blackmores-fish-oil-1000-odourless-30-kapsul"
  },
  {
    "brand": "Optimum Nutrition",
    "name": "Gold Standard 100% Whey, Double Rich Chocolate, 5 lb",
    "country": "TH",
    "currency": "THB",
    "price": 3989.0,
    "url": "https://www.lazada.co.th/products/optimum-nutrition-gold-standard-100-whey-protein-5lb-double-rich-chocolate-i253276455.html",
    "source": "https://www.central.co.th/en/optimumnutrition-gold-standard-whey-protein-5-lbs-double-rich-chocolate-mkp0624783"
  }
];
