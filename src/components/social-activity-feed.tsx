"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "comment" | "vote" | "submission";
  user: {
    name: string | null;
    image: string | null;
  };
  module: {
    name: string;
    slug: string;
  };
  content?: string; // For comments
  createdAt: string; // ISO string for serialization
}

interface SocialActivityFeedProps {
  activities: ActivityItem[];
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// Client-side time display to avoid hydration mismatch
function TimeAgo({ dateStr }: { dateStr: string }) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    setTimeAgo(formatTimeAgo(dateStr));
    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(dateStr));
    }, 60000);
    return () => clearInterval(interval);
  }, [dateStr]);

  // Show nothing on server, time on client
  if (!timeAgo) return <span className="text-xs text-gray-400 dark:text-gray-500">...</span>;

  return <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo}</span>;
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  switch (type) {
    case "comment":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          💬
        </span>
      );
    case "vote":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          👍
        </span>
      );
    case "submission":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          🚀
        </span>
      );
  }
}

function ActivityDescription({ activity }: { activity: ActivityItem }) {
  const userName = activity.user.name || "Someone";

  switch (activity.type) {
    case "comment":
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{userName}</span> commented on{" "}
          <Link
            href={`/modules/${activity.module.slug}`}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {activity.module.name}
          </Link>
          {activity.content && (
            <span className="mt-1 block text-gray-500 line-clamp-2 dark:text-gray-400">
              "{activity.content}"
            </span>
          )}
        </p>
      );
    case "vote":
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{userName}</span> upvoted{" "}
          <Link
            href={`/modules/${activity.module.slug}`}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {activity.module.name}
          </Link>
        </p>
      );
    case "submission":
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{userName}</span> submitted{" "}
          <Link
            href={`/modules/${activity.module.slug}`}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {activity.module.name}
          </Link>
        </p>
      );
  }
}

export function SocialActivityFeed({ activities }: SocialActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Be the first to comment or vote on a module!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          {/* User Avatar or Activity Icon */}
          <div className="shrink-0">
            {activity.user.image ? (
              <Image
                src={activity.user.image}
                alt={activity.user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <ActivityIcon type={activity.type} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <ActivityDescription activity={activity} />
            <TimeAgo dateStr={activity.createdAt} />
          </div>
        </div>
      ))}
    </div>
  );
}

export type { ActivityItem };
