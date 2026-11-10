import "server-only";
import { cookies, headers } from "next/headers";
import { isLocale, type Locale } from "@supplement/engine";
import { localeFromAcceptLanguage } from "./detect";

/** The visitor's language: their saved choice, else their browser language, else English. */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get("lang")?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}
