import { PrismaClient, type Prisma, type RuleEffect as DbRuleEffect } from "@prisma/client";
import {
  dosingSchema,
  validateCondition,
  type Allergen,
  type Country,
  type Locale,
  type KnowledgeBase,
  type Reference,
  type Rule,
  type RuleEffect,
} from "@supplement/engine";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const toEngineEffect = (e: DbRuleEffect): RuleEffect => e.toLowerCase() as RuleEffect;
export const toDbEffect = (e: RuleEffect): DbRuleEffect => e.toUpperCase() as DbRuleEffect;

export interface LoadOptions {
  /** Include DRAFT and PENDING_REVIEW rules — for the backoffice simulator only. */
  includeUnpublishedRules?: boolean;
  /** Language for supplement and rule text; anything untranslated falls back to English. */
  locale?: Locale;
}

type SupplementText = { name?: string; summary?: string; timing?: string; notes?: string[] };

/** Picks the translation for `locale` from a translations JSON value, if there is one. */
function pick<T>(translations: unknown, locale: Locale | undefined): Partial<T> {
  if (!locale || locale === "en" || !translations || typeof translations !== "object") return {};
  const t = (translations as Record<string, unknown>)[locale];
  return t && typeof t === "object" ? (t as Partial<T>) : typeof t === "string" ? ({ message: t } as unknown as Partial<T>) : {};
}
const nonEmpty = (s: unknown): s is string => typeof s === "string" && s.trim() !== "";

export interface LoadedKnowledgeBase {
  kb: KnowledgeBase;
  /** Rules / supplements skipped because their stored JSON is invalid. */
  problems: string[];
}

/** Loads the active knowledge base and converts it into engine types. */
export async function loadKnowledgeBase(options: LoadOptions = {}): Promise<LoadedKnowledgeBase> {
  const problems: string[] = [];
  const statuses: Prisma.RuleWhereInput["status"] = options.includeUnpublishedRules
    ? { in: ["PUBLISHED", "PENDING_REVIEW", "DRAFT"] }
    : "PUBLISHED";

  const [supplementRows, ruleRows, productRows] = await Promise.all([
    prisma.supplement.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.rule.findMany({ where: { status: statuses }, include: { supplement: true } }),
    prisma.product.findMany({ where: { active: true }, include: { supplement: true, prices: true } }),
  ]);

  const supplements: KnowledgeBase["supplements"] = [];
  for (const s of supplementRows) {
    const dosing = dosingSchema.safeParse(s.dosing);
    if (!dosing.success) {
      problems.push(`Supplement "${s.slug}" has invalid dosing and was skipped.`);
      continue;
    }
    const t = pick<SupplementText>(s.translations, options.locale);
    const tNotes = Array.isArray(t.notes) ? t.notes.filter(nonEmpty) : [];
    supplements.push({
      slug: s.slug,
      name: nonEmpty(t.name) ? t.name : s.name,
      summary: nonEmpty(t.summary) ? t.summary : s.summary,
      evidenceGrade: s.evidenceGrade,
      dosing: dosing.data,
      timing: nonEmpty(t.timing) ? t.timing : s.timing,
      notes: tNotes.length ? tNotes : s.notes,
      references: (Array.isArray(s.references) ? s.references : []) as unknown as Reference[],
    });
  }

  const rules: Rule[] = [];
  for (const r of ruleRows) {
    const condition = validateCondition(r.condition);
    if (!condition.ok) {
      problems.push(`Rule "${r.key}" has an invalid condition and was skipped: ${condition.errors.join("; ")}`);
      continue;
    }
    if (r.supplement && !r.supplement.active) continue;
    rules.push({
      id: r.key,
      name: r.name,
      supplementSlug: r.supplement?.slug ?? null,
      effect: toEngineEffect(r.effect),
      condition: condition.condition,
      message: (() => {
        const t = pick<{ message: string }>(r.translations, options.locale);
        return nonEmpty(t.message) ? t.message : r.message;
      })(),
      priority: r.priority,
    });
  }

  const products: KnowledgeBase["products"] = productRows.map((p) => ({
    id: p.id,
    supplementSlug: p.supplement.slug,
    brand: p.brand,
    name: p.name,
    form: p.form,
    servingSizeG: p.servingSizeG,
    activePerServingG: p.activePerServingG,
    sugarPerServingG: p.sugarPerServingG,
    servingsPerContainer: p.servingsPerContainer,
    allergens: p.allergens as Allergen[],
    vegan: p.vegan,
    halalCertified: p.halalCertified,
    certifications: p.certifications,
    prices: p.prices.map((pr) => ({
      country: pr.country as Country,
      currency: pr.currency,
      price: pr.price,
      url: pr.url,
    })),
  }));

  // A supplement is only offered once at least one of its recommend rules is live,
  // so new supplements stay hidden until a reviewer approves them.
  const recommendable = new Set(rules.filter((r) => r.effect === "recommend").map((r) => r.supplementSlug));
  const visible = supplements.filter((s) => recommendable.has(s.slug));

  return { kb: { supplements: visible, rules, products }, problems };
}

export async function writeAudit(entry: {
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      before: entry.before === undefined ? undefined : (JSON.parse(JSON.stringify(entry.before)) as Prisma.InputJsonValue),
      after: entry.after === undefined ? undefined : (JSON.parse(JSON.stringify(entry.after)) as Prisma.InputJsonValue),
    },
  });
}
