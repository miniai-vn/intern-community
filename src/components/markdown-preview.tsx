"use client";

import { useState } from "react";

/**
 * ===== MARKDOWN PREVIEW COMPONENT =====
 * Công cụ preview Markdown in real-time
 * - Đầu vào: Markdown text
 * - Xử lý: Parse markdown + syntax highlighting
 * - Đầu ra: Live preview HTML
 */

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(
    `# Markdown Preview Demo

## Features
- **Bold text** with double asterisks
- *Italic text* with single asterisks
- ~~Strikethrough~~ with double tilde

## Code Block
\`\`\`javascript
const hello = () => {
  console.log("Hello, World!");
};
\`\`\`

## Links & Images
[Visit OpenAI](https://openai.com)

## Lists
1. First item
2. Second item
3. Third item

> This is a blockquote
> with multiple lines

---

Enjoy markdown editing! ✨`
  );

  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const parseMarkdown = (text: string): string => {
    let html = text;

    // Escape HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // H1-H6
    html = html.replace(/^### (.*?)$/gm, "<h3 className='text-lg font-bold mt-3 mb-2'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 className='text-xl font-bold mt-4 mb-2'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 className='text-2xl font-bold mt-4 mb-2'>$1</h1>");

    // **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong className='font-bold'>$1</strong>");

    // *italic*
    html = html.replace(/\*(.*?)\*/g, "<em className='italic'>$1</em>");

    // ~~strikethrough~~
    html = html.replace(/~~(.*?)~~/g, "<del className='line-through'>$1</del>");

    // Code blocks
    html = html.replace(
      /```(.*?)\n([\s\S]*?)```/g,
      "<pre className='bg-slate-800 p-4 rounded-lg overflow-x-auto my-3'><code className='text-sm text-slate-100 font-mono'>$2</code></pre>"
    );

    // Inline code
    html = html.replace(
      /`(.*?)`/g,
      "<code className='bg-slate-700 px-2 py-1 rounded text-sm'>$1</code>"
    );

    // Links
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      "<a href='$2' target='_blank' rel='noopener noreferrer' className='text-purple-400 hover:text-purple-300 underline'>$1</a>"
    );

    // Blockquote
    html = html.replace(
      /^&gt; (.*?)$/gm,
      "<blockquote className='border-l-4 border-purple-500 pl-4 italic text-slate-300 my-2'>$1</blockquote>"
    );

    // Horizontal rule
    html = html.replace(/^---$/gm, "<hr className='my-4 border-slate-700' />");

    // Lists - numbered
    html = html.replace(
      /^\d+\. (.*?)$/gm,
      "<li className='ml-6'>$1</li>"
    );

    // Lists - bullet
    html = html.replace(
      /^- (.*?)$/gm,
      "<li className='ml-6'>$1</li>"
    );

    // Paragraphs
    html = html.replace(/^(?!<[^p])(.*?)$/gm, (match) => {
      if (
        match.startsWith("<") ||
        match === "" ||
        match.startsWith("&gt;") ||
        match.startsWith("<li")
      ) {
        return match;
      }
      return `<p className='my-2 text-slate-300'>${match}</p>`;
    });

    return html;
  };

  const renderHtml = (htmlString: string) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlString }}
        className="prose prose-invert max-w-none text-slate-200"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-600">
        <button
          onClick={() => setTab("edit")}
          className={`px-4 py-2 text-sm font-medium transition ${
            tab === "edit"
              ? "border-b-2 border-purple-500 text-purple-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition ${
            tab === "preview"
              ? "border-b-2 border-purple-500 text-purple-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          👁️ Preview
        </button>
      </div>

      {/* Edit Tab */}
      {tab === "edit" && (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Nhập markdown tại đây..."
          rows={10}
          className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition resize-none"
        />
      )}

      {/* Preview Tab */}
      {tab === "preview" && (
        <div className="rounded-lg bg-slate-700/30 px-4 py-3 max-h-96 overflow-auto">
          {renderHtml(parseMarkdown(markdown))}
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(markdown);
        }}
        className="w-full rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
      >
        Copy Markdown
      </button>
    </div>
  );
}
