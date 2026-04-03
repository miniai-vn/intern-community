"use client";

import { useState } from "react";

export function IframePreview({ src }: { src: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl border border-gray-300 bg-gray-50 shadow-sm mt-8">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span className="text-sm text-gray-500 font-medium">Loading sandboxed preview...</span>
          </div>
        </div>
      )}
      <iframe
        src={src}
        sandbox="allow-scripts allow-popups"
        // Note: intentionally excluding allow-same-origin for security so external demo cannot access our cookies/localStorage
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        title="Live Demo Preview"
        loading="lazy"
      />
    </div>
  );
}
