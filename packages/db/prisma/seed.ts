import bcrypt from "bcryptjs";
import { DEFAULT_RULES, DEFAULT_SUPPLEMENTS, NEW_RECOMMEND_RULE_IDS, SAMPLE_PRODUCTS } from "@supplement/engine";
import { prisma, toDbEffect } from "../src/index";

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

  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
