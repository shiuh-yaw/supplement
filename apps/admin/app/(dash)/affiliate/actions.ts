"use server";

import { revalidatePath } from "next/cache";
import { normaliseHost, validateAffiliateProgram } from "@supplement/engine";
import { prisma, writeAudit } from "@supplement/db";
import { requireUser } from "@/lib/auth";
import { guard, type ActionState } from "@/lib/action";

export async function saveProgram(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const user = await requireUser("affiliate:manage");
    const id = String(formData.get("id") ?? "") || null;
    const name = String(formData.get("name") ?? "").trim();
    const host = normaliseHost(String(formData.get("host") ?? ""));
    const template = String(formData.get("template") ?? "").trim();
    const enabled = formData.get("enabled") === "on";

    const errors = validateAffiliateProgram({ host, template });
    if (!name) errors.unshift("Name is required.");
    if (errors.length) return { error: errors };
    const clash = await prisma.affiliateProgram.findUnique({ where: { host } });
    if (clash && clash.id !== id) return { error: `${host} already has a program (${clash.name}).` };

    if (id) {
      const before = await prisma.affiliateProgram.findUniqueOrThrow({ where: { id } });
      const after = await prisma.affiliateProgram.update({ where: { id }, data: { name, host, template, enabled } });
      await writeAudit({ userId: user.id, action: "update", entity: "AffiliateProgram", entityId: id, before, after });
    } else {
      const after = await prisma.affiliateProgram.create({ data: { name, host, template, enabled } });
      await writeAudit({ userId: user.id, action: "create", entity: "AffiliateProgram", entityId: after.id, after });
    }
    revalidatePath("/affiliate");
    return { ok: id ? `Saved ${name}.` : `Added ${name}.` };
  });
}

export async function deleteProgram(formData: FormData) {
  const user = await requireUser("affiliate:manage");
  const id = String(formData.get("id"));
  const before = await prisma.affiliateProgram.delete({ where: { id } });
  await writeAudit({ userId: user.id, action: "delete", entity: "AffiliateProgram", entityId: id, before });
  revalidatePath("/affiliate");
}
