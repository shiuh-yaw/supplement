import bcrypt from "bcryptjs";
import {
  DEFAULT_RULES,
  DEFAULT_SUPPLEMENTS,
  NEW_RECOMMEND_RULE_IDS,
  RULE_TRANSLATIONS,
  SAMPLE_PRODUCTS,
  SUPPLEMENT_TRANSLATIONS,
} from "@supplement/engine";
import { prisma, toDbEffect, writeAudit } from "../src/index";
import { CATALOG_CHECKED_ON, REAL_CATALOG } from "./catalog";
import { SEA_CATALOG, SEA_CATALOG_CHECKED_ON, SEA_EXTRA_PRICES } from "./catalog-sea";

/** Prefix on products that must be checked before they go live (the dashboard counts them). */
const UNVERIFIED = "UNVERIFIED —";

const SAMPLE_PREFIX = "SAMPLE DATA";

/**
 * Safe to run repeatedly, including on a live database: it only ADDS what's missing
 * (admin, supplements, rules, sample products for supplements with no products yet)
 * and never overwrites edits made in the backoffice.
 */
async function main() {
  // --- first admin -------------------------------------------------------------
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  let admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
    if (process.env.NODE_ENV === "production" && (password === "change-me-now" || password.length < 12)) {
      throw new Error("Set ADMIN_PASSWORD (12+ characters, not the example value) before seeding a production database.");
    }
    admin = await prisma.adminUser.create({
      data: { email, name: "Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
    });
    if (!process.env.ADMIN_PASSWORD) {
      console.warn(`⚠  Created ${email} with the default password "change-me-now". Change it before deploying.`);
    }
  }

  // --- supplements -------------------------------------------------------------
  const supplementIds = new Map<string, string>();
  for (const [i, s] of DEFAULT_SUPPLEMENTS.entries()) {
    const data = {
      name: s.name,
      summary: s.summary,
      evidenceGrade: s.evidenceGrade,
      dosing: s.dosing,
      timing: s.timing,
      notes: s.notes,
      references: s.references as unknown as object[],
      sortOrder: i,
    };
    const row = await prisma.supplement.upsert({ where: { slug: s.slug }, update: {}, create: { slug: s.slug, ...data } });
    supplementIds.set(s.slug, row.id);
  }

  // --- starter content corrections ---------------------------------------------
  // Applied only if the value is still exactly what an earlier seed wrote, so
  // edits made in the backoffice are never overwritten.
  const vitD = DEFAULT_SUPPLEMENTS.find((x) => x.slug === "vitamin_d");
  const vitDRow = await prisma.supplement.findUnique({ where: { slug: "vitamin_d" } });
  const d = vitDRow?.dosing as { kind?: string; min?: number; max?: number; unit?: string } | undefined;
  const isOldStarterDose = d?.kind === "fixed" && d.min === 1000 && d.max === 2000 && d.unit === "IU";
  if (vitD && vitDRow && isOldStarterDose) {
    const after = await prisma.supplement.update({
      where: { id: vitDRow.id },
      data: { dosing: vitD.dosing, notes: vitD.notes },
    });
    await writeAudit({ userId: null, action: "seed:update-dosing", entity: "Supplement", entityId: vitDRow.id, before: { dosing: vitDRow.dosing }, after: { dosing: after.dosing } });
    console.log("  ~ vitamin D dose set to 1000 IU/day (Malaysia NPRA limit for supplements)");
  }

  // --- rules (existing rules are left untouched) ---------------------------------
  // Safety rules (block/caution) go live immediately — they can only hold a
  // recommendation back. New recommend rules wait for a reviewer's approval.
  let added = 0;
  for (const r of DEFAULT_RULES) {
    if (await prisma.rule.findUnique({ where: { key: r.id } })) continue;
    const needsReview = NEW_RECOMMEND_RULE_IDS.has(r.id);
    added++;
    await prisma.rule.create({
      data: {
        key: r.id,
        name: r.name,
        supplementId: r.supplementSlug ? supplementIds.get(r.supplementSlug)! : null,
        effect: toDbEffect(r.effect),
        condition: r.condition as object,
        message: r.message,
        priority: r.priority,
        status: needsReview ? "PENDING_REVIEW" : "PUBLISHED",
        createdById: admin.id,
        reviewNote: needsReview
          ? "New starter recommendation — approve to make it live."
          : "Seeded starter rule — needs review by a qualified professional.",
      },
    });
  }
  if (added) console.log(`  + ${added} rules added`);

  // --- sample products (only for supplements that have no products yet) ---------
  const emptySupplements = new Set<string>();
  for (const [slug, id] of supplementIds) {
    if ((await prisma.product.count({ where: { supplementId: id } })) === 0) emptySupplements.add(slug);
  }
  for (const p of SAMPLE_PRODUCTS) {
    if (!emptySupplements.has(p.supplementSlug)) continue;
    {
      await prisma.product.create({
        data: {
          supplementId: supplementIds.get(p.supplementSlug)!,
          brand: p.brand,
          name: p.name,
          form: p.form,
          servingSizeG: p.servingSizeG,
          activePerServingG: p.activePerServingG,
          sugarPerServingG: p.sugarPerServingG,
          servingsPerContainer: p.servingsPerContainer,
          allergens: p.allergens,
          vegan: p.vegan,
          halalCertified: p.halalCertified,
          halalBody: p.halalCertified ? "SAMPLE — replace with JAKIM / MUI / MUIS" : null,
          certifications: p.certifications,
          notes: "SAMPLE DATA — fictional product. Replace with your verified catalog.",
          prices: { create: p.prices.map((pr) => ({ country: pr.country, currency: pr.currency, price: pr.price })) },
        },
      });
    }
  }

  // --- translations (adds only the languages a row doesn't have yet, so backoffice edits stay) ---
  const missingLangs = (current: unknown, starter: object) => {
    const have = current && typeof current === "object" ? (current as Record<string, unknown>) : {};
    const add = Object.fromEntries(Object.entries(starter).filter(([loc]) => !(loc in have)));
    return Object.keys(add).length ? { ...have, ...add } : null;
  };
  let translated = 0;
  for (const [slug, t] of Object.entries(SUPPLEMENT_TRANSLATIONS)) {
    const row = await prisma.supplement.findUnique({ where: { slug } });
    const merged = row && missingLangs(row.translations, t);
    if (row && merged) {
      await prisma.supplement.update({ where: { id: row.id }, data: { translations: merged as object } });
      translated++;
    }
  }
  for (const [key, t] of Object.entries(RULE_TRANSLATIONS)) {
    const row = await prisma.rule.findUnique({ where: { key } });
    const merged = row && missingLangs(row.translations, t);
    if (row && merged) {
      await prisma.rule.update({ where: { id: row.id }, data: { translations: merged as object } });
      translated++;
    }
  }
  if (translated) console.log(`  + translations added or extended for ${translated} supplements and rules`);

  // --- real catalog ------------------------------------------------------------
  let productsAdded = 0;
  for (const p of REAL_CATALOG) {
    const supplementId = supplementIds.get(p.supplementSlug);
    if (!supplementId) continue;
    if (await prisma.product.findFirst({ where: { brand: p.brand, name: p.name } })) continue;
    const created = await prisma.product.create({
      data: {
        supplementId,
        brand: p.brand,
        name: p.name,
        form: p.form,
        servingSizeG: p.servingSizeG,
        activePerServingG: p.activePerServingG,
        sugarPerServingG: p.sugarPerServingG,
        servingsPerContainer: p.servingsPerContainer,
        allergens: p.allergens,
        vegan: p.vegan,
        halalCertified: p.halalCertified,
        halalBody: p.halalBody,
        certifications: p.certifications,
        registrationNo: p.registrationNo,
        notes: [`Researched ${CATALOG_CHECKED_ON} from retailer listings; re-check the price.`, p.notes, `Sources: ${p.sources.join(" ")}`].filter(Boolean).join(" "),
        prices: { create: p.prices.map((pr) => ({ country: pr.country, currency: pr.currency, price: pr.price, url: pr.url })) },
      },
    });
    await writeAudit({ userId: null, action: "seed:add-product", entity: "Product", entityId: created.id, after: { brand: p.brand, name: p.name } });
    productsAdded++;
  }
  if (productsAdded) console.log(`  + ${productsAdded} real products added`);

  // --- other Southeast Asian countries: added INACTIVE until someone verifies them on the shop page ---
  let seaAdded = 0;
  for (const p of SEA_CATALOG) {
    const supplementId = supplementIds.get(p.supplementSlug);
    if (!supplementId) continue;
    if (await prisma.product.findFirst({ where: { brand: p.brand, name: p.name } })) continue;
    const created = await prisma.product.create({
      data: {
        supplementId,
        brand: p.brand,
        name: p.name,
        form: p.form,
        servingSizeG: p.servingSizeG,
        activePerServingG: p.activePerServingG,
        sugarPerServingG: p.sugarPerServingG,
        servingsPerContainer: p.servingsPerContainer,
        allergens: p.allergens,
        vegan: p.vegan,
        halalCertified: p.halalCertified,
        halalBody: p.halalBody,
        certifications: p.certifications,
        registrationNo: p.registrationNo,
        active: false,
        notes: [
          `${UNVERIFIED} Researched ${SEA_CATALOG_CHECKED_ON} from search results; check the price, label and registration on the shop page, then tick Active.`,
          p.notes,
          `Sources: ${p.sources.join(" ")}`,
        ].filter(Boolean).join(" "),
        prices: { create: p.prices.map((pr) => ({ country: pr.country, currency: pr.currency, price: pr.price, url: pr.url })) },
      },
    });
    await writeAudit({ userId: null, action: "seed:add-product", entity: "Product", entityId: created.id, after: { brand: p.brand, name: p.name, active: false } });
    seaAdded++;
  }
  if (seaAdded) console.log(`  + ${seaAdded} SEA products added as inactive (verify, then activate)`);

  let pricesAdded = 0;
  for (const x of SEA_EXTRA_PRICES) {
    const product = await prisma.product.findFirst({ where: { brand: x.brand, name: x.name } });
    if (!product) continue;
    if (await prisma.productPrice.findUnique({ where: { productId_country: { productId: product.id, country: x.country } } })) continue;
    await prisma.productPrice.create({ data: { productId: product.id, country: x.country, currency: x.currency, price: x.price, url: x.url } });
    await writeAudit({ userId: null, action: "seed:add-price", entity: "Product", entityId: product.id, after: { country: x.country, price: x.price, url: x.url, source: x.source } });
    pricesAdded++;
  }
  if (pricesAdded) console.log(`  + ${pricesAdded} prices added for other countries`);

  // Remove SAMPLE products for supplements that now have at least one real product.
  let samplesRemoved = 0;
  for (const [slug, id] of supplementIds) {
    const real = await prisma.product.count({ where: { supplementId: id, NOT: { notes: { startsWith: SAMPLE_PREFIX } } } });
    if (real === 0) continue;
    const samples = await prisma.product.findMany({ where: { supplementId: id, notes: { startsWith: SAMPLE_PREFIX } } });
    for (const s of samples) {
      await prisma.product.delete({ where: { id: s.id } });
      await writeAudit({ userId: null, action: "seed:remove-sample", entity: "Product", entityId: s.id, before: { brand: s.brand, name: s.name, supplement: slug } });
      samplesRemoved++;
    }
  }
  if (samplesRemoved) console.log(`  - ${samplesRemoved} sample products removed`);

  // --- one-time owner approval of the starter recommendations -------------------
  // Only when APPROVE_STARTER_RECOMMENDATIONS=true. Recorded against the owner's
  // account in the audit log; a qualified reviewer should still check them.
  if (process.env.APPROVE_STARTER_RECOMMENDATIONS === "true") {
    const pending = await prisma.rule.findMany({
      where: { status: "PENDING_REVIEW", key: { in: [...NEW_RECOMMEND_RULE_IDS] } },
    });
    const note = `Approved on the owner's instruction (${new Date().toISOString().slice(0, 10)}). Not yet reviewed by a qualified professional.`;
    for (const r of pending) {
      await prisma.rule.update({
        where: { id: r.id },
        data: { status: "PUBLISHED", reviewedById: admin.id, reviewedAt: new Date(), reviewNote: note },
      });
      await writeAudit({
        userId: admin.id,
        action: "publish",
        entity: "Rule",
        entityId: r.id,
        before: { status: r.status },
        after: { status: "PUBLISHED", reviewNote: note },
      });
    }
    if (pending.length) console.log(`  ✓ ${pending.length} starter recommendations approved on the owner's instruction`);
  }

  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
