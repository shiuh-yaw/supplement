import bcrypt from "bcryptjs";
import { DEFAULT_RULES, DEFAULT_SUPPLEMENTS, SAMPLE_PRODUCTS } from "@supplement/engine";
import { prisma, toDbEffect } from "../src/index";

async function main() {
  // --- first admin -------------------------------------------------------------
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(`⚠  Created ${email} with the default password "change-me-now". Change it before deploying.`);
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

  // --- rules (seeded as PUBLISHED; existing rules are left untouched) -----------
  for (const r of DEFAULT_RULES) {
    await prisma.rule.upsert({
      where: { key: r.id },
      update: {},
      create: {
        key: r.id,
        name: r.name,
        supplementId: r.supplementSlug ? supplementIds.get(r.supplementSlug)! : null,
        effect: toDbEffect(r.effect),
        condition: r.condition as object,
        message: r.message,
        priority: r.priority,
        status: "PUBLISHED",
        createdById: admin.id,
        reviewNote: "Seeded starter rule — needs review by a qualified professional.",
      },
    });
  }

  // --- sample products (only if the catalog is empty) ---------------------------
  if ((await prisma.product.count()) === 0) {
    for (const p of SAMPLE_PRODUCTS) {
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
