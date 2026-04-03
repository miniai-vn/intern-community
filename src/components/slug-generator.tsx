/**
 * ===== SLUG GENERATOR COMPONENT =====
 * 
 * Component tương tác cho phép user:
 * 1. Nhập text (name)
 * 2. Click nút "Generate" để gọi API
 * 3. Xem kết quả slug được tạo
 * 
 * Features:
 * - Loading state khi gọi API
 * - Error handling
 * - Copy to clipboard
 * - Real-time preview
 */

"use client"; // Client Component - sử dụng hooks

import { useState } from "react";

export function SlugGenerator() {
  // ===== STATE MANAGEMENT =====
  // Input từ user
  const [input, setInput] = useState("");

  // Slug kết quả từ API
  const [slug, setSlug] = useState("");

  // Loading state khi gọi API
  const [loading, setLoading] = useState(false);

  // Error message nếu có
  const [error, setError] = useState("");

  // Copy success notification
  const [copied, setCopied] = useState(false);

  // ===== FUNCTIONS =====

  /**
   * Hàm xử lý click nút "Generate"
   * 1. Validate input (không được trống)
   * 2. Gọi API POST /api/slug
   * 3. Update state với kết quả hoặc error
   */
  const handleGenerate = async () => {
    // Reset error trước
    setError("");

    // Validate input
    if (!input.trim()) {
      setError("Vui lòng nhập text");
      return;
    }

    // Set loading = true để disable button
    setLoading(true);

    try {
      // Gọi API
      const response = await fetch("/api/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input }),
      });

      // Parse response JSON
      const data = await response.json();

      // Kiểm tra response status
      if (!response.ok) {
        // API trả về error (status 400, 500, ...)
        setError(data.details || data.error || "Có lỗi xảy ra");
        setSlug("");
        return;
      }

      // Success - update slug và clear error
      setSlug(data.slug);
      setError("");
    } catch (err) {
      // Network error hoặc JSON parse fail
      setError("Không thể kết nối tới server");
      setSlug("");
      console.error("Slug generation error:", err);
    } finally {
      // Always set loading = false
      setLoading(false);
    }
  };

  /**
   * Xử lý copy slug to clipboard
   * Hiển thị notification "Copied!" trong 2 giây
   */
  const handleCopy = async () => {
    if (!slug) return;

    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);

      // Reset notification sau 2 giây
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  /**
   * Xử lý khi user nhập vào input
   * Real-time update state
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Clear error khi user bắt đầu type
    if (error) setError("");
  };

  /**
   * Xử lý khi user nhấn Enter
   * Trigger generate
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleGenerate();
    }
  };

  // ===== RENDER =====
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        🔗 URL Slug Generator
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Chuyển đổi text thành URL-friendly slug
      </p>

      {/* Input Field */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="slug-input" className="block text-sm font-medium text-gray-700">
            Input Text
          </label>
          {/* ✨ Character Counter */}
          <span className="text-xs text-gray-500 font-mono">
            {input.length} / 100
          </span>
        </div>
        <input
          id="slug-input"
          type="text"
          placeholder="ví dụ: Hello World! 2024"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
        />
        {/* ✨ Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              input.length > 80
                ? "bg-red-500"
                : input.length > 60
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${(input.length / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition mb-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            {/* Loading spinner */}
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang xử lý...
          </span>
        ) : (
          "Generate Slug"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {slug && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Generated Slug
          </label>

          <div className="flex gap-2">
            {/* Slug Display */}
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              <code className="text-sm font-mono text-gray-900">{slug}</code>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
              title="Copy to clipboard"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>

          {/* Success Message */}
          {copied && (
            <p className="text-sm text-green-600 font-medium">
              ✅ Slug copied to clipboard!
            </p>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>💡 Tip:</strong> Slug được dùng làm URL-friendly identifier.
          Ví dụ: &quot;Hello World!&quot; → &quot;hello-world&quot;
        </p>
      </div>
    </div>
  );
}
