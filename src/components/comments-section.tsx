"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import type { ModuleComment } from "@/types";

interface CommentsSectionProps {
  moduleId: string;
  canComment: boolean;
  initialComments: ModuleComment[];
}

export function CommentsSection({
  moduleId,
  canComment,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const totalReplies = useMemo(
    () => comments.reduce((count, item) => count + (item.replies?.length ?? 0), 0),
    [comments]
  );

  async function submitComment({
    body,
    parentId,
  }: {
    body: string;
    parentId?: string;
  }) {
    const res = await fetch(`/api/modules/${moduleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.fieldErrors?.body?.[0] ?? "Unable to post comment.");
    }

    const comment: ModuleComment = await res.json();

    if (parentId) {
      setComments((current) =>
        current.map((item) =>
          item.id === parentId
            ? { ...item, replies: [...(item.replies ?? []), comment] }
            : item
        )
      );
      return;
    }

    setComments((current) => [comment, ...current]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!body.trim()) {
      setError("Please enter a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitComment({ body });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-stone-950">Comments</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
            {comments.length} threads
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {totalReplies} replies
          </span>
        </div>
        <p className="text-sm text-stone-500">
          Share feedback, ideas, or implementation notes for this module.
        </p>
      </div>

      {canComment ? (
        <form
          onSubmit={handleSubmit}
          className={`glass-panel space-y-3 rounded-[1.5rem] p-4 transition-opacity ${
            isSubmitting ? "opacity-85" : ""
          }`}
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Leave a constructive comment..."
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          />
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-xs ${body.length >= 450 ? "text-amber-700" : "text-stone-400"}`}
            >
              {body.length} / 500
            </p>
            <div className="flex items-center gap-3">
              {isSubmitting && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-700" />
                  Posting
                </span>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-emerald-50 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        </form>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 px-4 py-5 text-sm text-stone-500">
          Sign in with GitHub to join the discussion.
        </div>
      )}

      {comments.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-500">
          No comments yet. Start the discussion.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canReply={canComment}
              onReply={submitComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  canReply,
  onReply,
}: {
  comment: ModuleComment;
  canReply: boolean;
  onReply: (input: { body: string; parentId?: string }) => Promise<void>;
}) {
  const [replyBody, setReplyBody] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReplyError("");

    if (!replyBody.trim()) {
      setReplyError("Please enter a reply.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply({ body: replyBody, parentId: comment.id });
      setReplyBody("");
      setIsReplying(false);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Unable to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  }

  return (
    <article className="glass-panel rounded-[1.5rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/profile/${comment.author.id}`}
            className="text-sm font-semibold text-stone-900 hover:text-emerald-900"
          >
            {comment.author.name ?? "Community member"}
          </Link>
          <p className="text-xs text-stone-400">
            {formatRelativeTime(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{comment.body}</p>

      {canReply && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsReplying((open) => !open)}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 hover:text-emerald-950"
          >
            {isReplying ? "Cancel reply" : "Reply"}
          </button>
        </div>
      )}

      {isReplying && (
        <form
          onSubmit={handleReply}
          className={`mt-4 space-y-3 rounded-2xl border border-stone-200 bg-white/80 p-4 transition-opacity ${
            isSubmittingReply ? "opacity-85" : ""
          }`}
        >
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Write a reply..."
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          />
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-xs ${replyBody.length >= 450 ? "text-amber-700" : "text-stone-400"}`}
            >
              {replyBody.length} / 500
            </p>
            <div className="flex items-center gap-3">
              {isSubmittingReply && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-stone-700" />
                  Replying
                </span>
              )}
              <button
                type="submit"
                disabled={isSubmittingReply}
                className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingReply ? "Replying..." : "Post reply"}
              </button>
            </div>
          </div>
          {replyError && <p className="text-sm font-medium text-red-700">{replyError}</p>}
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-stone-200 pl-4 sm:pl-6">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="rounded-2xl border border-stone-200 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/profile/${reply.author.id}`}
                    className="text-sm font-semibold text-stone-900 hover:text-emerald-900"
                  >
                    {reply.author.name ?? "Community member"}
                  </Link>
                  <p className="text-xs text-stone-400">
                    {formatRelativeTime(new Date(reply.createdAt))}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600">{reply.body}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
