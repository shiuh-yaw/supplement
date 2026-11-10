import { notFound } from "next/navigation";
import { prisma } from "@supplement/db";
import { ProductForm } from "@/components/ProductForm";
import { PRODUCT_FORMS, doseUnitOf } from "@/lib/constants";
import { deleteProduct } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, supplements] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { prices: true } }),
    prisma.supplement.findMany({ select: { id: true, name: true, dosing: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton className="btn-danger" message="Delete this product permanently?">Delete</ConfirmButton>
        </form>
      </div>
      <ProductForm product={product} supplements={supplements.map((s) => ({ id: s.id, name: s.name, unit: doseUnitOf(s.dosing) }))} forms={PRODUCT_FORMS} />
    </div>
  );
}
