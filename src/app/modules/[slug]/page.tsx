import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
// --- NEW IMPORTS ---
import { CommentForm } from "@/comments/comment-form";
import { CommentItem } from "@/comments/comment-item";

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
      // --- FETCH COMMENTS & REPLIES ---
      comments: {
        where: { parentId: null }, // Only root comments
        include: {
          author: true,
          replies: {
            include: { author: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
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
    <div className="mx-auto max-w-2xl space-y-8">

      <div className="space-y-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          ← Back to modules
        </Link>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.name}</h1>
            <VoteButton
              moduleId={module.id}
              initialVoted={hasVoted}
              initialCount={module.voteCount}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            by {module.author.name} · {module.category.name}
          </p>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{module.description}</p>


        <div className="flex gap-3">
          <a
            href={module.repoUrl}
            target="_blank"
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View on GitHub
          </a>
          {module.demoUrl && (
            <a
              href={module.demoUrl}
              target="_blank"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>


      <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Discussion ({module.comments.length})
        </h2>

        {session?.user ? (
          <div className="mb-8">
            <CommentForm miniAppId={module.id} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-8">Please sign in to join the discussion.</p>
        )}

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {module.comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.isAdmin}
            />
          ))}
        </div>
      </section>
    </div>
  );
}