import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export default async function RejectedSubmissionDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { slug } = await params;

  const module = await db.miniApp.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!module || module.authorId !== session.user.id) {
    notFound();
  }

  if (module.status !== "REJECTED") {
    redirect(`/modules/${module.slug}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-2 sm:px-8">
      <Link
        href="/my-submissions"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:text-violet-200"
      >
        <ArrowLeftIcon />
        Back
      </Link>

      <section className="rounded-3xl border border-indigo-300/15 bg-slate-900/70 p-6 shadow-[0_18px_50px_rgba(11,14,30,0.45)] backdrop-blur-xl sm:p-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-300/20 bg-indigo-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100">
              {module.category.name}
            </span>
            <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-200">
              Rejected
            </span>
          </div>

          <h1 className="wrap-anywhere text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            {module.name}
          </h1>

          <p className="text-sm text-slate-400">
            Submitted on {new Date(module.createdAt).toLocaleDateString()}
          </p>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
              Module description
            </h2>
            <p className="whitespace-pre-wrap break-all rounded-xl border border-indigo-300/15 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
              {module.description}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
              Feedback from admin
            </h2>
            <p className="whitespace-pre-wrap break-all rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              {module.feedback?.trim()
                ? module.feedback
                : "No feedback was provided by the reviewer."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19L5 12L12 5" />
    </svg>
  );
}
