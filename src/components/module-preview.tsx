"use client";

import { useState } from "react";

interface ModulePreviewProps {
  demoUrl: string;
}

export function ModulePreview({ demoUrl }: ModulePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-full w-full animate-pulse bg-gray-200" />
        </div>
      )}
      <iframe
        src={demoUrl}
        title="Module Preview"
        sandbox="allow-scripts"
        className={`h-full w-full border-0 transition-opacity duration-500 ease-in-out ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
