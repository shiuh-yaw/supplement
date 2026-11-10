import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountView } from "@/components/AccountView";
import { accountsEnabled, CONSENT_VERSION } from "@/lib/account/config";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: MESSAGES[await getLocale()].account.title, robots: { index: false } };
}

export default function AccountPage() {
  if (!accountsEnabled()) notFound();
  return <AccountView consentVersion={CONSENT_VERSION} />;
}
