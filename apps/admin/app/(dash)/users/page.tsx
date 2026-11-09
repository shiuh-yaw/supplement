import { prisma } from "@supplement/db";
import { requireUser } from "@/lib/auth";
import { CreateUserForm } from "@/components/CreateUserForm";
import { updateUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireUser("users:manage");
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="card overflow-x-auto p-0 sm:p-0">
        <table className="table-base">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td colSpan={3}>
                  <form action={updateUser} className="flex items-center gap-3">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="input w-auto py-1">
                      <option>ADMIN</option><option>REVIEWER</option><option>EDITOR</option>
                    </select>
                    <input type="checkbox" name="active" defaultChecked={u.active} className="accent-brand-600" />
                    <button className="btn-ghost px-3 py-1">Update</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateUserForm />
    </div>
  );
}
