import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { APP_NAME, TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description:
    "Find out which protein, creatine and supplements suit your goals and health — brand-neutral, safety-first, for Southeast Asia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-slate-200 bg-white print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-700">{APP_NAME}</span>
              <span className="hidden text-xs text-slate-500 sm:inline">{TAGLINE}</span>
            </Link>
            <Link href="/check" className="btn-primary">
              Start check
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 print:p-0">{children}</main>
        <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 print:hidden">
          <p className="mx-auto max-w-2xl px-4">
            General education only — not medical advice. Always check with your doctor, dietitian or pharmacist.
            We don&apos;t sell supplements, and product rankings are never based on commission.
          </p>
        </footer>
      </body>
    </html>
  );
}
