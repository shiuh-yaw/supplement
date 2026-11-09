"use server";

import { revalidatePath } from "next/cache";
import { prisma, writeAudit, type EvidenceGrade } from "@supplement/db";
import { dosingSchema } from "@supplement/engine";
import { can, requireUser } from "@/lib/auth";
import { guard, type ActionState } from "@/lib/action";

export async function saveSupplement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const user = await requireUser("catalog:write");
    const id = String(formData.get("id"));
    const before = await prisma.supplement.findUniqueOrThrow({ where: { id } });
    const errors: string[] = [];

    const data: Parameters<typeof prisma.supplement.update>[0]["data"] = {
      name: String(formData.get("name") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      timing: String(formData.get("timing") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      active: formData.get("active") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    };
    if (!data.name || !data.summary) errors.push("Name and summary are required.");

    let references: unknown;
    try {
      references = JSON.parse(String(formData.get("references") ?? "[]"));
      const ok = Array.isArray(references) && references.every(
        (r) => r && typeof r.title === "string" && typeof r.url === "string" && r.url.startsWith("https://"),
      );
      if (!ok) errors.push('References must be a list of { "title": "...", "url": "https://..." }.');
      else data.references = references as object[];
    } catch {
      errors.push("References are not valid JSON.");
    }

    // Dose and evidence grade change what users are told to take — reviewers only.
    const dosingRaw = String(formData.get("dosing") ?? "");
    const grade = String(formData.get("evidenceGrade") ?? before.evidenceGrade) as EvidenceGrade;
    const dosingChanged = dosingRaw && JSON.stringify(JSON.parse(dosingRaw || "null")) !== JSON.stringify(before.dosing);
    if (dosingChanged || grade !== before.evidenceGrade) {
      if (!can(user.role, "rules:publish")) {
        errors.push("Only a reviewer can change dosing or the evidence grade.");
      } else {
        const parsed = dosingSchema.safeParse(JSON.parse(dosingRaw));
        if (!parsed.success) errors.push(...parsed.error.issues.map((i) => `Dosing ${i.path.join(".")}: ${i.message}`));
        else data.dosing = parsed.data;
        if (!["A", "B", "C"].includes(grade)) errors.push("Evidence grade must be A, B or C.");
        else data.evidenceGrade = grade;
      }
    }
    if (errors.length) return { error: errors };

    const after = await prisma.supplement.update({ where: { id }, data });
    await writeAudit({ userId: user.id, action: "update", entity: "Supplement", entityId: id, before, after });
    revalidatePath("/supplements");
    return { ok: "Saved." };
  });
}
