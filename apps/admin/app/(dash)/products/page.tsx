import Link from "next/link";
import { prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { supplement: true, prices: true },
    orderBy: [{ supplement: { sortOrder: "asc" } }, { brand: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new" className="btn-primary">Add product</Link>
      </div>
      <div className="card overflow-x-auto p-0 sm:p-0">
        <table className="table-base">
          <thead>
            <tr><th>Product</th><th>Type</th><th>Per serving</th><th>Flags</th><th>Countries</th><th>Status</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/products/${p.id}`} className="font-medium text-brand-700 underline">{p.name}</Link>
                  <p className="text-xs text-slate-500">{p.brand}</p>
                </td>
                <td>{p.supplement.name}<p className="text-xs text-slate-500">{p.form.replaceAll("_", " ")}</p></td>
                <td>{p.activePerServingG} g / {p.servingSizeG} g</td>
                <td className="space-x-1 text-xs">
                  {p.halalCertified && <span className="rounded bg-brand-50 px-1.5 text-brand-700">Halal</span>}
                  {p.vegan && <span className="rounded bg-brand-50 px-1.5 text-brand-700">Vegan</span>}
                  {p.certifications.length > 0 && <span className="rounded bg-brand-50 px-1.5 text-brand-700">Tested</span>}
                  {p.notes?.startsWith("SAMPLE DATA") && <span className="rounded bg-amber-100 px-1.5 text-amber-800">Sample</span>}
                </td>
                <td className="text-xs">{p.prices.map((pr) => pr.country).join(", ")}</td>
                <td className="text-xs">{p.active ? "Active" : "Hidden"}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="text-center text-slate-500">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
