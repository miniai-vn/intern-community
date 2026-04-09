"use client";

import { useState, useEffect } from "react";

interface IframePreviewProps {
  demoUrl: string;
  title: string;
}

export function IframePreview({ demoUrl, title }: IframePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate demoUrl - only accept HTTPS URLs per requirements
  const isValidUrl = demoUrl && 
    demoUrl.startsWith('https://') && 
    demoUrl.length > 10;

  if (!isValidUrl) {
    return null;
  }

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load demo. The preview may be unavailable or blocked.');
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  // Set timeout for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Demo is taking too long to load. The site may be slow or unavailable.');
      }
    }, 5000); // 5 seconds timeout for faster feedback

    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
      
      {/* Loading Skeleton */}
      {loading && (
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg border-2 border-gray-300">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
                <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
          <div className="text-center">
            <svg 
              className="w-12 h-12 text-red-500 mx-auto mb-4" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2v-2h2v6zm0-4h-2V7h2v6z"/>
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Preview Unavailable
            </h3>
            <p className="text-red-700 text-sm mb-4">
              {error}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  Possible reasons:
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1 text-left">
                  <li>Demo URL doesn't exist or is offline</li>
                  <li>Website blocks iframe embedding</li>
                  <li>Network connectivity issues</li>
                  <li>Demo site is temporarily down</li>
                </ul>
              </div>
              <div>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium bg-red-100 px-4 py-2 rounded-lg"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                  Open Demo in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Iframe */}
      {!loading && !error && (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden">
          <iframe
            src={demoUrl}
            title={`${title} Live Preview`}
            className="w-full h-96 border-0"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation-by-user-activation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            loading="lazy"
          />
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          Preview runs in a secure sandbox. Some features may be limited for security.
        </p>
      </div>
    </div>
  );
}
