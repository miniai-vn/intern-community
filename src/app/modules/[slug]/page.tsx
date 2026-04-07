import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { CommentSection } from "@/components/comment-section";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await db.miniApp.findUnique({ where: { slug } });
  return { title: module ? `${module.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const module = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to modules
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {module.author.image && (
            <img
              src={module.author.image}
              alt={module.author.name || "Author"}
              className="h-5 w-5 rounded-full object-cover"
            />
          )}
          <span>by {module.author.name} · {module.category.name}</span>
        </div>
      </div>

      <p className="text-gray-700">{module.description}</p>

      <div className="flex gap-3">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View on GitHub
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Live Demo
          </a>
        )}
      </div>

      {module.demoUrl && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          Sandboxed preview coming soon. Contribute this feature! See{" "}
          <Link href="https://github.com" className="text-blue-600 hover:underline">
            ISSUES.md
          </Link>
        </div>
      )}

      {/* Comment / Discussion Section */}
      <CommentSection miniAppId={module.id} />
    </div>
  );
}
