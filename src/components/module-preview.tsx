"use client";

import { useState } from "react";

export function ModulePreview({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">Preview</span>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-300" />
          <div className="h-2 w-2 rounded-full bg-yellow-300" />
          <div className="h-2 w-2 rounded-full bg-green-300" />
        </div>
      </div>

      <div className="relative aspect-video w-full bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-full animate-pulse bg-gray-200" />
          </div>
        )}
        
        <iframe
          src={url}
          className={`h-full w-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin"
          title="Module Preview"
        />
      </div>
    </div>
  );
}