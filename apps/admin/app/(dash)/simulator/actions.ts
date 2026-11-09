"use server";

import { loadKnowledgeBase } from "@supplement/db";
import { recommend, userProfileSchema, type RecommendationResult } from "@supplement/engine";
import { requireUser } from "@/lib/auth";

export type SimState = { error?: string[]; result?: RecommendationResult; problems?: string[] };

export async function simulate(_prev: SimState, formData: FormData): Promise<SimState> {
  await requireUser();
  let input: unknown;
  try {
    input = JSON.parse(String(formData.get("profile") ?? ""));
  } catch {
    return { error: ["Profile is not valid JSON."] };
  }
  const parsed = userProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };

  const { kb, problems } = await loadKnowledgeBase({ includeUnpublishedRules: formData.get("drafts") === "on" });
  return { result: recommend(parsed.data, kb), problems };
}
