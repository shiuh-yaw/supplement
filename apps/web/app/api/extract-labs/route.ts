import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ACCEPTED_TYPES, ExtractionError, MAX_BYTES, extractLabs, isEnabled, type AcceptedType } from "@/lib/lab-extract";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Countries where upload is switched off. Sending a lab report to an AI provider abroad is a cross-border
 * transfer of health data; Vietnam's data law (Decree 356) needs a transfer assessment first, so VN is off
 * unless LAB_UPLOAD_OFF_COUNTRIES says otherwise (e.g. "" to allow everywhere, "VN,TH" to add Thailand).
 */
const offCountries = () =>
  (process.env.LAB_UPLOAD_OFF_COUNTRIES ?? "VN").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);

/** Whether report upload is available (an API key is configured), and where it's switched off. */
export function GET() {
  return NextResponse.json({ enabled: isEnabled(), offCountries: offCountries() });
}

// Simple per-IP limit so one visitor can't run up the AI bill: 6 uploads per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 6;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  if (!isEnabled()) return NextResponse.json({ error: "Report upload isn't available.", code: "disabled" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many uploads. Please wait a few minutes and try again.", code: "rateLimited" }, { status: 429 });
  }

  let file: File | null = null;
  let consent = false;
  let country = "";
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
    consent = form.get("consent") === "yes";
    country = String(form.get("country") ?? "").toUpperCase();
  } catch {
    /* handled below */
  }
  // Explicit consent is required before a health document is sent to the AI provider.
  if (!consent) return NextResponse.json({ error: "Please agree before uploading.", code: "noConsent" }, { status: 400 });
  if (offCountries().includes(country)) {
    return NextResponse.json({ error: "Report upload isn't available in your country yet.", code: "disabled" }, { status: 403 });
  }
  if (!file) return NextResponse.json({ error: "Please choose a file.", code: "noFile" }, { status: 400 });
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "Please upload a PDF, JPG or PNG.", code: "badType" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is over 10 MB.", code: "tooBig" }, { status: 413 });

  try {
    // Read into memory only; the file is never written to disk or stored.
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await extractLabs(bytes, file.type as AcceptedType);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ExtractionError) return NextResponse.json({ error: e.message, code: e.code }, { status: 422 });
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "We're busy right now. Please try again in a minute.", code: "busy" }, { status: 503 });
    }
    if (e instanceof Anthropic.APIError) {
      console.error("[extract-labs] API error", e.status, e.message);
      return NextResponse.json({ error: "We couldn't read the report right now. Please enter the numbers by hand.", code: "failed" }, { status: 502 });
    }
    console.error("[extract-labs]", e);
    return NextResponse.json({ error: "Something went wrong. Please enter the numbers by hand.", code: "failed" }, { status: 500 });
  }
}
