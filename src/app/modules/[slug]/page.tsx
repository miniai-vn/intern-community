import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const miniAppItem = await db.miniApp.findUnique({ where: { slug } });
  return { title: miniAppItem ? `${miniAppItem.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const miniAppItem = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!miniAppItem) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: miniAppItem.id },
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
          <h1 className="text-2xl font-bold text-gray-900">{miniAppItem.name}</h1>
          <VoteButton
            moduleId={miniAppItem.id}
            initialVoted={hasVoted}
            initialCount={miniAppItem.voteCount}
          />
        </div>
        <p className="text-sm text-gray-500">
          by {miniAppItem.author.name} · {miniAppItem.category.name}
        </p>
      </div>

      <p className="text-gray-700">{miniAppItem.description}</p>

      <div className="flex gap-3">
        <a
          href={miniAppItem.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View on GitHub
        </a>
        {miniAppItem.demoUrl && (
          <a
            href={miniAppItem.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Live Demo
          </a>
        )}
      </div>

      {/* TODO [hard-challenge]: Implement sandboxed iframe preview here */}
      {miniAppItem.demoUrl && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          Sandboxed preview coming soon. Contribute this feature! See{" "}
          <Link href="https://github.com" className="text-blue-600 hover:underline">
            ISSUES.md
          </Link>
        </div>
      )}
    </div>
  );
}