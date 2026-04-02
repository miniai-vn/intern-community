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
      "Must be a GitHub repository URL",
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

export const periodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Invalid period format, expected YYYY-MM")
  .refine(
    (val) => {
      const [yearStr, monthStr] = val.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      return (
        !isNaN(year) &&
        !isNaN(month) &&
        month >= 1 &&
        month <= 12 &&
        year >= 2000 &&
        year <= new Date().getUTCFullYear()
      );
    },
    { message: "Month must be between 01-12 and year valid" },
  );
export const limitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? Number(val) : 10))
  .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
    message: `Limit must be a number between 1 and ${100}`,
  });

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
