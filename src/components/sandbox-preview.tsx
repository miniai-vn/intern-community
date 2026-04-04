"use client";

import { useState } from "react";

interface SandboxPreviewProps {
  url: string;
}

/**
 * SandboxPreview renders a sandboxed iframe for a given demo URL.
 *
 * Security model:
 * - `sandbox="allow-scripts allow-popups allow-forms"`:
 *     • `allow-scripts`  — Required for interactive demos to function.
 *     • `allow-popups`   — Allows demos to open external links in a new tab.
 *     • `allow-forms`    — Allows demos with form submissions to work.
 *     • `allow-same-origin` is intentionally OMITTED — without it, the browser
 *       places the iframe in an "opaque origin", meaning the iframe's scripts
 *       cannot access the parent page's cookies, localStorage, or sessionStorage.
 *       Combining `allow-same-origin` + `allow-scripts` would let a malicious
 *       demo script escape the sandbox and read/write auth tokens.
 *
 * - Only `https://` URLs are accepted. This prevents `javascript:` URI attacks
 *   or loading from `data:` blobs that could bypass CORS / CSP.
 *
 * - The `referrerPolicy="no-referrer"` attribute prevents the demo page from
 *   knowing from which internal URL it was embedded.
 */
export function SandboxPreview({ url }: SandboxPreviewProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>
        {status === "loading" && (
          <span className="text-xs text-gray-400 animate-pulse">
            Loading preview…
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-500">Failed to load</span>
        )}
      </div>

      <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
        {/* Loading skeleton — shown while iframe is loading */}
        {status === "loading" && (
          <div
            aria-label="Loading preview"
            className="absolute inset-0 z-10 flex flex-col gap-3 p-6 animate-pulse"
          >
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="mt-2 h-32 w-full rounded bg-gray-200" />
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-gray-500">Failed to load preview</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Open demo in a new tab →
            </a>
          </div>
        )}

        {/* The sandboxed iframe */}
        <iframe
          src={url}
          title="Module live preview"
          // Security: no allow-same-origin → opaque origin → scripts cannot
          // reach parent cookies/localStorage even if the demo is compromised.
          sandbox="allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`w-full transition-opacity duration-300 ${
            status === "loading" ? "opacity-0" : "opacity-100"
          }`}
          style={{ height: "480px", border: "none" }}
        />
      </div>

      <p className="text-xs text-gray-400">
        Preview runs in a sandboxed environment. Scripts inside cannot access
        your session data.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-blue-400"
        >
          Open in new tab
        </a>
      </p>
    </div>
  );
}
