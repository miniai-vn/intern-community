"use client";

import { useState } from "react";
import Link from "next/link";

export function IframePreview({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isValidUrl = url.startsWith("https://");

  if (!isValidUrl) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="mb-1 font-semibold text-red-800">Insecure Protocol Detected</p>
        <p>Live preview is strictly limited to secure (HTTPS) origins.</p>
        <p className="mt-3 text-xs text-red-600">The provided demo URL is using HTTP which exposes risks to local security.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
      
      {/* Skeleton Loading UX */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-300 border-t-blue-600 shadow-sm"></div>
            <span className="animate-pulse text-sm font-medium tracking-wide text-gray-500">Injecting simulation...</span>
          </div>
        </div>
      )}

      {/* Fallback Error Interface */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50 p-6 text-center text-sm text-gray-600 space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div className="space-y-1">
            <p className="font-medium text-gray-800">Preview Failed to Render</p>
            <p className="text-xs">The target server either timed out or its Content-Security-Policy blocks iframe embedding entirely.</p>
          </div>
          <Link href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 hover:text-blue-700 hover:underline">
            Open App in external tab
          </Link>
        </div>
      )}

      {/* Protected Sandbox */}
      <iframe
        src={url}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Live Preview"
        className={`absolute inset-0 h-full w-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        aria-hidden={isLoading ? 'true' : 'false'}
      />
    </div>
  );
}
