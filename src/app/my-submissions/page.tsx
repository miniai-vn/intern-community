import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MySubmissionsList } from "@/components/my-submissions-list";

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="section-shell rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-50">
              Dashboard
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                My Submissions
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-stone-600">
                Track review status, revisit maintainer feedback, and keep your portfolio
                of community modules organized in one place.
              </p>
            </div>
          </div>
          <Link
            href="/submit"
            className="inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/15 hover:bg-emerald-900"
          >
            + New Submission
          </Link>
        </div>
      </section>

      <MySubmissionsList initialSubmissions={submissions} />
    </div>
  );
}
