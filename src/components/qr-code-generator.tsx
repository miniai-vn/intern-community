"use client";

import { useState, useRef } from "react";

/**
 * ===== QR CODE GENERATOR COMPONENT =====
 * Công cụ tạo QR code từ text
 * - Đầu vào: Text/URL string
 * - Xử lý: Generate QR code (canvas-based)
 * - Đầu ra: QR code image + download button
 */

export function QrCodeGenerator() {
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQrCode = async () => {
    if (!input.trim()) {
      alert("Vui lòng nhập text hoặc URL");
      return;
    }

    try {
      // Import qrcode library
      const QRCode = (await import("qrcode")).default;
      
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, input, {
          errorCorrectionLevel: "H",
          width: 200,
          margin: 1,
          color: {
            dark: "#ffffff",
            light: "#000000",
          },
        });

        // Convert canvas to data URL
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setQrDataUrl(dataUrl);
      }
    } catch (err) {
      console.error("Lỗi tạo QR code:", err);
      alert("Lỗi tạo QR code. Vui lòng thử lại.");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateQrCode();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          🔗 Text hoặc URL
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập text để tạo QR code..."
          maxLength={200}
          className="w-full rounded-lg bg-slate-700/50 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition"
        />
        <p className="text-xs text-slate-400 mt-1">{input.length} / 200</p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateQrCode}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition"
      >
        Generate QR Code
      </button>

      {/* QR Code Display */}
      {qrDataUrl && (
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg">
            <img
              src={qrDataUrl}
              alt="Generated QR Code"
              className="w-48 h-48"
            />
          </div>

          {/* Download Button */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              ⬇️ Download
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(input);
                alert("Đã copy! ✅");
              }}
              className="flex-1 rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              Copy Text
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
