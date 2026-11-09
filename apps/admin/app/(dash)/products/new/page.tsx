import { prisma } from "@supplement/db";
import { ProductForm } from "@/components/ProductForm";
import { PRODUCT_FORMS } from "@/lib/constants";

export default async function NewProductPage() {
  const supplements = await prisma.supplement.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm supplements={supplements} forms={PRODUCT_FORMS} />
    </div>
  );
}
