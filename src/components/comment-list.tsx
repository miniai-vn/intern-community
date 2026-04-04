"use client";

import { useSession } from "next-auth/react";
import type { CommentWithAuthor } from "@/types";
import { CommentForm } from "./comment-form";
import { CommentCard } from "./comment-card";
import { useComments } from "@/hooks/use-comments";

interface CommentListProps {
  moduleId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentList({ moduleId, initialComments }: CommentListProps) {
  const { data: session } = useSession();
  const {
    comments,
    isLoading,
    error,
    addComment,
    editComment,
    deleteComment,
  } = useComments(moduleId, initialComments);

  const handleAddComment = async (content: string, parentId?: string) => {
    await addComment(content, parentId);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await editComment(commentId, content);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Discussion ({comments.length})
        </h2>
      </div>

      {/* New comment form */}
      {session?.user ? (
        <CommentForm
          moduleId={moduleId}
          onSubmit={handleAddComment}
          placeholder="Share your thoughts on this module..."
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
          <a
            href="/api/auth/signin"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign in
          </a>{" "}
          to join the discussion
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!isLoading && comments.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.isAdmin}
              onReply={handleAddComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
