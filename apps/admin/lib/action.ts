export type ActionState = { error?: string | string[]; ok?: string };

/** Wraps a server action body so thrown permission/validation errors are shown in the form. */
export async function guard(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? {};
  } catch (e) {
    // Let Next.js redirects/notFound propagate.
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) throw e;
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
