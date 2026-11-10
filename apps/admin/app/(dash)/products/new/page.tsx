import { prisma } from "@supplement/db";
import { ProductForm } from "@/components/ProductForm";
import { PRODUCT_FORMS, doseUnitOf } from "@/lib/constants";

export default async function NewProductPage() {
  const supplements = await prisma.supplement.findMany({ select: { id: true, name: true, dosing: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm supplements={supplements.map((s) => ({ id: s.id, name: s.name, unit: doseUnitOf(s.dosing) }))} forms={PRODUCT_FORMS} />
    </div>
  );
}
