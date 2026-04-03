"use client";

import { useEffect, useState } from "react";

interface SandboxedDemoPreviewProps {
  demoUrl: string;
  moduleName: string;
}

export function SandboxedDemoPreview({ demoUrl, moduleName }: SandboxedDemoPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Some sites block embedding via X-Frame-Options/CSP and may never fully render.
    // Keep UX responsive by showing a friendly fallback if load takes too long.
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, 12000);

    return () => window.clearTimeout(timeoutId);
  }, [demoUrl]);

  return (
    <section className="space-y-3" aria-label="Sandboxed preview">
      <h2 className="text-base font-semibold text-foreground">Live Preview</h2>

      <div className="card-bg overflow-hidden p-0">
        <div className="relative h-[420px] w-full bg-[var(--muted-background)]">
          {isLoading && !hasError && (
            <div
              className="absolute inset-0 animate-pulse bg-[var(--muted-background)]"
              aria-hidden="true"
            />
          )}

          {hasError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                This demo could not be embedded in a sandboxed iframe.
              </p>
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Open Demo In New Tab
              </a>
            </div>
          ) : (
            <iframe
              src={demoUrl}
              title={`${moduleName} sandboxed demo preview`}
              className="h-full w-full border-0"
              // Security note:
              // - allow-scripts is needed for most interactive demos.
              // - allow-same-origin is intentionally NOT included to prevent the iframe
              //   from regaining full same-origin power with scripts.
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation"
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
