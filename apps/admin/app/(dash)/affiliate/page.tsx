import { prisma } from "@supplement/db";
import { requireUser } from "@/lib/auth";
import { AffiliateForm } from "@/components/AffiliateForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteProgram } from "./actions";

export const dynamic = "force-dynamic";

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
};

export default async function AffiliatePage() {
  await requireUser("affiliate:manage");
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [programs, prices, clicks] = await Promise.all([
    prisma.affiliateProgram.findMany({ orderBy: { name: "asc" } }),
    prisma.productPrice.findMany({ where: { url: { not: null }, product: { active: true } }, select: { url: true, country: true } }),
    prisma.outboundClick.groupBy({ by: ["host", "affiliate"], where: { createdAt: { gte: since } }, _count: true }),
  ]);

  // Which shops the catalog links to, and whether a program covers each.
  const shops = new Map<string, { links: number; countries: Set<string> }>();
  for (const p of prices) {
    const h = p.url && hostOf(p.url);
    if (!h) continue;
    const s = shops.get(h) ?? { links: 0, countries: new Set<string>() };
    s.links++;
    s.countries.add(p.country);
    shops.set(h, s);
  }
  const covered = (h: string) => programs.find((p) => p.enabled && (h === p.host || h.endsWith(`.${p.host}`)));
  const clickRows = new Map<string, { total: number; affiliate: number }>();
  for (const c of clicks) {
    const r = clickRows.get(c.host) ?? { total: 0, affiliate: 0 };
    r.total += c._count;
    if (c.affiliate) r.affiliate += c._count;
    clickRows.set(c.host, r);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Affiliate links</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          When someone clicks a buy link, Sukat adds your affiliate code for that shop. This happens after the click: recommendations
          and rankings are worked out without it. The website tells visitors that links may earn a commission (see “How Sukat works”).
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-semibold">Shops in the catalog</h2>
        {shops.size === 0 ? (
          <p className="text-sm text-slate-500">No product links yet.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th>Shop</th><th>Countries</th><th className="text-right">Product links</th><th>Program</th><th className="text-right">Clicks (30 days)</th></tr></thead>
            <tbody>
              {[...shops.entries()].sort((a, b) => b[1].links - a[1].links).map(([h, s]) => {
                const p = covered(h);
                const c = clickRows.get(h);
                return (
                  <tr key={h}>
                    <td className="font-mono text-xs">{h}</td>
                    <td>{[...s.countries].sort().join(", ")}</td>
                    <td className="text-right">{s.links}</td>
                    <td>{p ? <span className="text-brand-700">{p.name}</span> : <span className="text-slate-400">None</span>}</td>
                    <td className="text-right">{c ? `${c.total}${c.affiliate ? ` (${c.affiliate} with code)` : ""}` : 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="text-xs text-slate-500">
          Sign up with each shop's own program (Shopee Affiliate Program, Lazada Affiliate Program, TikTok Shop / Tokopedia affiliate,
          iHerb Rewards) or a network such as Involve Asia, then paste the deep-link format they give you below. Product pages on a
          retailer's own site (e.g. Watsons, Guardian) are only covered if that retailer runs a program you've joined.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Programs</h2>
        {programs.length === 0 && <p className="text-sm text-slate-500">No programs yet. Buy links go straight to the shop.</p>}
        {programs.map((p) => (
          <details key={p.id} className="card">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{p.name} <span className="font-mono text-xs text-slate-500">{p.host}</span></span>
              <span className={`rounded-lg px-2 py-0.5 text-xs ${p.enabled ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                {p.enabled ? "Enabled" : "Off"}
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              <AffiliateForm initial={{ id: p.id, name: p.name, host: p.host, template: p.template, enabled: p.enabled }} />
              <form action={deleteProgram}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`Delete ${p.name}?`} className="text-sm text-red-700 underline">Delete program</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Add a program</h2>
        <AffiliateForm />
      </section>
    </div>
  );
}
