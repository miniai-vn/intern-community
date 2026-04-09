import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { IframePreview } from "@/components/iframe-preview";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const moduleRecord = await db.miniApp.findUnique({ where: { slug } });
  return { title: moduleRecord ? `${moduleRecord.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const moduleRecord = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!moduleRecord) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: moduleRecord.id },
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
          <h1 className="text-2xl font-bold text-gray-900">{moduleRecord.name}</h1>
          <VoteButton
            moduleId={moduleRecord.id}
            initialVoted={hasVoted}
            initialCount={moduleRecord.voteCount}
          />
        </div>
        <p className="text-sm text-gray-500">
          by {moduleRecord.author.name} · {moduleRecord.category.name}
        </p>
      </div>

      <p className="text-gray-700">{moduleRecord.description}</p>

      <div className="flex gap-3">
        <a
          href={moduleRecord.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View on GitHub
        </a>
        {moduleRecord.demoUrl && (
          <a
            href={moduleRecord.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Live Demo
          </a>
        )}
      </div>

      {/* Iframe Preview */}
      {moduleRecord.demoUrl && (
        <IframePreview 
          demoUrl={moduleRecord.demoUrl} 
          title={moduleRecord.name} 
        />
      )}
    </div>
  );
}
