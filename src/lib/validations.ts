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
  reviewerNote: z.string().max(1000).optional(),
});

export const batchReviewSchema = z.object({
  ids: z.array(z.string().cuid()),
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().max(500).optional(),
  reviewerNote: z.string().max(1000).optional(),
});

// Vote schema — moduleId must be a valid CUID to prevent enumeration attacks.
// This is validated on both client (type guard) and server (Zod) per our double-validation pattern.
export const voteSchema = z.object({
  moduleId: z.string().cuid("Invalid module ID"),
});

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type BatchReviewInput = z.infer<typeof batchReviewSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
