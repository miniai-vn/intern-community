/**
 * ===== PASSWORD STRENGTH CHECKER COMPONENT =====
 * 
 * Component tương tác kiểm tra độ mạnh mật khẩu
 * Hiển thị:
 * - Strength meter (progress bar with color)
 * - Real-time suggestions
 * - Requirement checklist
 * - Character count
 */

"use client";

import { useState, useEffect } from "react";
import { getStrengthDisplay, type PasswordAnalysis } from "@/lib/password";

export function PasswordStrengthChecker() {
  // ===== STATE =====
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ===== EFFECTS =====

  // Gọi API khi password thay đổi (debounce 500ms)
  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      setError("");
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/password-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.details || data.error);
          setAnalysis(null);
          return;
        }

        setAnalysis(data);
      } catch (err) {
        setError("Không thể kết nối tới server");
        setAnalysis(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return ()=> clearTimeout(timer);
  }, [password]);

  // ===== RENDER =====
  const display = analysis ? getStrengthDisplay(analysis.strength) : null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        🔒 Password Strength Checker
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Kiểm tra độ mạnh mật khẩu realtime
      </p>

      {/* Password Input */}
      <div className="space-y-2 mb-4">
        <label htmlFor="pwd-input" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="pwd-input"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu để kiểm tra"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          {/* Show/Hide Button */}
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      {/* Character Count */}
      {password && (
        <div className="text-xs text-gray-500 mb-4">
          {password.length} / 128 ký tự
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysis && display && (
        <div className="space-y-4">
          {/* Strength Meter */}
          <div className={`p-4 rounded-lg border ${display.bg} ${display.border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${display.color}`}>
                Độ Mạnh: {display.label}
              </span>
              <span className={`text-sm font-mono ${display.color}`}>
                {analysis.score}/100
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${display.bar}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Yêu cầu:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex gap-2 items-center">
                <span className={analysis.checks.length ? "✅" : "❌"}>
                  {analysis.checks.length ? "✓" : "✗"}
                </span>
                <span className="text-gray-600">
                  Ít nhất 8 ký tự ({password.length}/8)
                </span>
              </li>
              <li className="flex gap-2 items-center">
                <span>{analysis.checks.uppercase ? "✅" : "❌"}</span>
                <span className="text-gray-600">Chữ hoa (A-Z)</span>
              </li>
              <li className="flex gap-2 items-center">
                <span>{analysis.checks.lowercase ? "✅" : "❌"}</span>
                <span className="text-gray-600">Chữ thường (a-z)</span>
              </li>
              <li className="flex gap-2 items-center">
                <span>{analysis.checks.digits ? "✅" : "❌"}</span>
                <span className="text-gray-600">Số (0-9)</span>
              </li>
              <li className="flex gap-2 items-center">
                <span>{analysis.checks.special ? "✅" : "❌"}</span>
                <span className="text-gray-600">Ký tự đặc biệt (!@#$%)</span>
              </li>
            </ul>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-2">
                💡 Gợi ý cải thiện:
              </p>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-yellow-700">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success State */}
          {analysis.suggestions.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700 font-medium">
                ✅ Mật khẩu mạnh mẽ! Bạn có thể dùng nó.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysis && !password && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Bắt đầu nhập mật khẩu để kiểm tra...</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Đang phân tích...
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>💡 Mẹo:</strong> Mật khẩu mạnh mẽ là cần thiết cho bảo mật tài khoản. Hãy
          tránh những từ phổ biến hoặc dễ đoán.
        </p>
      </div>
    </div>
  );
}
