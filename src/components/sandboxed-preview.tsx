"use client";

import { useState } from "react";

export function SandboxedPreview({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700">Live Preview</h2>

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100" style={{ height: 480 }}>
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col gap-3 animate-pulse p-6">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-32 rounded bg-gray-200" />
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-gray-500">
            <span className="text-2xl">⚠️</span>
            <p className="font-medium text-gray-700">Preview unavailable</p>
            <p className="text-xs text-gray-400">
              The site may block embedding, or the URL is unreachable.
            </p>
          </div>
        )}

        <iframe
          src={url}
          title="Module demo preview"
          className={`h-full w-full border-0 transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          referrerPolicy="no-referrer"
        />
      </div>

      <p className="text-xs text-gray-400">
        Preview runs in a sandboxed iframe.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Open in new tab ↗
        </a>
      </p>
    </div>
  );
}
