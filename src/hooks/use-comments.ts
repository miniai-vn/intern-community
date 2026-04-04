"use client";

import { useState, useCallback, useOptimistic, useTransition } from "react";
import type { CommentWithAuthor } from "@/types";

export function useComments(
  moduleId: string,
  initialComments: CommentWithAuthor[]
) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state for smoother UX
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    comments,
    (state, action: { type: "add" | "edit" | "delete"; payload: unknown }) => {
      switch (action.type) {
        case "add": {
          const newComment = action.payload as CommentWithAuthor;
          if (newComment.parentId) {
            // Add reply to parent
            return state.map((c) =>
              c.id === newComment.parentId
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c
            );
          }
          return [newComment, ...state];
        }
        case "edit": {
          const { id, content } = action.payload as {
            id: string;
            content: string;
          };
          return updateCommentInTree(state, id, (c) => ({
            ...c,
            content,
            updatedAt: new Date(),
          }));
        }
        case "delete": {
          const id = action.payload as string;
          return removeCommentFromTree(state, id);
        }
        default:
          return state;
      }
    }
  );

  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      setError(null);

      // Create optimistic comment
      const optimisticId = `temp-${Date.now()}`;
      const now = new Date();
      const optimisticComment: CommentWithAuthor = {
        id: optimisticId,
        content,
        moduleId,
        parentId: parentId ?? null,
        authorId: "current-user",
        author: { id: "current-user", name: "You", image: null },
        createdAt: now,
        updatedAt: now,
        replies: [],
      };

      startTransition(async () => {
        setOptimisticComments({ type: "add", payload: optimisticComment });

        try {
          const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, moduleId, parentId }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to add comment");
          }

          const newComment: CommentWithAuthor = await res.json();

          // Replace optimistic comment with real one
          setComments((prev) => {
            if (parentId) {
              return prev.map((c) =>
                c.id === parentId
                  ? {
                      ...c,
                      replies: [
                        ...(c.replies || []).filter(
                          (r: CommentWithAuthor) => r.id !== optimisticId
                        ),
                        newComment,
                      ],
                    }
                  : c
              );
            }
            return [
              newComment,
              ...prev.filter((c) => c.id !== optimisticId),
            ];
          });
        } catch (err) {
          // Remove optimistic comment on error
          setComments((prev) => removeCommentFromTree(prev, optimisticId));
          setError(err instanceof Error ? err.message : "Failed to add comment");
          throw err;
        }
      });
    },
    [moduleId, setOptimisticComments]
  );

  const editComment = useCallback(
    async (commentId: string, content: string) => {
      setError(null);
      const originalComments = comments;

      startTransition(async () => {
        setOptimisticComments({
          type: "edit",
          payload: { id: commentId, content },
        });

        try {
          const res = await fetch(`/api/comments/${commentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to edit comment");
          }

          const updatedComment: CommentWithAuthor = await res.json();

          setComments((prev) =>
            updateCommentInTree(prev, commentId, () => updatedComment)
          );
        } catch (err) {
          setComments(originalComments);
          setError(err instanceof Error ? err.message : "Failed to edit comment");
          throw err;
        }
      });
    },
    [comments, setOptimisticComments]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      setError(null);
      const originalComments = comments;

      startTransition(async () => {
        setOptimisticComments({ type: "delete", payload: commentId });

        try {
          const res = await fetch(`/api/comments/${commentId}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete comment");
          }

          setComments((prev) => removeCommentFromTree(prev, commentId));
        } catch (err) {
          setComments(originalComments);
          setError(
            err instanceof Error ? err.message : "Failed to delete comment"
          );
          throw err;
        }
      });
    },
    [comments, setOptimisticComments]
  );

  return {
    comments: optimisticComments,
    isLoading: isPending,
    error,
    addComment,
    editComment,
    deleteComment,
  };
}

// Helper: Update a comment anywhere in the tree
function updateCommentInTree(
  comments: CommentWithAuthor[],
  id: string,
  updater: (c: CommentWithAuthor) => CommentWithAuthor
): CommentWithAuthor[] {
  return comments.map((c) => {
    if (c.id === id) return updater(c);
    if (c.replies?.length) {
      return {
        ...c,
        replies: updateCommentInTree(c.replies, id, updater),
      };
    }
    return c;
  });
}

// Helper: Remove a comment from the tree
function removeCommentFromTree(
  comments: CommentWithAuthor[],
  id: string
): CommentWithAuthor[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentFromTree(c.replies, id) : [],
    }));
}
