import { z } from "zod";

const suspiciousLinkRegex = /(bit\.ly|tinyurl\.com|free-money|malware-site)\./i;
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

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long (max 1000 characters)")
    .refine((val) => !suspiciousLinkRegex.test(val), {
      message: "Links are not allowed in comments for security reasons",
    }),
  miniAppId: z.string().cuid(),
  parentId: z.string().cuid().optional(), 
});

export const adminReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().max(500).optional(),
});

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type CommentInput = z.infer<typeof commentSchema>;