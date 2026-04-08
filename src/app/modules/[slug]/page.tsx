import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { DemoPreviewFrame } from "@/components/demo-preview-frame";

type Props = { params: Promise<{ slug: string }> };

function getSafeHttpsDemoUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await db.miniApp.findUnique({ where: { slug } });
  return {
    title: module ? `${module.name} — Intern Community Hub` : "Not Found",
  };
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
  const safeDemoUrl = getSafeHttpsDemoUrl(module.demoUrl);

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
        <p className="text-sm text-gray-500">
          by {module.author.name} · {module.category.name}
        </p>
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
        {safeDemoUrl && (
          <a
            href={safeDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Live Demo
          </a>
        )}
      </div>

      {safeDemoUrl && (
        <DemoPreviewFrame demoUrl={safeDemoUrl} moduleName={module.name} />
      )}

      {module.demoUrl && !safeDemoUrl && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Preview is available only for secure HTTPS demo URLs.
        </div>
      )}
    </div>
  );
}
