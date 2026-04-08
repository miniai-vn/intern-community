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

export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be at most 1000 characters")
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, "Comment cannot be empty"),
  miniAppId: z.string().min(1, "Module ID is required"),
  parentId: z.string().optional(),
});

export const editCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be at most 1000 characters")
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, "Comment cannot be empty"),
});

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
