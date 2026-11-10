import { z } from "zod";
import { userProfileSchema } from "@supplement/engine";

/** What a browser may store in an account: the same shape as its local history. */
export const historyEntrySchema = z.object({
  id: z.string().min(1).max(40),
  savedAt: z.string().datetime(),
  profile: userProfileSchema,
  items: z
    .array(
      z.object({
        slug: z.string().max(60),
        name: z.string().max(120),
        status: z.enum(["recommended", "not_needed", "not_recommended", "blocked"]),
        dose: z.string().max(120).nullable(),
      }),
    )
    .max(40),
});
export type StoredEntry = z.infer<typeof historyEntrySchema>;

export const MAX_ACCOUNT_CHECKS = 50;
