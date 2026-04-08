"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";
import { EmojiPicker } from "@/components/emoji-picker";

// ── Types ────────────────────────────────────────────────────────────────────

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface CommentData {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  replies: CommentData[];
  // Optimistic state flags (client-only)
  _optimistic?: boolean;
  _error?: boolean;
}

interface CommentSectionProps {
  miniAppId: string;
}

// ── Main Component ───────────────────────────────────────────────────────────

export function CommentSection({ miniAppId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments on mount
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?miniAppId=${miniAppId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchComments();
  }, [miniAppId]);

  // Helper function to update a comment deep in the tree (Recursive)
  const updateCommentRecursive = (
    list: CommentData[],
    targetId: string,
    updater: (c: CommentData) => CommentData
  ): CommentData[] => {
    return list.map((c) => {
      if (c.id === targetId) return updater(c);
      if (c.replies.length > 0) {
        return { ...c, replies: updateCommentRecursive(c.replies, targetId, updater) };
      }
      return c;
    });
  };

  // ── Add comment (optimistic) ────────────────────────────────────────────

  const addComment = useCallback(
    async (text: string, parentId?: string) => {
      if (!session?.user) return;

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticComment: CommentData = {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: session.user.id,
        author: {
          id: session.user.id,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
        },
        parentId: parentId || null,
        replies: [],
        _optimistic: true,
      };

      // Optimistic insert (Recursive)
      setComments((prev) => {
        if (!parentId) return [optimisticComment, ...prev];
        return updateCommentRecursive(prev, parentId, (c) => ({
          ...c,
          replies: [...c.replies, optimisticComment],
        }));
      });

      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, miniAppId, parentId }),
        });

        if (!res.ok) throw new Error("Failed to post comment");

        const realComment = await res.json();

        // Replace optimistic comment with real one (Recursive)
        setComments((prev) =>
          updateCommentRecursive(prev, tempId, () => ({ ...realComment, _optimistic: false }))
        );
      } catch {
        // Mark as error (Recursive)
        setComments((prev) =>
          updateCommentRecursive(prev, tempId, (c) => ({ ...c, _error: true, _optimistic: true }))
        );
      }
    },
    [session, miniAppId]
  );

  // ── Edit comment ────────────────────────────────────────────────────────

  const editComment = useCallback(async (commentId: string, newText: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });

    if (!res.ok) throw new Error("Failed to edit");

    const updated = await res.json();

    setComments((prev) =>
      updateCommentRecursive(prev, commentId, (c) => ({
        ...c,
        text: updated.text,
        updatedAt: updated.updatedAt,
      }))
    );
  }, []);

  // ── Delete comment ──────────────────────────────────────────────────────

  const deleteComment = useCallback(async (commentId: string, parentId?: string | null) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");

    const deleteRecursive = (list: CommentData[]): CommentData[] => {
      return list
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: deleteRecursive(c.replies),
        }));
    };

    setComments((prev) => deleteRecursive(prev));
  }, []);

  // ── Remove errored optimistic ───────────────────────────────────────────

  const dismissError = useCallback((tempId: string) => {
    const deleteRecursive = (list: CommentData[]): CommentData[] => {
      return list
        .filter((c) => c.id !== tempId)
        .map((c) => ({
          ...c,
          replies: deleteRecursive(c.replies),
        }));
    };
    setComments((prev) => deleteRecursive(prev));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <section id="comments" className="comment-section">
      <h2 className="comment-section-title">
        💬 Discussion
        <span className="comment-count">{comments.length}</span>
      </h2>

      {session ? (
        <CommentForm onSubmit={(text) => addComment(text)} />
      ) : (
        <p className="comment-signin-hint">Sign in to join the discussion.</p>
      )}

      {isLoading ? (
        <div className="comment-skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="comment-skeleton" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="comment-empty">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.isAdmin ?? false}
              onReply={addComment}
              onEdit={editComment}
              onDelete={deleteComment}
              onDismissError={dismissError}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Comment Form ──────────────────────────────────────────────────────────────

function CommentForm({
  onSubmit,
  onCancel,
  initialText = "",
  placeholder = "Write a comment…",
  submitLabel = "Post",
}: {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  initialText?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleEmojiSelect(emoji: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setText((prev) => prev + emoji);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    // Restore cursor position after emoji insert
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000) return;
    onSubmit(trimmed);
    setText("");
  }

  const charCount = text.length;
  const isOverLimit = charCount > 1000;

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="comment-form-input-wrap">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          maxLength={1010}
          rows={3}
          className="comment-textarea"
        />
        <div className="comment-form-toolbar">
          <div className="comment-form-left">
            <EmojiPicker onSelect={handleEmojiSelect} />
            <span className={`comment-char-count ${isOverLimit ? "over-limit" : ""}`}>
              {charCount}/1000
            </span>
          </div>
          <div className="comment-form-actions">
            {onCancel && (
              <button type="button" onClick={onCancel} className="comment-btn-cancel">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!text.trim() || isOverLimit}
              className="comment-btn-submit"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Single Comment Item ───────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  onDismissError,
  isReply = false,
}: {
  comment: CommentData;
  currentUserId?: string;
  isAdmin: boolean;
  onReply: (text: string, parentId: string) => void;
  onEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string, parentId?: string | null) => Promise<void>;
  onDismissError: (id: string) => void;
  isReply?: boolean;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwn = currentUserId === comment.authorId;
  const canDelete = isOwn || isAdmin;
  const isOptimistic = comment._optimistic;
  const hasError = comment._error;

  async function handleEdit(newText: string) {
    await onEdit(comment.id, newText);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id, comment.parentId);
    } catch {
      setIsDeleting(false);
    }
  }

  // Errored optimistic comment
  if (hasError) {
    return (
      <div className="comment-item comment-error">
        <p className="comment-error-text">⚠ Failed to post comment</p>
        <button
          onClick={() => onDismissError(comment.id)}
          className="comment-error-dismiss"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div
      className={`comment-item ${isReply ? "comment-reply" : ""} ${isOptimistic ? "comment-optimistic" : ""} ${isDeleting ? "comment-deleting" : ""}`}
    >
      <div className="comment-header">
        <div className="comment-author-info">
          {comment.author.image ? (
            <img
              src={comment.author.image}
              alt={comment.author.name || "User"}
              className="comment-avatar"
            />
          ) : (
            <div className="comment-avatar-placeholder">
              {(comment.author.name || "?")[0].toUpperCase()}
            </div>
          )}
          <span className="comment-author-name">{comment.author.name || "Anonymous"}</span>
          <span className="comment-time">
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>
          {comment.createdAt !== comment.updatedAt && (
            <span className="comment-edited">(edited)</span>
          )}
          {isOptimistic && (
            <span className="comment-uploading-badge">Posting…</span>
          )}
        </div>
      </div>

      {isEditing ? (
        <CommentForm
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          initialText={comment.text}
          placeholder="Edit your comment…"
          submitLabel="Save"
        />
      ) : (
        <p className="comment-text">{comment.text}</p>
      )}

      {!isOptimistic && !isEditing && (
        <div className="comment-actions">
          {currentUserId && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="comment-action-btn"
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              onClick={() => setIsEditing(true)}
              className="comment-action-btn"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="comment-action-btn comment-action-delete"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {isReplying && (
        <div className="comment-reply-form-wrap">
          <CommentForm
            onSubmit={(text) => {
              onReply(text, comment.id);
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
            placeholder={`Reply to ${comment.author.name || "Anonymous"}…`}
            submitLabel="Reply"
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onDismissError={onDismissError}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
