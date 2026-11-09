import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma, type AdminUser } from "@supplement/db";
import { SESSION_COOKIE, verifySession, type Role } from "./session-token";

export type Permission =
  | "catalog:write"
  | "rules:draft"
  | "rules:publish"
  | "users:manage";

const PERMISSIONS: Record<Role, Permission[]> = {
  EDITOR: ["catalog:write", "rules:draft"],
  REVIEWER: ["catalog:write", "rules:draft", "rules:publish"],
  ADMIN: ["catalog:write", "rules:draft", "rules:publish", "users:manage"],
};

export const can = (role: Role, permission: Permission) => PERMISSIONS[role].includes(permission);

/** Current user from the DB (so deactivated users and role changes apply immediately). */
export async function currentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  return user?.active ? user : null;
}

export async function requireUser(permission?: Permission): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (permission && !can(user.role, permission)) {
    throw new Error("You don't have permission to do that.");
  }
  return user;
}
