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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Submit a <span className="text-accent">Module</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Share your mini-app with the TD community. Submissions are reviewed by
          maintainers before being listed publicly.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <SubmitForm categories={categories} />
      </div>
    </div>
  );
}
