import type { Metadata } from "next";
import { Questionnaire } from "@/components/Questionnaire";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLocale()].results.title };
}

export default function CheckPage() {
  return <Questionnaire />;
}
