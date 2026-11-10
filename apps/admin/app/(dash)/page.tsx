import Link from "next/link";
import { loadKnowledgeBase, prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [products, published, pending, drafts, events, byGoal, byCountry, { problems }, shopClicks] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.rule.count({ where: { status: "PUBLISHED" } }),
    prisma.rule.findMany({ where: { status: "PENDING_REVIEW" }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.rule.count({ where: { status: "DRAFT" } }),
    prisma.recommendationEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.recommendationEvent.groupBy({ by: ["goal"], where: { createdAt: { gte: since } }, _count: true }),
    prisma.recommendationEvent.groupBy({ by: ["country"], where: { createdAt: { gte: since } }, _count: true }),
    loadKnowledgeBase(),
    prisma.outboundClick.count({ where: { createdAt: { gte: since } } }),
  ]);
  const sampleProducts = await prisma.product.count({ where: { notes: { startsWith: "SAMPLE DATA" } } });
  const unverified = await prisma.product.count({ where: { active: false, notes: { startsWith: "UNVERIFIED" } } });

  const stats = [
    { label: "Checks (30 days)", value: events },
    { label: "Shop clicks (30 days)", value: shopClicks },
    { label: "Active products", value: products },
    { label: "Published rules", value: published },
    { label: "Draft rules", value: drafts },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {sampleProducts > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {sampleProducts} sample products are still in the catalog. Replace them with real, verified products before launch.
        </p>
      )}
      {unverified > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {unverified} researched products for SG, ID, TH, PH and VN are waiting to be checked. They're inactive until someone
          confirms the price, label and registration on the shop page.{" "}
          <Link href="/products" className="underline">Open products</Link>
        </p>
      )}
      {problems.length > 0 && (
        <ul className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {problems.map((p) => <li key={p}>⚠ {p}</li>)}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="font-semibold">Waiting for review</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nothing to review.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {pending.map((r) => (
              <li key={r.id} className="py-2">
                <Link href={`/rules/${r.id}`} className="text-brand-700 underline">{r.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Checks by goal", rows: byGoal.map((g) => [g.goal, g._count] as const) },
          { title: "Checks by country", rows: byCountry.map((c) => [c.country, c._count] as const) },
        ].map((block) => (
          <section key={block.title} className="card">
            <h2 className="font-semibold">{block.title}</h2>
            {block.rows.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No data yet.</p>
            ) : (
              <table className="table-base mt-2">
                <tbody>
                  {block.rows.sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td className="text-right">{v}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
