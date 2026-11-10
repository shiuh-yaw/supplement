import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { APP_NAME } from "@/lib/site";
import { I18nProvider } from "@/lib/i18n/context";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const viewport: Viewport = { themeColor: "#0f8a68" };

export async function generateMetadata(): Promise<Metadata> {
  const m = MESSAGES[await getLocale()];
  return { title: `${APP_NAME} — ${m.site.tagline}`, description: m.site.metaDescription };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const m = MESSAGES[locale];
  return (
    <html lang={locale}>
      <body className="min-h-screen font-sans antialiased">
        <I18nProvider initialLocale={locale}>
          <header className="border-b border-slate-200 bg-white print:hidden">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-brand-700">{APP_NAME}</span>
                <span className="hidden text-xs text-slate-500 sm:inline">{m.site.tagline}</span>
              </Link>
              <nav className="flex flex-wrap items-center justify-end gap-2">
                <LanguageSwitcher />
                <Link href="/history" className="btn-ghost px-3">
                  {m.site.myChecks}
                </Link>
                <Link href="/check" className="btn-primary">
                  {m.site.startCheck}
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 print:p-0">{children}</main>
          <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 print:hidden">
            <p className="mx-auto max-w-2xl px-4">{m.site.footer}</p>
            <p className="mt-2">
              <Link href="/how-it-works" className="underline">{m.site.howItWorks}</Link>
            </p>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
