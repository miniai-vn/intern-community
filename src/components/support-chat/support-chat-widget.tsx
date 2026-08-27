"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FAQ_ITEMS } from "./faq";
import { loadThreads, saveThreads } from "./storage";
import type { ChatMessage, ChatThread } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function defaultThread(): ChatThread {
  const createdAt = nowIso();
  return {
    id: makeId("t"),
    title: "Hỗ trợ",
    createdAt,
    messages: [
      {
        id: makeId("m"),
        from: "bot",
        text: "Chào bạn. Bạn cần hỗ trợ gì? Bạn có thể hỏi tự nhiên hoặc chọn câu hỏi gợi ý.",
        createdAt,
      },
    ],
  };
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
        style={{ animationDelay: "140ms" }}
      />
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
        style={{ animationDelay: "280ms" }}
      />
    </div>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className={className}
    >
      <path d="M7.5 2.75H3.75A1 1 0 0 0 2.75 3.75V7.5" strokeLinecap="round" />
      <path d="M12.5 2.75h3.75a1 1 0 0 1 1 1V7.5" strokeLinecap="round" />
      <path d="M7.5 17.25H3.75a1 1 0 0 1-1-1V12.5" strokeLinecap="round" />
      <path d="M12.5 17.25h3.75a1 1 0 0 0 1-1V12.5" strokeLinecap="round" />
    </svg>
  );
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ threads, activeThreadId }, setChatState] = useState<{
    threads: ChatThread[];
    activeThreadId: string;
  }>(() => {
    const loaded = loadThreads();
    if (loaded.length > 0) {
      return { threads: loaded, activeThreadId: loaded[0]!.id };
    }
    const t = defaultThread();
    return { threads: [t], activeThreadId: t.id };
  });
  const [draft, setDraft] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [threads, activeThreadId, isBotTyping, isOpen, isExpanded]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  const quickFaq = useMemo(() => FAQ_ITEMS.slice(0, 6), []);

  const updateActiveThread = (updater: (t: ChatThread) => ChatThread) => {
    setChatState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => (t.id === prev.activeThreadId ? updater(t) : t)),
    }));
  };

  const appendMessage = (msg: ChatMessage) => {
    updateActiveThread((t) => ({ ...t, messages: [...t.messages, msg] }));
  };

  const appendUserAndBot = (userText: string, botText: string) => {
    const now = nowIso();
    appendMessage({
      id: makeId("m"),
      from: "user",
      text: userText,
      createdAt: now,
    });
    appendMessage({
      id: makeId("m"),
      from: "bot",
      text: botText,
      createdAt: nowIso(),
    });
  };

  const handleSuggestionClick = (question: string) => {
    // Ẩn gợi ý sau khi chọn
    if (showSuggestions) setShowSuggestions(false);
    const item = FAQ_ITEMS.find((f) => f.question === question);
    const answer =
      item?.answer ??
      "Đây là câu hỏi gợi ý, nhưng mình chưa tìm thấy câu trả lời phù hợp trong FAQ.";
    appendUserAndBot(question, answer);
  };

  const sendUser = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Người dùng bắt đầu một hành động -> ẩn toàn bộ gợi ý ngay.
    if (showSuggestions) setShowSuggestions(false);

    // Nếu bot đang trả lời thì không gửi thêm tin nhắn (chặn spam),
    // nhưng vẫn đảm bảo gợi ý đã ẩn.
    if (isBotTyping) return;

    appendMessage({
      id: makeId("m"),
      from: "user",
      text: trimmed,
      createdAt: nowIso(),
    });

    setIsBotTyping(true);

    try {
      const active = threads.find((t) => t.id === activeThreadId);
      const optimisticHistory: ChatMessage[] = [
        ...(active?.messages ?? []),
        { id: "optimistic-user", from: "user", text: trimmed, createdAt: nowIso() },
      ];
      const payload = {
        threadId: active?.id ?? "default",
        messages: optimisticHistory.map((m) => ({
          role: m.from === "user" ? "user" : "model",
          content: m.text,
        })),
      };

      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const errText =
          data?.error ??
          "Hiện chatbot không phản hồi được. Bạn thử lại sau hoặc hỏi maintainer nhé.";
        appendMessage({
          id: makeId("m"),
          from: "bot",
          text: errText,
          createdAt: nowIso(),
        });
      } else {
        const data = (await res.json()) as { reply: string };
        appendMessage({
          id: makeId("m"),
          from: "bot",
          text: data.reply,
          createdAt: nowIso(),
        });
      }
    } catch {
      appendMessage({
        id: makeId("m"),
        from: "bot",
        text:
          "Có lỗi mạng khi gọi API hỗ trợ. Bạn kiểm tra kết nối hoặc thử lại sau một lúc nhé.",
        createdAt: nowIso(),
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const createThread = () => {
    const t = defaultThread();
    t.title = `Hỗ trợ #${threads.length + 1}`;
    setChatState((prev) => ({
      threads: [t, ...prev.threads],
      activeThreadId: t.id,
    }));
    setShowSuggestions(true);
  };

  const closeAll = () => {
    setIsExpanded(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating entry button */}
      <div className="fixed bottom-12 right-12 z-40 flex items-start gap-3">
        <div
          className={clsx(
            "hidden self-start rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow-sm animate-bounce motion-reduce:animate-none sm:block",
            isOpen && "opacity-0 pointer-events-none",
          )}
        >
          Bạn cần hỗ trợ gì không?
        </div>

        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open support chat"
            className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-white text-white shadow-2xl ring-4 ring-blue-500/80 transition-transform hover:scale-105"
          >
            {/* Thay ảnh này bằng hình người đã xoá nền của bạn */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logochatbot.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        )}
      </div>

      {/* Collapsed panel */}
      {isOpen && !isExpanded && (
        <div
          className="fixed bottom-8 right-8 z-50 w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          role="dialog"
          aria-modal="false"
          aria-label="Support chat"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logochatbot.png" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Support</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  FAQ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Expand support chat"
              >
                <ExpandIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeAll}
                className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex h-[520px] max-h-[70vh] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
              {(activeThread?.messages ?? []).map((m) => (
                <div
                  key={m.id}
                  className={clsx("flex", m.from === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={clsx(
                      "max-w-[82%] rounded-lg px-3 py-2",
                      m.from === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex justify-start">
                  <TypingDots />
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            <div className="border-t px-4 py-3">
              {showSuggestions && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {quickFaq.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSuggestionClick(item.question);
                        setDraft("");
                      }}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              )}

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendUser(draft);
                  setDraft("");
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isBotTyping}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {isOpen && isExpanded && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close support chat"
            onClick={closeAll}
          />

          <div className="absolute left-1/2 top-1/2 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Support</p>
                <p className="text-xs text-gray-500">
                  Danh sách cuộc hội thoại &amp; lịch sử
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={createThread}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Cuộc hội thoại mới
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Thu nhỏ
                </button>
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-lg px-2 py-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid h-[min(82vh,720px)] min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
              {/* Threads list */}
              <div className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
                <div className="px-4 py-3 text-xs font-medium text-gray-500">
                  Cuộc hội thoại
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {threads.map((t) => {
                    const last = t.messages[t.messages.length - 1];
                    const isActive = t.id === activeThreadId;
                    return (
                      <div
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setChatState((prev) => ({ ...prev, activeThreadId: t.id }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setChatState((prev) => ({ ...prev, activeThreadId: t.id }));
                          }
                        }}
                        className={clsx(
                          "flex w-full cursor-pointer items-start justify-between gap-2 rounded-xl px-3 py-2 text-left hover:bg-gray-50",
                          isActive && "bg-blue-50",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-gray-900">
                              {t.title}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {last?.text ?? ""}
                          </p>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            aria-label="Delete conversation"
                            className="rounded-full p-1 text-xs text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatState((prev) => {
                                const remaining = prev.threads.filter(
                                  (th) => th.id !== t.id,
                                );
                                if (remaining.length === 0) {
                                  const nt = defaultThread();
                                  return { threads: [nt], activeThreadId: nt.id };
                                }
                                const nextActive =
                                  prev.activeThreadId === t.id
                                    ? remaining[0]!.id
                                    : prev.activeThreadId;
                                return { threads: remaining, activeThreadId: nextActive };
                              });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat */}
              <div className="flex min-h-0 flex-col">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
                  {(activeThread?.messages ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={clsx(
                        "flex",
                        m.from === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={clsx(
                          "max-w-[78%] rounded-xl px-4 py-3",
                          m.from === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900",
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {isBotTyping && (
                    <div className="flex justify-start">
                      <TypingDots />
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>

                <div className="shrink-0 border-t px-5 py-4">
                  {showSuggestions && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {FAQ_ITEMS.slice(0, 10).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            handleSuggestionClick(item.question);
                            setDraft("");
                          }}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          {item.question}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendUser(draft);
                      setDraft("");
                    }}
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Nhập câu hỏi..."
                      className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || isBotTyping}
                      className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Gửi
                    </button>
                  </form>

                  <p className="mt-2 text-xs text-gray-400">
                    Tip: Nhấn <span className="font-medium">Esc</span> để đóng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

