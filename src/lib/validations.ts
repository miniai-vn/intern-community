import { z } from "zod";

export const submitModuleSchema = z.object({
  name: z
    .string()
    .min(3, "Tên cần ít nhất 3 ký tự")
    .max(60, "Tên tối đa 60 ký tự"),
  description: z
    .string()
    .min(20, "Mô tả cần ít nhất 20 ký tự")
    .max(500, "Mô tả tối đa 500 ký tự"),
  categoryId: z.string().cuid("Vui lòng chọn một danh mục hợp lệ"),
  repoUrl: z
    .url("Phải là một URL hợp lệ")
    .refine(
      (url) => url.startsWith("https://github.com/"),
      "Phải là URL kho GitHub (https://github.com/...)"
    ),
  demoUrl: z
    .url("Phải là một URL hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().max(500).optional(),
});

export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
