"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma, writeAudit, type Role } from "@supplement/db";
import { requireUser } from "@/lib/auth";
import { guard, type ActionState } from "@/lib/action";

const ROLES: Role[] = ["ADMIN", "REVIEWER", "EDITOR"];
const safe = (u: { id: string; email: string; name: string; role: Role; active: boolean }) => ({
  id: u.id, email: u.email, name: u.name, role: u.role, active: u.active,
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const admin = await requireUser("users:manage");
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role")) as Role;
    const password = String(formData.get("password") ?? "");
    const errors: string[] = [];
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Enter a valid email.");
    if (!name) errors.push("Name is required.");
    if (!ROLES.includes(role)) errors.push("Choose a role.");
    if (password.length < 12) errors.push("Password must be at least 12 characters.");
    if (errors.length) return { error: errors };
    if (await prisma.adminUser.findUnique({ where: { email } })) return { error: "That email already has an account." };

    const user = await prisma.adminUser.create({ data: { email, name, role, passwordHash: await bcrypt.hash(password, 12) } });
    await writeAudit({ userId: admin.id, action: "create", entity: "AdminUser", entityId: user.id, after: safe(user) });
    revalidatePath("/users");
    return { ok: `Created ${email}.` };
  });
}

export async function updateUser(formData: FormData) {
  const admin = await requireUser("users:manage");
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as Role;
  const active = formData.get("active") === "on";
  if (id === admin.id && (role !== "ADMIN" || !active)) {
    throw new Error("You can't remove your own admin access.");
  }
  if (!ROLES.includes(role)) throw new Error("Invalid role");
  const before = await prisma.adminUser.findUniqueOrThrow({ where: { id } });
  const after = await prisma.adminUser.update({ where: { id }, data: { role, active } });
  await writeAudit({ userId: admin.id, action: "update", entity: "AdminUser", entityId: id, before: safe(before), after: safe(after) });
  revalidatePath("/users");
}
