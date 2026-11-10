import type { Metadata } from "next";
import Link from "next/link";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const m = MESSAGES[await getLocale()].how;
  return { title: m.title, description: m.lede };
}

export default async function HowItWorksPage() {
  const all = MESSAGES[await getLocale()];
  const m = all.how;
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{m.title}</h1>
        <p className="text-slate-600">{m.lede}</p>
        <nav aria-label={m.title} className="flex flex-wrap gap-2 pt-2 text-sm">
          {m.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              {s.title}
            </a>
          ))}
        </nav>
      </header>
      {m.sections.map((s) => (
        <section key={s.id} id={s.id} className="card scroll-mt-20 space-y-3">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          {s.body.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-slate-700">{p}</p>
          ))}
        </section>
      ))}
      <p>
        <Link href="/check" className="btn-primary">{all.home.cta}</Link>
      </p>
    </article>
  );
}
