"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { CommentWithAuthor } from "@/types";
import { CommentForm } from "./comment-form";

// Simple relative time formatter (no external dependency needed)
function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// Client-side time display to avoid hydration mismatch
function TimeAgo({ date }: { date: Date | string }) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  useEffect(() => {
    setTimeAgo(formatRelativeTime(date));
    const interval = setInterval(() => {
      setTimeAgo(formatRelativeTime(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  // Return empty on server, actual time on client
  return <>{timeAgo || "..."}</>;
}

interface CommentCardProps {
  comment: CommentWithAuthor;
  currentUserId?: string;
  isAdmin?: boolean;
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  currentUserId,
  isAdmin = false,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.authorId;
  const canModify = isOwner || isAdmin;

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    await onEdit(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle both Date objects and strings for comparison
  const createdTime = comment.createdAt instanceof Date 
    ? comment.createdAt.getTime() 
    : new Date(comment.createdAt).getTime();
  const updatedTime = comment.updatedAt instanceof Date 
    ? comment.updatedAt.getTime() 
    : new Date(comment.updatedAt).getTime();
  const wasEdited = updatedTime !== createdTime;

  // Format datetime attribute for <time> element
  const dateTimeStr = comment.createdAt instanceof Date 
    ? comment.createdAt.toISOString() 
    : String(comment.createdAt);

  return (
    <article
      className={`${isReply ? "ml-8 border-l-2 border-gray-100 pl-4 dark:border-gray-700" : ""}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {comment.author.image ? (
            <Image
              src={comment.author.image}
              alt={comment.author.name || "User avatar"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {comment.author.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {comment.author.name || "Anonymous"}
            </span>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <time className="text-gray-400 dark:text-gray-500" dateTime={dateTimeStr}>
              <TimeAgo date={comment.createdAt} />
            </time>
            {wasEdited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <form onSubmit={handleEdit} className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={1000}
                className="w-full resize-none rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="rounded-md px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="mt-2 flex items-center gap-3">
              {/* Reply button - only for root comments */}
              {!isReply && currentUserId && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Reply
                </button>
              )}

              {/* Edit/Delete - only for owner or admin */}
              {canModify && (
                <>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                moduleId={comment.moduleId}
                parentId={comment.id}
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                placeholder={`Reply to ${comment.author.name || "this comment"}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply: CommentWithAuthor) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}
    </article>
  );
}
