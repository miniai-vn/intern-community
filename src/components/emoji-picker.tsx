"use client";

import { useState, useRef, useEffect } from "react";
import EmojiPickerReact, { Theme, EmojiStyle } from "emoji-picker-react";
import { useTheme } from "@/components/theme-provider";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="emoji-picker-container" ref={pickerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="emoji-trigger-btn"
        aria-label="Open emoji picker"
        title="Insert emoji"
      >
        😊
      </button>

      {isOpen && (
        <div 
          className="emoji-picker-dropdown-wrapper" 
          style={{ 
            position: "absolute", 
            bottom: "calc(100% + 8px)", 
            left: 0, 
            zIndex: 50,
            boxShadow: "var(--shadow-lg)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            animation: "emoji-slide-up 0.15s ease-out"
          }}
        >
          <EmojiPickerReact
            onEmojiClick={(emojiData) => {
              onSelect(emojiData.emoji);
              setIsOpen(false);
            }}
            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
            emojiStyle={EmojiStyle.APPLE}
            lazyLoadEmojis={true}
            searchDisabled={false}
            skinTonesDisabled={true}
          />
        </div>
      )}
    </div>
  );
}
