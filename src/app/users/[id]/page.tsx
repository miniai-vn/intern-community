import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: user
      ? `${user.name}'s Profile — Intern Community Hub`
      : "User Profile",
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  // Fetch user info
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  // Fetch user's submitted modules
  // If viewing own profile, show all submissions with status
  // If viewing others' profile, show only approved modules
  const isOwnProfile = session?.user?.id === id;
  const submittedModules = await db.miniApp.findMany({
    where: {
      authorId: id,
      ...(isOwnProfile ? {} : { status: "APPROVED" }),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: isOwnProfile ? { createdAt: "desc" } : { voteCount: "desc" },
  });

  // Fetch modules user has voted on
  const votedModules = await db.miniApp.findMany({
    where: {
      votes: {
        some: { userId: id },
      },
      status: "APPROVED",
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
  });

  // Get vote IDs for current user (for hasVoted logic)
  let currentUserVotedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: {
          in: [...submittedModules, ...votedModules].map((m) => m.id),
        },
      },
      select: { moduleId: true },
    });
    currentUserVotedIds = new Set(votes.map((v) => v.moduleId));
  }

  // Calculate stats
  const totalVotesReceived = submittedModules.reduce(
    (sum, mod) => sum + mod.voteCount,
    0,
  );
  const totalVotesGiven = votedModules.length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to modules
      </Link>

      {/* User Profile Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-600">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.isAdmin && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Admin
                </span>
              )}
            </div>

            <p className="text-gray-600">{user.email}</p>

            <div className="flex gap-6 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-900">
                  {submittedModules.length}
                </span>{" "}
                modules submitted
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {totalVotesReceived}
                </span>{" "}
                votes received
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {totalVotesGiven}
                </span>{" "}
                votes given
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Submitted Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isOwnProfile ? "My Submissions" : "Submitted Modules"} (
            {submittedModules.length})
          </h2>
          {isOwnProfile && (
            <Link
              href="/submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New Submission
            </Link>
          )}
        </div>

        {submittedModules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">
              {isOwnProfile
                ? "No submissions yet."
                : "No modules submitted yet."}
            </p>
            {isOwnProfile && (
              <Link
                href="/submit"
                className="mt-2 block text-sm text-blue-600 hover:underline"
              >
                Submit your first module →
              </Link>
            )}
          </div>
        ) : isOwnProfile ? (
          // List view for own submissions with status
          <div className="space-y-3">
            {submittedModules.map((module) => (
              <div
                key={module.id}
                className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/modules/${module.slug}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {module.name}
                    </Link>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        statusStyles[module.status]
                      }`}
                    >
                      {module.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{module.category.name}</span>
                    <span>{module.voteCount} votes</span>
                    <span>
                      {new Date(module.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid view for others' approved modules
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {submittedModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={currentUserVotedIds.has(module.id)}
                fromProfile={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Voted Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Voted Modules ({votedModules.length})
        </h2>

        {votedModules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">No modules voted yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {votedModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={currentUserVotedIds.has(module.id)}
                fromProfile={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
