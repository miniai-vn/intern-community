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
  categoryId: z.preprocess(
    (value) => {
      if (typeof value === "string") return value.trim();
      return "";
    },
    z
      .string()
      .min(1, "Please select categories")
  ),
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
}).superRefine((data, ctx) => {
  if (data.status === "REJECTED" && !data.feedback?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["feedback"],
      message: "Feedback is required when rejecting a module",
    });
  }
});

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
