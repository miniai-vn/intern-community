import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";
import { z } from "zod";  
export const submitSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  
  description: z
    .string()
    .min(10, "Description must be more detailed (at least 10 characters)")
    .max(500, "Description is too long (maximum 500 characters)")
    .refine((val) => !suspiciousLinkRegex.test(val), {
      message: "Description contains suspicious or blocked links",
    }),
  
  demoUrl: z
    .string()
    .url("Invalid demo URL format")
    .optional()
    .or(z.literal("")), // Allows empty string if not provided

  categoryId: z
    .string()
    .min(1, "Please select a category"),
});
const suspiciousLinkRegex = /(bit\.ly|tinyurl\.com|free-money|malware-site)\./i;
export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit a Module</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your mini-app with the TD community. Submissions are reviewed by
          maintainers before being listed publicly.
        </p>
      </div>
      <SubmitForm categories={categories} />
    </div>
  );
}
