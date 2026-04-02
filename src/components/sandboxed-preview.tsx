"use client";

import { useState } from "react";

interface SandboxedPreviewProps {
    demoUrl: string;
    moduleName: string;
}

export function SandboxedPreview({ demoUrl, moduleName }: SandboxedPreviewProps) {
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    // Security: only allow https:// URLs — reject http, data:, javascript:, etc.
    // This is validated server-side too (demoUrl comes from the DB after zod validation),
    // but we double-check client-side to be safe.
    const isValidUrl = demoUrl.startsWith("https://");
    if (!isValidUrl) return null;

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>

            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {/* Loading skeleton — shown until iframe fires onLoad */}
                {status === "loading" && (
                    <div
                        aria-label="Loading preview…"
                        className="absolute inset-0 flex flex-col gap-3 p-6 animate-pulse"
                    >
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-4 w-1/2 rounded bg-gray-200" />
                        <div className="h-32 w-full rounded bg-gray-200" />
                    </div>
                )}

                {/* Error state */}
                {status === "error" && (
                    <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                        <p>
                            Preview could not be loaded.{" "}
                            <a
                                href={demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Open directly ↗
                            </a>
                        </p>
                    </div>
                )}

                {/*
          Sandbox attribute rationale (justified per hard-challenge requirement):

          allow-scripts     — needed for any interactive demo to work
          allow-forms       — allow demos that have form inputs
          allow-popups      — allow demos that open links in new tabs

          Deliberately EXCLUDED:
          allow-same-origin — if combined with allow-scripts this lets the iframe
                              read/write the parent's cookies, localStorage, and DOM,
                              effectively bypassing the sandbox entirely (XSS vector).
                              We leave it out; demos run as opaque origin.
          allow-top-navigation — prevents the iframe from redirecting the parent window (clickjacking)
          allow-downloads   — not needed for preview demos

          CSP: the next.config.ts (or middleware) should add:
            Content-Security-Policy: frame-src https://;
          to restrict which origins can be framed. Documented in PR notes.
        */}
                <iframe
                    src={demoUrl}
                    title={`Live preview of ${moduleName}`}
                    className={`h-[480px] w-full border-0 transition-opacity duration-300 ${status === "loading" || status === "error" ? "opacity-0" : "opacity-100"
                        }`}
                    sandbox="allow-scripts allow-forms allow-popups"
                    onLoad={() => setStatus("ready")}
                    onError={() => setStatus("error")}
                    referrerPolicy="no-referrer"
                />
            </div>

            <p className="text-xs text-gray-400">
                Preview runs in a sandboxed iframe — scripts are isolated from this page.
            </p>
        </div>
    );
}
