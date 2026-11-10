"use client";

import { LOCALES, LOCALE_NAMES, type Locale } from "@supplement/engine";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, m } = useI18n();
  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">{m.site.language}</span>
      <select
        id="language"
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
        ))}
      </select>
    </label>
  );
}
