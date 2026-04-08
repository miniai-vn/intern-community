"use client";

import { useState } from "react";

interface IframePreviewProps {
  demoUrl: string;
}

export function IframePreview({ demoUrl }: IframePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700">Live Preview</h2>
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="text-xs text-gray-400">Loading preview...</p>
            </div>
          </div>
        )}

        {/* Sandboxed iframe */}
        <iframe
          src={demoUrl}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setIsLoading(false)}
          className={`h-[500px] w-full border-0 ${isLoading ? "invisible" : "visible"}`}
          title="Module live preview"
        />
      </div>
      <p className="text-xs text-gray-400">
        Preview is sandboxed for security. May not work for all sites.
      </p>
    </div>
  );
}
