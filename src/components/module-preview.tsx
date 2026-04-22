"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ViewMode = "desktop" | "mobile";

interface ModulePreviewProps {
  demoUrl: string;
}

const LOAD_TIMEOUT_MS = 4000;

export function ModulePreview({ demoUrl }: ModulePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const normalizedUrl = useMemo(() => {
    try {
      const parsed = new URL(demoUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }, [demoUrl]);

  useEffect(() => {
    if (!normalizedUrl || hasLoaded) return;

    const timer = window.setTimeout(() => {
      setHasTimedOut(true);
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [hasLoaded, normalizedUrl]);

  function handleLoaded() {
    setHasLoaded(true);
    setHasTimedOut(false);
    setIsLoading(false);
  }

  if (!normalizedUrl) {
    return (
      <div className="rounded-xl border border-dashed border-indigo-300/20 bg-slate-950/70 p-6 text-center text-sm text-slate-400">
        <p>No demo available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-300/15 bg-slate-900 px-3 py-2">
        <p className="text-sm font-semibold text-slate-100">Module Preview</p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className={cn(
              "rounded-md border px-3 py-1 text-xs font-medium transition",
              viewMode === "desktop"
                ? "border-violet-300/50 bg-violet-500/20 text-violet-100"
                : "border-indigo-300/20 bg-slate-950 text-slate-300 hover:text-slate-100",
            )}
          >
            Desktop view
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mobile")}
            className={cn(
              "rounded-md border px-3 py-1 text-xs font-medium transition",
              viewMode === "mobile"
                ? "border-violet-300/50 bg-violet-500/20 text-violet-100"
                : "border-indigo-300/20 bg-slate-950 text-slate-300 hover:text-slate-100",
            )}
          >
            Mobile view
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            className="rounded-md border border-indigo-300/20 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-slate-100"
          >
            Fullscreen
          </button>
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-indigo-300/20 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-slate-100"
          >
            Open in new tab
          </a>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-indigo-300/15 bg-slate-900/70 transition-all",
          viewMode === "mobile" ? "mx-auto w-full max-w-93.75" : "w-full",
        )}
      >
        {hasTimedOut && !hasLoaded ? (
          <div className="flex h-125 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-300">
            <p className="font-medium text-slate-100">Preview not available</p>
            <p className="text-slate-400">
              This site may not allow embedding (for example via
              X-Frame-Options) or the response took too long.
            </p>
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-400"
            >
              Open Live Demo
            </a>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 animate-pulse bg-slate-800/70" />
            )}
            <iframe
              title="Module preview"
              src={normalizedUrl}
              className="h-125 w-full rounded-xl"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
              onLoad={handleLoaded}
            />
          </>
        )}
      </div>

      {isFullscreenOpen && (
        <div className="fixed inset-0 z-100 bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-xl border border-indigo-300/15 bg-slate-900">
            <div className="flex items-center justify-between border-b border-indigo-300/15 px-3 py-2">
              <p className="text-sm font-semibold text-slate-100">
                Module Preview
              </p>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="rounded-md border border-indigo-300/20 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-slate-100"
              >
                Close
              </button>
            </div>
            <iframe
              title="Module preview fullscreen"
              src={normalizedUrl}
              className="h-full w-full"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
