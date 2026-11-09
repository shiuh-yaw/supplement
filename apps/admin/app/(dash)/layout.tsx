import Link from "next/link";
import { requireUser, can } from "@/lib/auth";
import { logout } from "../login/actions";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/rules", label: "Rules & safety" },
  { href: "/products", label: "Products" },
  { href: "/supplements", label: "Supplements" },
  { href: "/simulator", label: "Simulator" },
  { href: "/audit", label: "Audit log" },
];

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = can(user.role, "users:manage") ? [...NAV, { href: "/users", label: "Users" }] : NAV;

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-56 md:border-r md:border-b-0">
        <div className="p-4 text-lg font-bold text-brand-700">Sukat <span className="font-normal text-slate-500">Backoffice</span></div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm whitespace-nowrap text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden p-4 text-xs text-slate-500 md:block">
          <p className="font-medium text-slate-700">{user.name}</p>
          <p>{user.email}</p>
          <p className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5">{user.role}</p>
          <form action={logout} className="mt-3">
            <button className="text-brand-700 underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
