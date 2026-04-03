/**
 * ===== TOOLS PAGE =====
 * 
 * Page hiển thị các utilities và tools hữu ích
 * Ví dụ: Slug Generator, Password Checker, JSON Formatter, etc.
 * 
 * Route: /tools
 */

import { SlugGenerator } from "@/components/slug-generator";
import { PasswordStrengthChecker } from "@/components/password-strength-checker";
import { JsonFormatter } from "@/components/json-formatter";
import { QrCodeGenerator } from "@/components/qr-code-generator";
import { MarkdownPreview } from "@/components/markdown-preview";

export const metadata = {
  title: "Tools - Intern Community Hub",
  description: "Useful developer tools and utilities",
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Header AS CARD */}
      <div className="relative z-10 px-4 sm:px-0 pt-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden mb-12">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🛠️</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Developer Tools
              </h1>
            </div>
            <p className="text-lg text-slate-300">
              Bộ công cụ giúp developer work hiệu quả hơn. Từ đơn giản đến nâng cao.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-0">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tool Card 1: Slug Generator */}
          <div className="group">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <h2 className="font-semibold text-slate-100">URL Slug Generator</h2>
                    <p className="text-sm text-slate-400">Tạo URL-friendly slugs</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1">
                <SlugGenerator />
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-800/50">
                <p className="text-xs text-slate-400">
                  💡 <strong>Mẹo:</strong> Sử dụng slug cho URL, file names hoặc database IDs
                </p>
              </div>
            </div>
          </div>

          {/* Tool Card 2: Password Strength Checker */}
          <div className="group">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h2 className="font-semibold text-slate-100">Password Strength Checker</h2>
                    <p className="text-sm text-slate-400">Kiểm tra độ mạnh mật khẩu</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1">
                <PasswordStrengthChecker />
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-800/50">
                <p className="text-xs text-slate-400">
                  💡 <strong>Mẹo:</strong> Mật khẩu mạnh giúp bảo vệ tài khoản của bạn
                </p>
              </div>
            </div>
          </div>

          {/* Tool Card 3: JSON Formatter */}
          <div className="group">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ }</span>
                  <div>
                    <h2 className="font-semibold text-slate-100">JSON Formatter</h2>
                    <p className="text-sm text-slate-400">Format và validate JSON</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1">
                <JsonFormatter />
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-800/50">
                <p className="text-xs text-slate-400">
                  💡 <strong>Mẹo:</strong> Format, minify hoặc validate JSON dễ dàng
                </p>
              </div>
            </div>
          </div>

          {/* Tool Card 4: QR Code Generator */}
          <div className="group">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h2 className="font-semibold text-slate-100">QR Code Generator</h2>
                    <p className="text-sm text-slate-400">Tạo QR code từ text/URL</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1">
                <QrCodeGenerator />
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-800/50">
                <p className="text-xs text-slate-400">
                  💡 <strong>Mẹo:</strong> Tạo và download QR code tức thì
                </p>
              </div>
            </div>
          </div>

          {/* Tool Card 5: Markdown Preview */}
          <div className="group">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h2 className="font-semibold text-slate-100">Markdown Preview</h2>
                    <p className="text-sm text-slate-400">Preview markdown real-time</p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1">
                <MarkdownPreview />
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-800/50">
                <p className="text-xs text-slate-400">
                  💡 <strong>Mẹo:</strong> Xem markdown preview trực tiếp khi edit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Section */}
        <div className="mt-12 max-w-4xl">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">
                  Cách Sử Dụng & Best Practices
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-purple-400 font-bold">1.</span>
                    <span>
                      <strong>Slug Generator:</strong> Chuyển text bất kỳ thành URL-friendly format
                      (lowercase, no special chars)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-400 font-bold">2.</span>
                    <span>
                      <strong>Keyboard Support:</strong> Nhấn <kbd className="bg-slate-700 px-2 py-1 rounded text-sm font-mono text-slate-200">Enter</kbd> để generate (thay vì click button)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-400 font-bold">3.</span>
                    <span>
                      <strong>Copy to Clipboard:</strong> Nhấn nút &quot;Copy&quot; để sao chép ngay vào clipboard
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-400 font-bold">4.</span>
                    <span>
                      <strong>Real-time Preview:</strong> Xem kết quả ngay khi input
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
