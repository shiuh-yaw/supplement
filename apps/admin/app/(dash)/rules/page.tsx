import Link from "next/link";
import { prisma, type RuleStatus } from "@supplement/db";
import { StatusBadge, EffectBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

const FILTERS: (RuleStatus | "ALL")[] = ["ALL", "PUBLISHED", "PENDING_REVIEW", "DRAFT", "ARCHIVED"];

export default async function RulesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = FILTERS.includes(status as RuleStatus) ? (status as RuleStatus) : undefined;
  const rules = await prisma.rule.findMany({
    where: filter ? { status: filter } : { status: { not: "ARCHIVED" } },
    include: { supplement: true },
    orderBy: [{ supplementId: "asc" }, { effect: "desc" }, { priority: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rules & safety</h1>
          <p className="text-sm text-slate-600">
            Only <strong>published</strong> rules affect users. Block rules always override recommendations.
          </p>
        </div>
        <Link href="/rules/new" className="btn-primary">New rule</Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "ALL" ? "/rules" : `/rules?status=${f}`}
            className={`chip ${(filter ?? "ALL") === f ? "chip-on" : ""}`}>
            {f === "ALL" ? "Active" : f.replace("_", " ").toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto p-0 sm:p-0">
        <table className="table-base">
          <thead>
            <tr><th>Rule</th><th>Applies to</th><th>Effect</th><th>Priority</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/rules/${r.id}`} className="font-medium text-brand-700 underline">{r.name}</Link>
                  <p className="font-mono text-xs text-slate-400">{r.key}</p>
                </td>
                <td>{r.supplement?.name ?? <em className="text-slate-500">All supplements</em>}</td>
                <td><EffectBadge effect={r.effect} /></td>
                <td>{r.priority}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-500">No rules.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
