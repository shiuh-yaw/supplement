import type { Locale } from "@supplement/engine";

/** First supported language in an Accept-Language header (ms, id/in, th, vi, en), else English. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  for (const part of (header ?? "").split(",")) {
    const code = part.split(";")[0]!.trim().toLowerCase().split("-")[0];
    if (code === "ms") return "ms";
    if (code === "id" || code === "in") return "id";
    if (code === "th") return "th";
    if (code === "vi") return "vi";
    if (code === "en") return "en";
  }
  return "en";
}
