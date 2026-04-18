import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

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
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      {/* BACK BUTTON */}
      <Link
        href="/"
        className="group inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-white"
      >
        <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
        Back to modules
      </Link>

      {/* HEADER SECTION */}
      <div className="relative rounded-2xl border border-gray-800 bg-gray-900/40 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              {module.name}
            </h1>
            <div className="flex items-center gap-3">
              {module.author.image && (
                <img src={module.author.image} alt="" className="h-6 w-6 rounded-full border border-gray-700" />
              )}
              <p className="text-sm text-gray-400">
                by <span className="font-semibold text-gray-200">{module.author.name}</span>
                <span className="mx-2 text-gray-700">•</span>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 ring-1 ring-inset ring-blue-500/20">
                  {module.category.name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0">
            <VoteButton
              moduleId={module.id}
              initialVoted={hasVoted}
              initialCount={module.voteCount}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800/50 pt-6">
          <p className="leading-relaxed text-gray-300">
            {module.description}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={module.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:border-gray-600"
          >
            View on GitHub
          </a>
          {module.demoUrl && (
            <a
              href={module.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
            >
              Live Demo →
            </a>
          )}
        </div>
      </div>

      {/* SANDBOX PREVIEW SECTION */}
      {module.demoUrl && (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/50 p-1">
          {/* Decorative frame top */}
          <div className="flex items-center gap-1.5 border-b border-gray-800/50 bg-gray-900/50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="ml-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sandboxed-Environment.exe</span>
          </div>

          {/* Placeholder for iframe */}
          <div className="flex h-[400px] flex-col items-center justify-center space-y-4 bg-gray-950/80 text-center transition-all group-hover:bg-gray-950/40">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 ring-1 ring-gray-800">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>

            <div className="max-w-xs space-y-2 px-6">
              <p className="text-sm font-semibold text-gray-200 uppercase tracking-tight">Interactive Preview Coming Soon</p>
              <p className="text-xs leading-relaxed text-gray-500">
                We are working on a secure sandboxed environment to let you try modules directly in the browser.
              </p>
            </div>

            <Link
              href="https://github.com"
              className="mt-2 inline-flex items-center rounded-lg bg-gray-800 px-4 py-2 text-xs font-bold text-blue-400 transition-colors hover:bg-gray-700"
            >
              Contribute this feature
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
