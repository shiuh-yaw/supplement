"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LABELS, type LabelSet, type Locale } from "@supplement/engine";
import { LOCALE_TAGS, MESSAGES, type Messages } from "./messages";

interface I18n {
  locale: Locale;
  /** BCP 47 tag for Intl formatting. */
  tag: string;
  m: Messages;
  labels: LabelSet;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);
export const LANG_COOKIE = "lang";

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    setLocaleState(next);
    router.refresh(); // re-render server parts (header, home page) in the new language
  }

  return (
    <I18nContext.Provider value={{ locale, tag: LOCALE_TAGS[locale], m: MESSAGES[locale], labels: LABELS[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
