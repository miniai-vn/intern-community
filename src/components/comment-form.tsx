"use client";

import { useState, useRef } from "react";

// Common emoji categories for quick access
const EMOJI_CATEGORIES = {
  "😊 Smileys": ["😊", "😂", "🤣", "😍", "🥰", "😘", "😎", "🤔", "😢", "😭", "😤", "🤯"],
  "👍 Gestures": ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "💪", "🙏", "👋", "🤙", "✨"],
  "❤️ Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕", "💖", "💗", "💝"],
  "🎉 Objects": ["🎉", "🎊", "🔥", "⭐", "🌟", "💯", "✅", "❌", "⚡", "💡", "🚀", "🏆"],
};

interface CommentFormProps {
  moduleId: string;
  parentId?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  moduleId,
  parentId,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 1000;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim(), parentId);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      if (newContent.length <= maxLength) {
        setContent(newContent);
        // Set cursor position after emoji
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
          textarea.focus();
        }, 0);
      }
    } else {
      if (content.length + emoji.length <= maxLength) {
        setContent(content + emoji);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 pr-20 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          rows={3}
          aria-label="Comment content"
        />
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-10 bottom-2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          aria-label="Add emoji"
        >
          😊
        </button>
        <span
          className={`absolute bottom-2 right-2 text-xs ${
            remainingChars < 100 ? "text-orange-500" : "text-gray-400"
          }`}
        >
          {remainingChars}
        </span>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-2">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {category}
              </p>
              <div className="flex flex-wrap gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="rounded p-1.5 text-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(false)}
            className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          {isSubmitting ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
      </div>
    </form>
  );
}
