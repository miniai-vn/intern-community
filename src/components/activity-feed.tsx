"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

interface Activity {
  type: "comment" | "vote" | "submission";
  id: string;
  user: { id: string; name: string | null; image: string | null };
  moduleSlug: string;
  moduleName: string;
  preview: string | null;
  createdAt: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  comment: "💬",
  vote: "⬆️",
  submission: "🚀",
};

const ACTIVITY_VERBS: Record<string, string> = {
  comment: "commented on",
  vote: "upvoted",
  submission: "published",
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="activity-feed">
        <h3 className="activity-feed-title">⚡ Recent Activity</h3>
        <div className="activity-skeleton-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="activity-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <h3 className="activity-feed-title">⚡ Recent Activity</h3>
        <p className="activity-empty">No recent activity yet.</p>
      </div>
    );
  }

  return (
    <aside className="activity-feed">
      <h3 className="activity-feed-title">⚡ Recent Activity</h3>
      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={`${activity.type}-${activity.id}`} className="activity-item">
            <div className="activity-icon">{ACTIVITY_ICONS[activity.type]}</div>
            <div className="activity-content">
              <div className="activity-header">
                {activity.user.image ? (
                  <img
                    src={activity.user.image}
                    alt={activity.user.name || "User"}
                    className="activity-avatar"
                  />
                ) : (
                  <div className="activity-avatar-placeholder">
                    {(activity.user.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <span className="activity-user">{activity.user.name || "Someone"}</span>
              </div>
              <p className="activity-description">
                {ACTIVITY_VERBS[activity.type]}{" "}
                <Link
                  href={`/modules/${activity.moduleSlug}`}
                  className="activity-module-link"
                >
                  {activity.moduleName}
                </Link>
              </p>
              {activity.preview && (
                <p className="activity-preview">&ldquo;{activity.preview}&rdquo;</p>
              )}
              <span className="activity-time">
                {formatRelativeTime(new Date(activity.createdAt))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
