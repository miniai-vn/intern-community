import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { CommentsSection } from "@/components/comments-section";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await db.miniApp.findUnique({ where: { slug } });
  return { title: module ? `${module.name} - Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const module = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!module) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: module.id },
      },
    });
    hasVoted = !!vote;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">
        ← Back to modules
      </Link>

      <section className="section-shell rounded-[2rem] px-6 py-7 sm:px-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
                  {module.category.name}
                </span>
                <span className="text-xs text-stone-400">
                  Published {new Date(module.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
                {module.name}
              </h1>
              <p className="text-sm text-stone-500">
                by{" "}
                <Link
                  href={`/profile/${module.author.id}`}
                  className="font-medium text-stone-700 hover:text-emerald-900"
                >
                  {module.author.name ?? "Community member"}
                </Link>{" "}
                · {module.voteCount} vote
                {module.voteCount === 1 ? "" : "s"}
              </p>
            </div>
            <VoteButton
              moduleId={module.id}
              initialVoted={hasVoted}
              initialCount={module.voteCount}
            />
          </div>

          <p className="whitespace-pre-wrap text-base leading-7 text-stone-700">
            {module.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={module.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              View on GitHub
            </a>
            {module.demoUrl && (
              <a
                href={module.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-emerald-950 px-4 py-2.5 text-sm font-medium text-emerald-50 hover:bg-emerald-900"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </section>

      {module.demoUrl && (
        <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
          Sandboxed preview coming soon. Contribute this feature! See{" "}
          <Link href="https://github.com" className="text-emerald-700 hover:underline">
            ISSUES.md
          </Link>
        </div>
      )}

      <CommentsSection
        moduleId={module.id}
        canComment={Boolean(session?.user)}
        initialComments={module.comments}
      />
    </div>
  );
}
