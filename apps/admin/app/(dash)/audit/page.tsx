import { prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <p className="text-sm text-slate-600">Every change to products, supplements, rules and users. Latest 200 entries.</p>
      <div className="card overflow-x-auto p-0 sm:p-0">
        <table className="table-base">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="align-top">
                <td className="text-xs whitespace-nowrap">{l.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
                <td>{l.user?.name ?? "system"}</td>
                <td className="font-medium">{l.action}</td>
                <td className="text-xs">{l.entity}<p className="font-mono text-slate-400">{l.entityId.slice(0, 10)}</p></td>
                <td>
                  {(l.before || l.after) && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-brand-700">View</summary>
                      <pre className="mt-1 max-w-xl overflow-x-auto rounded bg-slate-50 p-2">{JSON.stringify({ before: l.before, after: l.after }, null, 2)}</pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
