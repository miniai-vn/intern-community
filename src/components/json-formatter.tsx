"use client";

import { useState } from "react";

/**
 * ===== JSON FORMATTER COMPONENT =====
 * Công cụ format và validate JSON
 * - Đầu vào: Raw JSON string
 * - Xử lý: Parse, format, highlight
 * - Đầu ra: Pretty JSON + error messages
 */

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    try {
      setError("");
      if (!input.trim()) {
        setError("Vui lòng nhập JSON");
        setOutput("");
        return;
      }

      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "JSON không hợp lệ"
      );
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const handleMinify = () => {
    try {
      setError("");
      if (!input.trim()) {
        setError("Vui lòng nhập JSON");
        return;
      }

      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "JSON không hợp lệ"
      );
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          📝 JSON Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Nhập JSON, ví dụ: {"name": "John", "age": 30}'
          rows={4}
          className="w-full rounded-lg bg-slate-700/50 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition resize-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2">
          <p className="text-xs text-red-300">❌ {error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFormat}
          className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-medium text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="flex-1 rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          Minify
        </button>
        {output && (
          <button
            onClick={handleCopy}
            className="flex-1 rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Copy
          </button>
        )}
      </div>

      {/* Output Section */}
      {output && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            ✅ Formatted JSON
          </label>
          <pre className="w-full rounded-lg bg-slate-700/50 px-4 py-3 text-xs text-slate-100 font-mono overflow-auto max-h-48 border border-slate-600/30">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
