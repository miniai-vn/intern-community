import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { ModulePreview } from "@/components/module-preview";
import { ModuleDescription } from "@/components/module-description";
import { SmartBackButton } from "@/components/smart-back-button";

type Props = { params: Promise<{ slug: string }> };

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
  const isAdmin = Boolean(session?.user?.isAdmin);
  const userId = session?.user?.id;

  const moduleWhere = isAdmin
    ? { slug }
    : userId
      ? {
          slug,
          OR: [
            { status: "APPROVED" as const, isLocked: false },
            { authorId: userId },
          ],
        }
      : { slug, status: "APPROVED" as const, isLocked: false };

  const module = await db.miniApp.findFirst({
    where: moduleWhere,
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
    <div className="mx-auto w-full max-w-360 space-y-8 px-2 sm:px-8">
      <SmartBackButton
        fallbackHref="/"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:text-violet-200"
      >
        <ArrowLeftIcon />
        Back
      </SmartBackButton>
      <section className="relative overflow-hidden rounded-3xl border border-indigo-300/15 bg-slate-900/70 p-6 shadow-[0_18px_50px_rgba(11,14,30,0.45)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative space-y-5">
          <div className="flex flex-col">
            <div className="flex justify-between w-full items-start gap-4">
              <span className=" rounded-full border border-indigo-300/20 bg-indigo-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100">
                {module.category.name}
              </span>
              <VoteButton
                moduleId={module.id}
                initialVoted={hasVoted}
                initialCount={module.voteCount}
              />
            </div>
            <div className="min-w-0 space-y-3">
              <h1 className="wrap-anywhere text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
                {module.name}
              </h1>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                {module.author.image ? (
                  <img
                    src={module.author.image}
                    alt={module.author.name || "Module author"}
                    className="h-8 w-8 rounded-full border border-indigo-300/25 object-cover"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-300/25 bg-slate-800 text-xs font-semibold text-slate-100">
                    {(module.author.name || "A").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span>by {module.author.name || "Anonymous"}</span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span>{new Date(module.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <ModuleDescription text={module.description} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <article className="rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-6 shadow-[0_14px_35px_rgba(11,14,30,0.35)]">
            {module.demoUrl ? (
              <ModulePreview demoUrl={module.demoUrl} />
            ) : (
              <div className="rounded-xl border border-dashed border-indigo-300/20 bg-slate-950/70 p-8 text-center text-sm text-slate-500">
                No demo available
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <article className="rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-5 shadow-[0_14px_35px_rgba(11,14,30,0.35)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
              Module Links
            </h3>

            <div className="mt-4 space-y-3">
              <a
                href={module.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300/20 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
              >
                <GithubIcon />
                View on GitHub
              </a>

              {module.demoUrl && (
                <a
                  href={module.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <LaunchIcon />
                  Live Demo
                </a>
              )}
            </div>
          </article>
        </aside>
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

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0.3C5.4 0.3 0 5.7 0 12.4C0 17.7 3.4 22.3 8.2 23.9C8.8 24 9 23.7 9 23.4V21.2C5.7 22 5 19.8 5 19.8C4.5 18.4 3.7 18 3.7 18C2.6 17.3 3.8 17.3 3.8 17.3C5 17.4 5.7 18.6 5.7 18.6C6.8 20.5 8.5 20 9.2 19.7C9.3 18.9 9.6 18.4 9.9 18.1C7.2 17.8 4.4 16.7 4.4 12.1C4.4 10.8 4.9 9.8 5.6 8.9C5.5 8.6 5 7.4 5.7 5.8C5.7 5.8 6.7 5.5 9 7C10 6.8 11 6.6 12 6.6C13 6.6 14 6.8 15 7C17.3 5.5 18.3 5.8 18.3 5.8C19 7.4 18.5 8.6 18.4 8.9C19.1 9.8 19.6 10.8 19.6 12.1C19.6 16.7 16.8 17.8 14.1 18.1C14.5 18.5 14.8 19.1 14.8 20V23.4C14.8 23.7 15 24 15.6 23.9C20.4 22.3 23.8 17.7 23.8 12.4C23.8 5.7 18.5 0.3 12 0.3Z" />
    </svg>
  );
}

function LaunchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14 5H19V10" />
      <path d="M10 14L19 5" />
      <path d="M19 14V19H5V5H10" />
    </svg>
  );
}
