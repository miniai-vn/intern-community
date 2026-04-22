"use client";

import { useMemo, useState } from "react";

type Props = { demoUrl: string };

function isSafeHttpsUrl(value: string) {
    try {
        const u = new URL(value);
        return u.protocol === "https:";
    } catch {
        return false;
    }
}

export function SandboxedDemoPreview({ demoUrl }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const safeUrl = useMemo(() => (isSafeHttpsUrl(demoUrl) ? demoUrl : null), [demoUrl]);

    if (!safeUrl) {
        return (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Demo preview unavailable: only valid HTTPS URLs are supported.
            </div>
        );
    }

    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Live Preview (Sandboxed)</h2>

            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading && !hasError && (
                    <div className="absolute inset-0 animate-pulse bg-gray-100" aria-hidden="true" />
                )}

                {hasError ? (
                    <div className="p-6 text-sm text-red-600">
                        Failed to load preview. You can still open the demo in a new tab.
                    </div>
                ) : (
                    <iframe
                        src={safeUrl}
                        title="Module demo preview"
                        className="h-[520px] w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-forms allow-popups"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                )}
            </div>
        </section>
    );
}