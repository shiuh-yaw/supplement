"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, writeAudit, type RuleEffect, type RuleStatus } from "@supplement/db";
import { validateCondition } from "@supplement/engine";
import { can, requireUser } from "@/lib/auth";
import { guard, type ActionState } from "@/lib/action";

const EFFECTS: RuleEffect[] = ["RECOMMEND", "CAUTION", "BLOCK"];

export async function saveRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const user = await requireUser("rules:draft");
    const id = String(formData.get("id") ?? "") || null;
    const errors: string[] = [];

    const key = String(formData.get("key") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const effect = String(formData.get("effect")) as RuleEffect;
    const priority = Number(formData.get("priority") ?? 0);
    const supplementId = String(formData.get("supplementId") ?? "") || null;

    if (!id && !/^[a-z0-9-]{3,60}$/.test(key)) errors.push("Key must be 3–60 lowercase letters, numbers or dashes.");
    if (!name) errors.push("Name is required.");
    if (!message) errors.push("User-facing message is required.");
    if (!EFFECTS.includes(effect)) errors.push("Choose an effect.");
    if (!Number.isInteger(priority)) errors.push("Priority must be a whole number.");

    let condition: unknown;
    try {
      condition = JSON.parse(String(formData.get("condition") ?? ""));
    } catch {
      errors.push("Condition is not valid JSON.");
    }
    if (condition !== undefined) {
      const check = validateCondition(condition);
      if (!check.ok) errors.push(...check.errors.map((e) => `Condition: ${e}`));
    }
    if (errors.length) return { error: errors };

    const data = { name, message, effect, priority, supplementId, condition: condition as object };

    if (id) {
      const before = await prisma.rule.findUniqueOrThrow({ where: { id } });
      if (before.status === "PUBLISHED" && !can(user.role, "rules:publish")) {
        return { error: "Only a reviewer can change a published rule. Create a new draft rule instead." };
      }
      const after = await prisma.rule.update({ where: { id }, data });
      await writeAudit({ userId: user.id, action: "update", entity: "Rule", entityId: id, before, after });
    } else {
      if (await prisma.rule.findUnique({ where: { key } })) return { error: `Key "${key}" is already used.` };
      const created = await prisma.rule.create({ data: { ...data, key, status: "DRAFT", createdById: user.id } });
      await writeAudit({ userId: user.id, action: "create", entity: "Rule", entityId: created.id, after: created });
      redirect(`/rules/${created.id}`);
    }
    revalidatePath("/rules");
    return { ok: "Saved." };
  });
}

const TRANSITIONS: Record<string, { from: RuleStatus[]; to: RuleStatus; needs: "rules:draft" | "rules:publish" }> = {
  submit: { from: ["DRAFT"], to: "PENDING_REVIEW", needs: "rules:draft" },
  publish: { from: ["PENDING_REVIEW"], to: "PUBLISHED", needs: "rules:publish" },
  reject: { from: ["PENDING_REVIEW"], to: "DRAFT", needs: "rules:publish" },
  archive: { from: ["PUBLISHED", "DRAFT", "PENDING_REVIEW"], to: "ARCHIVED", needs: "rules:publish" },
  restore: { from: ["ARCHIVED"], to: "DRAFT", needs: "rules:draft" },
};

export async function transitionRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const id = String(formData.get("id"));
    const action = String(formData.get("action"));
    const note = String(formData.get("reviewNote") ?? "").trim() || null;
    const t = TRANSITIONS[action];
    if (!t) return { error: "Unknown action." };

    const user = await requireUser(t.needs);
    const rule = await prisma.rule.findUniqueOrThrow({ where: { id } });
    if (!t.from.includes(rule.status)) return { error: `Can't ${action} a rule that is ${rule.status}.` };

    // Four-eyes principle: reviewers can't publish their own rules (admins can, for small teams).
    if (action === "publish" && rule.createdById === user.id && user.role !== "ADMIN") {
      return { error: "Someone else must review and publish a rule you created." };
    }
    if (action === "reject" && !note) return { error: "Add a note explaining what needs to change." };

    const reviewed = action === "publish" || action === "reject";
    const after = await prisma.rule.update({
      where: { id },
      data: {
        status: t.to,
        ...(reviewed ? { reviewedById: user.id, reviewedAt: new Date(), reviewNote: note } : {}),
      },
    });
    await writeAudit({ userId: user.id, action, entity: "Rule", entityId: id, before: { status: rule.status }, after: { status: after.status, reviewNote: note } });
    revalidatePath("/rules");
    revalidatePath(`/rules/${id}`);
    return { ok: `Rule ${t.to.toLowerCase().replace("_", " ")}.` };
  });
}
