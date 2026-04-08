"use client";

import { useEffect, useState } from "react";

interface DemoPreviewFrameProps {
  demoUrl: string;
  moduleName: string;
}

const LOAD_TIMEOUT_MS = 12000;

export function DemoPreviewFrame({
  demoUrl,
  moduleName,
}: DemoPreviewFrameProps) { 
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const timer = globalThis.setTimeout(() => {
      setHasError(true);
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);

    return () => globalThis.clearTimeout(timer);
  }, [demoUrl, reloadKey]);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Live Preview
      </h2>

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 animate-pulse bg-linear-to-br from-gray-100 via-gray-50 to-gray-100"
            aria-hidden="true"
          />
        )}

        <iframe
          key={reloadKey}
          src={demoUrl}
          title={`${moduleName} live preview`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts"
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="aspect-video w-full"
        />
      </div>

      {hasError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Preview unavailable in embedded mode.</p>
          <p className="mt-1">
            This demo may block iframes using security headers like
            X-Frame-Options or Content-Security-Policy.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100"
            >
              Retry preview
            </button>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Open demo in new tab
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
