import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLocale()].history.title };
}

export default function HistoryPage() {
  return <HistoryView />;
}
