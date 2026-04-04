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
export const commentSchema = z.object({
  content: z.string()
  .min(10, "Content must be at least 10 characters")
  .max(1000),
  appId: z.string().cuid(),
});
export const EditCommentSchema = z.object({
  content: z.string()
  .min(10, "Content must be at least 10 characters")
  .max(1000),
  
});
export const QuickUpdateUserSchema = z.object({
  isAdmin: z.union([z.string(), z.number(), z.boolean()])
  .optional()
  .transform((val)=>{
    if ( val === undefined) return undefined;
    if ( val === "1" || val === 1 || val === true || val === "true"){ {
      return true;
    }
  }//chat dd
    return false;
  }),
  isLocked: z.union([z.string(), z.number(), z.boolean()])
  .optional()
  .transform((val)=>{
    if ( val === undefined) return undefined;
    if ( val === "1" || val === 1 || val === true || val === "true"){ {
      return true;
    }
  }
    return false;
  }),
});
export const CreateCatagorySchema = z.object({
  name: z.string()
  .min(1, "The category name must not be blank.")
  .max(20, "Exceeded the allowed number of characters"),
  
});
export type createCatagoryInput = z.infer<typeof CreateCatagorySchema>
export type QuickUpdateUserInput = z.infer<typeof QuickUpdateUserSchema>; 
export type CommentInput = z.infer<typeof commentSchema>;
export type EditCommentInput = z.infer<typeof EditCommentSchema>;
export type SubmitModuleInput = z.infer<typeof submitModuleSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
