"use client";

import { useState, useEffect } from "react";

export function IframePreview({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Validate URL protocol
  const isHttps = url.startsWith("https://");

  if (!isHttps) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
        Security block: Only HTTPS URLs are allowed for preview.
      </div>
    );
  }

  return (
    <div className="group relative mt-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-inner">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Preview</span>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-gray-200" />
          <div className="h-2 w-2 rounded-full bg-gray-200" />
          <div className="h-2 w-2 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="relative aspect-video w-full">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-3 bg-gray-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs text-gray-400 animate-pulse">Loading module preview...</p>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Failed to load preview</p>
            <p className="mt-1 text-xs text-gray-400">The site might prevent embedding or is temporarily down.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs text-blue-600 hover:underline">
              Open in new tab ↗
            </a>
          </div>
        )}

        <iframe
          src={url}
          className={`h-full w-full transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          sandbox="allow-scripts allow-forms allow-popups"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}