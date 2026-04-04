import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { CommentList } from "@/components/comment-list";
import { RepoLinks } from "@/components/repo-links";

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

  // Fetch comments with replies
  const comments = await db.comment.findMany({
    where: {
      moduleId: module.id,
      parentId: null,
    },
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
  });

  // Format date for display
  const createdDate = new Date(module.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back Navigation */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to modules
      </Link>

      {/* Module Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.name}</h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {module.category.name}
              </span>
            </div>

            {/* Author Info */}
            <div className="mt-3 flex items-center gap-3">
              {module.author.image ? (
                <Image
                  src={module.author.image}
                  alt={module.author.name || "Author"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {module.author.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {module.author.name || "Anonymous"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted on {createdDate}</p>
              </div>
            </div>
          </div>

          {/* Vote Section */}
          <div className="flex flex-col items-center">
            <VoteButton
              moduleId={module.id}
              initialVoted={hasVoted}
              initialCount={module.voteCount}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            About this module
          </h2>
          <p className="text-gray-700 leading-relaxed dark:text-gray-300">{module.description}</p>
        </div>

        {/* Stats Row */}
        <div className="mt-6 flex gap-6 border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">👍</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{module.voteCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upvotes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{comments.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{createdDate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="mt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Resources
        </h2>
        <RepoLinks repoUrl={module.repoUrl} demoUrl={module.demoUrl} />
      </div>

      {/* Comments Section */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CommentList moduleId={module.id} initialComments={comments} />
      </div>
    </div>
  );
}
