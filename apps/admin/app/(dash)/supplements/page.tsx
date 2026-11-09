import Link from "next/link";
import { prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

export default async function SupplementsPage() {
  const supplements = await prisma.supplement.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true, rules: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Supplements</h1>
      <p className="text-sm text-slate-600">
        The evidence library: what each supplement is, how it&apos;s dosed and the research behind it.
        New supplement types also need recommend rules and code-reviewed dosing logic, so they&apos;re added by developers.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {supplements.map((s) => (
          <Link key={s.id} href={`/supplements/${s.id}`} className="card block hover:border-brand-500">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{s.name}</h2>
              <span className="text-xs text-slate-500">Evidence {s.evidenceGrade}{s.active ? "" : " · hidden"}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.summary}</p>
            <p className="mt-2 text-xs text-slate-500">{s._count.products} products · {s._count.rules} rules</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
