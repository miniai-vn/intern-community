"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowerCount,
  canFollow,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
  canFollow: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleFollow() {
    if (!canFollow) {
      signIn("github");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        isFollowing
          ? `/api/follows?userId=${targetUserId}`
          : "/api/follows",
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          ...(isFollowing ? {} : { body: JSON.stringify({ userId: targetUserId }) }),
        }
      );

      if (!response.ok) {
        window.alert("Could not update follow status.");
        return;
      }

      const data = await response.json();
      setIsFollowing(data.following);
      setFollowerCount(data.followerCount);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={isLoading}
        className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? "border border-stone-300 bg-white/90 text-stone-700 hover:bg-stone-100"
            : "bg-emerald-950 text-emerald-50 hover:bg-emerald-900"
        }`}
      >
        {isLoading ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
      </button>
      <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
        {followerCount} followers
      </span>
    </div>
  );
}
