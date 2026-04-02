"use client";

import { useState } from "react";

interface IframePreviewProps {
  demoUrl: string;
}

export function IframePreview({ demoUrl }: IframePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Only render if demoUrl is HTTPS
  const isValidUrl = demoUrl.startsWith("https://");

  if (!isValidUrl) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">
          Demo URL must use HTTPS for security reasons.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Open in new tab →
        </a>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        )}

        <iframe
          src={demoUrl}
          title="Live demo preview"
          className="h-[500px] w-full"
          sandbox="allow-scripts allow-popups allow-forms allow-modals"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={{ display: hasError ? "none" : "block" }}
        />

        {hasError && (
          <div className="flex h-[500px] flex-col items-center justify-center bg-gray-50">
            <p className="text-sm text-red-600">
              Failed to load preview. The website may block embedding.
            </p>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Open demo in new tab instead →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}