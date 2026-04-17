import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
          Submit a Module
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Share your mini-app with the community. Submissions are reviewed before going live.
        </p>
      </div>
      <SubmitForm categories={categories} />
    </div>
  );
}