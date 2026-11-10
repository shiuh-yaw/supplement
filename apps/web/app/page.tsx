import Link from "next/link";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
  const m = MESSAGES[await getLocale()].home;
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {m.title} <span className="text-brand-600">{m.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 sm:text-lg">{m.lede}</p>
        <Link href="/check" className="btn-primary mt-8 px-8 py-3 text-base">
          {m.cta}
        </Link>
        <p className="mt-3 text-xs text-slate-500">{m.sub}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {m.points.map((p) => (
          <div key={p.title} className="card">
            <h2 className="font-semibold text-brand-700">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
