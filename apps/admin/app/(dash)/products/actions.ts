"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, writeAudit } from "@supplement/db";
import { ALLERGENS, COUNTRIES, CURRENCY_BY_COUNTRY } from "@supplement/engine";
import { requireUser } from "@/lib/auth";
import { guard, type ActionState } from "@/lib/action";
import { PRODUCT_FORMS, doseUnitOf } from "@/lib/constants";

const list = (v: FormDataEntryValue | null) =>
  String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const user = await requireUser("catalog:write");
    const id = String(formData.get("id") ?? "") || null;
    const errors: string[] = [];
    const n = (key: string) => Number(formData.get(key));

    const data = {
      supplementId: String(formData.get("supplementId") ?? ""),
      brand: String(formData.get("brand") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      form: String(formData.get("form") ?? ""),
      servingSizeG: n("servingSizeG"),
      activePerServingG: n("activePerServingG"),
      sugarPerServingG: n("sugarPerServingG") || 0,
      servingsPerContainer: n("servingsPerContainer"),
      allergens: ALLERGENS.filter((a) => formData.get(`allergen_${a}`) === "on"),
      vegan: formData.get("vegan") === "on",
      halalCertified: formData.get("halalCertified") === "on",
      halalBody: String(formData.get("halalBody") ?? "").trim() || null,
      certifications: list(formData.get("certifications")),
      registrationNo: String(formData.get("registrationNo") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      active: formData.get("active") === "on",
    };

    if (!data.supplementId) errors.push("Choose a supplement.");
    if (!data.brand || !data.name) errors.push("Brand and name are required.");
    if (!PRODUCT_FORMS.includes(data.form as (typeof PRODUCT_FORMS)[number])) errors.push("Choose a form.");
    const supplement = data.supplementId
      ? await prisma.supplement.findUnique({ where: { id: data.supplementId }, select: { dosing: true } })
      : null;
    const unit = doseUnitOf(supplement?.dosing);
    if (Number.isNaN(data.servingSizeG) || data.servingSizeG < 0) errors.push("Serving size can't be negative.");
    else if (unit.startsWith("g") && !(data.servingSizeG > 0)) errors.push("Serving size (g) is required for powders.");
    if (!(data.activePerServingG > 0)) errors.push("Active amount per serving must be greater than 0.");
    else if (unit.startsWith("g") && data.activePerServingG > data.servingSizeG)
      errors.push("Active amount per serving can't be larger than the serving itself.");
    if (!Number.isInteger(data.servingsPerContainer) || data.servingsPerContainer <= 0)
      errors.push("Servings per container must be a whole number > 0.");
    if (data.vegan && data.allergens.includes("dairy")) errors.push("A vegan product can't contain dairy.");
    if (data.halalCertified && !data.halalBody) errors.push("Name the halal certification body (e.g. JAKIM, MUI, MUIS).");

    const prices = COUNTRIES.flatMap((country) => {
      const raw = String(formData.get(`price_${country}`) ?? "").trim();
      if (!raw) return [];
      const price = Number(raw);
      if (!(price > 0)) {
        errors.push(`Price for ${country} must be a positive number.`);
        return [];
      }
      const url = String(formData.get(`url_${country}`) ?? "").trim() || null;
      if (url && !/^https:\/\//.test(url)) errors.push(`Link for ${country} must start with https://`);
      return [{ country, currency: CURRENCY_BY_COUNTRY[country], price, url }];
    });
    if (prices.length === 0) errors.push("Add a price for at least one country.");
    if (errors.length) return { error: errors };

    if (id) {
      const before = await prisma.product.findUniqueOrThrow({ where: { id }, include: { prices: true } });
      const after = await prisma.product.update({
        where: { id },
        data: { ...data, prices: { deleteMany: {}, create: prices } },
        include: { prices: true },
      });
      await writeAudit({ userId: user.id, action: "update", entity: "Product", entityId: id, before, after });
      revalidatePath("/products");
      return { ok: "Saved." };
    }
    const created = await prisma.product.create({ data: { ...data, prices: { create: prices } }, include: { prices: true } });
    await writeAudit({ userId: user.id, action: "create", entity: "Product", entityId: created.id, after: created });
    redirect("/products");
  });
}

export async function deleteProduct(formData: FormData) {
  const user = await requireUser("catalog:write");
  const id = String(formData.get("id"));
  const before = await prisma.product.findUniqueOrThrow({ where: { id }, include: { prices: true } });
  await prisma.product.delete({ where: { id } });
  await writeAudit({ userId: user.id, action: "delete", entity: "Product", entityId: id, before });
  revalidatePath("/products");
  redirect("/products");
}
