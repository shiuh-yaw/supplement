import { NextResponse } from "next/server";
import { isLocale, recommend, userProfileSchema } from "@supplement/engine";
import { loadKnowledgeBase, prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = userProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your answers.", issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 422 },
    );
  }

  const lang = new URL(request.url).searchParams.get("lang");
  const locale = isLocale(lang) ? lang : "en";
  const { kb, problems } = await loadKnowledgeBase({ locale });
  if (problems.length) console.warn("[knowledge-base]", problems);

  const result = recommend(parsed.data, kb, { locale });

  // Anonymous usage stats only — never the profile, health data or labs.
  prisma.recommendationEvent
    .create({
      data: {
        country: parsed.data.country,
        goal: parsed.data.goal,
        recommended: result.items.filter((i) => i.status === "recommended").map((i) => i.supplement.slug),
        blocked: result.items.filter((i) => i.status === "blocked").map((i) => i.supplement.slug),
      },
    })
    .catch((e: unknown) => console.error("[recommendation-event]", e));

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
