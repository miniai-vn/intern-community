import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Submit a Module</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Share your mini-app with the community. Submissions are reviewed by
          maintainers before being listed publicly.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
        <div className="p-6">
          <SubmitForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
