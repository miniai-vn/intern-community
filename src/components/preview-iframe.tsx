"use client";

import { useState, useEffect } from "react";

interface PreviewIframeProps {
  url: string;
}

export function PreviewIframe({ url }: PreviewIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const isHttps = url.startsWith("https://");

  useEffect(() => {
    if (!isHttps) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // 10 second timeout for iframe load, in case it is blocked by CSP / X-Frame-Options
    const timeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [url, isHttps, isLoading]);

  if (!isHttps) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 h-6 w-6">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Live preview is only available for secure (HTTPS) URLs.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[500px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-slate-200"></div>
            <div className="h-3 w-3 rounded-full bg-slate-200"></div>
            <div className="h-3 w-3 rounded-full bg-slate-200"></div>
          </div>
          <span className="ml-2 text-xs font-medium text-gray-500">Live Preview</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Open in new tab
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>

      <div className="relative flex-1 bg-white flex justify-center items-center">
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm text-gray-500">Loading preview...</span>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50 p-6 text-center">
            <div className="flex max-w-sm flex-col items-center gap-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-gray-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="font-medium text-gray-900 mt-2">Preview could not be loaded</p>
              <p>
                The author's server may have blocked embedding via{" "}
                <code className="rounded bg-gray-200 px-1 py-0.5">X-Frame-Options</code> or{" "}
                <code className="rounded bg-gray-200 px-1 py-0.5">Content-Security-Policy</code>.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700"
              >
                Open directly
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        )}

        <iframe
          src={url}
          sandbox="allow-scripts"
          className={`h-full w-full border-0 bg-white transition-opacity duration-300 ${
            isLoading || hasError ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => {
            setIsLoading(false);
          }}
          title="Module Demo Preview"
        />
      </div>
    </div>
  );
}
