"use client";

import { useState } from "react";

interface IframePreviewProps {
  demoUrl: string;
  title: string;
}

export function IframePreview({ demoUrl, title }: IframePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="truncate text-xs text-gray-400">{demoUrl}</span>
      </div>

      {/* Preview area */}
      <div className="relative h-125 w-full bg-gray-50">

        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col gap-3 p-6">
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-200" />
            <div className="mt-2 h-32 w-full animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-200" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-gray-600">
              Preview unavailable
            </p>
            <p className="text-xs text-gray-400">
              This site may not allow embedding.
            </p>
            
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            <a>
              Open in new tab →
            </a>
          </div>
        )}

        {/* Iframe */}
        {!hasError && (
          <iframe
            src={demoUrl}
            title={`Demo preview: ${title}`}
            className={`h-full w-full transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>
    </div>
  );
}