"use client";

import { useEffect, useRef, useState } from "react";

interface ModuleDescriptionProps {
  text: string;
}

export function ModuleDescription({ text }: ModuleDescriptionProps) {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textClassName =
    "w-full break-all text-sm leading-7 text-slate-300 sm:text-base";

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useEffect(() => {
    const node = textRef.current;
    if (!node || expanded) return;

    const updateOverflow = () => {
      const isOverflowing = node.scrollHeight > node.clientHeight + 1;
      setCanExpand(isOverflowing);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(node);

    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <div className="w-full">
      <p
        ref={textRef}
        className={expanded ? textClassName : `line-clamp-3 ${textClassName}`}
      >
        {text}
      </p>

      {canExpand && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-xs font-semibold text-violet-300 transition hover:text-violet-200 hover:underline"
        >
          See more
        </button>
      )}

      {canExpand && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-1 text-xs font-semibold text-violet-300 transition hover:text-violet-200 hover:underline"
        >
          Hide
        </button>
      )}
    </div>
  );
}
