import { z } from "zod";

export const submitModuleSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be at most 60 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters"),
  categoryId: z.string().cuid("Please select a valid category"),
  repoUrl: z
    .url("Must be a valid URL")
    .refine(
      (url) => url.startsWith("https://github.com/"),
      "Must be a GitHub repository URL"
    ),
  demoUrl: z
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().max(500).optional(),
});

/**
 * RFC 6902 JSON Patch schema for admin review.
 *
 * Allowed operations:
 *   { "op": "replace", "path": "/status",   "value": "APPROVED" | "REJECTED" }
 *   { "op": "replace", "path": "/feedback", "value": "<string max 500>" }
 *   { "op": "remove",  "path": "/feedback" }
 *
 * Example request body:
 * [
 *   { "op": "replace", "path": "/status",   "value": "REJECTED" },
 *   { "op": "replace", "path": "/feedback", "value": "Please add a demo link." }
 * ]
 */
const adminPatchOpSchema = z.union([
  z.object({
    op: z.literal("replace"),
    path: z.literal("/status"),
    value: z.enum(["APPROVED", "REJECTED"]),
  }),
  z.object({
    op: z.literal("replace"),
    path: z.literal("/feedback"),
    value: z.string().max(500),
  }),
  z.object({
    op: z.literal("remove"),
    path: z.literal("/feedback"),
  }),
]);

export const adminPatchSchema = z
  .array(adminPatchOpSchema)
  .min(1, "At least one patch operation is required");

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type AdminPatchInput = z.infer<typeof adminPatchSchema>;
