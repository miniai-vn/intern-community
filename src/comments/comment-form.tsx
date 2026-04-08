"use client";

import { useRef, useState } from "react";
import { postComment } from "@/lib/comments"; 
import { Smile, Send, Loader2, X } from "lucide-react";


const EMOJI_CATEGORIES = {
  smileys: ["😀", "😂", "🤣", "😊", "😍", "😎", "🤔", "😴", "🥳", "😭"],
  gestures: ["👍", "👎", "👏", "🙌", "👊", "🤝", "🙏", "✌️", "👋", "💪"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️"],
  objects: ["💻", "🚀", "💡", "🔥", "✨", "🎉", "💯", "📱", "🛠️", "📚"]
};

export function CommentForm({ miniAppId, parentId, onSuccess, placeholder = "Join the discussion..." }: any) {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiInsert = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + emoji + content.substring(end);
    
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setIsPending(true);
    const result = await postComment({ content, miniAppId, parentId });
    setIsPending(false);

    if (result.success) {
      setContent("");
      setShowEmoji(false);
      onSuccess?.();
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all"
      />
      
      <div className="flex items-center justify-between">
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className={`transition-colors ${showEmoji ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
          >
            <Smile size={20} />
          </button>
          
          {showEmoji && (
            <div className="absolute bottom-10 left-0 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Category Header */}
              <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat as any)}
                    className={`flex-1 py-2 text-[10px] uppercase font-bold transition-all ${activeCategory === cat ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"}`}
                  >
                    {cat}
                  </button>
                ))}
                <button onClick={() => setShowEmoji(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={14}/></button>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-5 gap-1 p-2 max-h-40 overflow-y-auto">
                {EMOJI_CATEGORIES[activeCategory].map(e => (
                  <button 
                    key={e} 
                    type="button" 
                    onClick={() => handleEmojiInsert(e)} 
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded text-xl transition-transform active:scale-125"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Character Counter (Requirement: Updates on insert) */}
          <span className={`text-[10px] font-mono ${content.length > 900 ? "text-red-500" : "text-gray-400"}`}>
            {content.length}/1000
          </span>
          <button 
            type="submit"
            disabled={!content.trim() || isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Post
          </button>
        </div>
      </div>
    </form>
  );
}