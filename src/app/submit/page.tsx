import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit a Module</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your mini-app with the TD community. Submissions are reviewed by
          maintainers before being listed publicly.
        </p>
      </div>
      <SubmitForm categories={categories} />
    </div>
  );
}
