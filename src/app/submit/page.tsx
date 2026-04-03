import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="section-shell rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
              Submission flow
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Submit a module the community will actually use.
            </h1>
            <p className="text-base leading-7 text-stone-600">
              Share the problem your mini-app solves, link the repo, and include a demo
              if you have one. Maintainers review every submission before it appears
              publicly.
            </p>
            <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 p-4 text-sm text-stone-600">
              Strong submissions are specific, easy to understand, and clearly scoped.
            </div>
          </div>

          <div className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
            <SubmitForm categories={categories} />
          </div>
        </div>
      </section>
    </div>
  );
}
