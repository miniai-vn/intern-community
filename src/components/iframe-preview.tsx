"use client";

import { useState, useEffect } from "react";

interface IframePreviewProps {
  demoUrl: string | null;
}

export function IframePreview({ demoUrl }: IframePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only render if demoUrl exists and is HTTPS
  if (!demoUrl || !demoUrl.startsWith("https://")) {
    if (demoUrl && !demoUrl.startsWith("https://")) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Demo URL must be HTTPS for security. Current: {demoUrl}
        </div>
      );
    }
    return null;
  }

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load demo. The URL may be blocked or unavailable.");
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>

      <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-gray-100 animate-pulse flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="h-8 w-24 mx-auto bg-gray-300 rounded-md mb-2"></div>
              <div className="h-4 w-32 mx-auto bg-gray-300 rounded-md"></div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="min-h-[500px] flex items-center justify-center bg-red-50">
            <div className="text-center">
              <p className="text-red-600 font-medium">⚠️ {error}</p>
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-blue-600 hover:underline text-sm"
              >
                Open in new tab instead →
              </a>
            </div>
          </div>
        )}

        {/* Iframe with strict sandbox restrictions */}
        <iframe
          src={demoUrl}
          title="Module demo preview"
          className="w-full min-h-[500px] border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; magnetometer; microphone; payment; usb"
        />
      </div>

      <p className="text-xs text-gray-500">
        Preview rendered in a sandboxed iframe for security. If blocked, open in a new tab above.
      </p>
    </div>
  );
}
