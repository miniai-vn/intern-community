"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { notifyBell } from "@/components/notification-bell";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    isAdmin?: boolean;
    replies?: Comment[];
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

export function Comments({ moduleId }: { moduleId: string }) {
    const { data: session } = useSession();
    const [items, setItems] = useState<Comment[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function load(initial = false) {
        if (loading) return;
        setLoading(true);
        const url = new URL(`/api/modules/${moduleId}/comments`, window.location.origin);
        if (!initial && nextCursor) url.searchParams.set("cursor", nextCursor);
        const res = await fetch(url.toString());
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || "Failed to load comments.");
            setLoading(false);
            return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {

            if (initial) setItems(data);
            else setItems((prev) => [...prev, ...data]);
            setNextCursor(null);
        } else {

            if (initial) setItems(data.items);
            else setItems((prev) => [...prev, ...data.items]);
            setNextCursor(data.nextCursor);
        }
        setLoading(false);
    }

    useEffect(() => {
        load(true);

    }, [moduleId]);

    async function submit(e: React.FormEvent, parentId?: string) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const text = content.trim();
        if (text.length < 2) {
            setError("Comment must be at least 2 characters.");
            return;
        }
        const res = await fetch(`/api/modules/${moduleId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text, parentId }),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || "Failed to post comment.");
            notifyBell({ message: body.error || "Failed to post comment.", type: "error" });
            return;
        }
        const created: Comment = await res.json();
        if (parentId) {
            setItems((prev) =>
                prev.map((c) =>
                    c.id === parentId
                        ? { ...c, replies: [created, ...(c.replies ?? [])] }
                        : c
                )
            );
        } else {
            setItems((prev) => [created, ...prev]);
        }
        setContent("");
        setSuccess("Comment posted successfully");
        setTimeout(() => setSuccess(null), 2000);
        // Show toast under the bell without moving layout
        notifyBell({ message: "Comment posted successfully", type: "success" });
    }

    async function submitReply(parentId: string, text: string) {
        setError(null);
        const body = { content: text, parentId };
        const res = await fetch(`/api/modules/${moduleId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const b = await res.json().catch(() => ({}));
            setError(b.error || "Failed to reply.");
            notifyBell({ message: b.error || "Failed to reply.", type: "error" });
            return;
        }
        const created: Comment = await res.json();
        setItems((prev) =>
            prev.map((c) =>
                c.id === parentId ? { ...c, replies: [created, ...(c.replies ?? [])] } : c
            )
        );
        notifyBell({ message: "Reply sent successfully", type: "success" });
    }

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>

            {session ? (
                <form onSubmit={(e) => submit(e)} className="space-y-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a comment…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows={3}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={content.trim().length < 2}
                        >
                            Post
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-sm text-gray-500">Sign in to write a comment.</p>
            )}

            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-400">No comments yet.</p>
                ) : (
                    items.map((c) => (
                        <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="mb-1 flex items-center gap-2">
                                {c.author.image && (

                                    <img
                                        src={c.author.image}
                                        alt=""
                                        className="h-5 w-5 rounded-full"
                                        loading="lazy"
                                    />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                    {c.author.name ?? "User"} {c.isAdmin ? <em className="text-xs text-orange-600">(admin)</em> : null}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(c.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                            {session?.user?.isAdmin && (
                                <div className="mt-2 flex justify-end">
                                    <details>
                                        <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                                            Reply
                                        </summary>
                                        <div className="mt-2 ml-auto w-full max-w-xl">
                                            <AdminReplyForm onSubmit={(e, text) => {
                                                e.preventDefault();
                                                const t = text.trim();
                                                if (!t) return;
                                                submitReply(c.id, t);
                                            }} />
                                        </div>
                                    </details>
                                </div>
                            )}
                            {(c.replies ?? []).length > 0 && (
                                <div className="mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
                                    {(c.replies ?? []).map((r) => (
                                        <div key={r.id}>
                                            <div className="mb-0.5 flex items-center gap-2">
                                                {r.author?.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={r.author.image} alt="" className="h-4 w-4 rounded-full" loading="lazy" />
                                                )}
                                                <span className="text-xs font-medium text-gray-900">
                                                    {r.author?.name ?? "User"} {r.isAdmin ? <em className="text-[10px] text-orange-600">(admin)</em> : null}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(r.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {nextCursor && (
                <div className="flex justify-center">
                    <button
                        onClick={() => load(false)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                    >
                        {loading ? "Loading…" : "Load more"}
                    </button>
                </div>
            )}
        </div>
    );
}

function AdminReplyForm({ onSubmit }: { onSubmit: (e: React.FormEvent, text: string) => void }) {
    const [value, setValue] = useState("");
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const text = value.trim();
                if (!text) return;
                onSubmit(e, text);
                setValue("");
            }}
            className="mt-2 space-y-2"
        >
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Reply as admin…"
                className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                    disabled={value.trim().length < 1}
                >
                    Reply
                </button>
            </div>
        </form>
    );
}
