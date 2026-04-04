import { db } from "@/lib/db";
import { SocialActivityFeed, type ActivityItem } from "./social-activity-feed";

// Fetch recent social activities (comments, votes, submissions)
async function getRecentActivities(): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];

  // Get recent comments (last 5)
  const recentComments = await db.comment.findMany({
    where: {
      module: { status: "APPROVED" },
    },
    include: {
      author: { select: { name: true, image: true } },
      module: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const comment of recentComments) {
    activities.push({
      id: `comment-${comment.id}`,
      type: "comment",
      user: comment.author,
      module: comment.module,
      content: comment.content.length > 100 
        ? comment.content.slice(0, 100) + "..." 
        : comment.content,
      createdAt: comment.createdAt.toISOString(),
    });
  }

  // Get recent votes (last 5)
  const recentVotes = await db.vote.findMany({
    where: {
      module: { status: "APPROVED" },
    },
    include: {
      user: { select: { name: true, image: true } },
      module: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const vote of recentVotes) {
    activities.push({
      id: `vote-${vote.id}`,
      type: "vote",
      user: vote.user,
      module: vote.module,
      createdAt: vote.createdAt.toISOString(),
    });
  }

  // Get recent approved submissions (last 3)
  const recentSubmissions = await db.miniApp.findMany({
    where: { status: "APPROVED" },
    include: {
      author: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  for (const submission of recentSubmissions) {
    activities.push({
      id: `submission-${submission.id}`,
      type: "submission",
      user: submission.author,
      module: { name: submission.name, slug: submission.slug },
      createdAt: submission.createdAt.toISOString(),
    });
  }

  // Sort all activities by time, most recent first
  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Return top 8 activities
  return activities.slice(0, 8);
}

export async function SocialCard() {
  const activities = await getRecentActivities();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <span>🌐</span> Social Activity
        </h2>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          Live
        </span>
      </div>

      <SocialActivityFeed activities={activities} />
    </div>
  );
}
