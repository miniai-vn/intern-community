"use client";

import Link from "next/link";
import Image from "next/image";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";
interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(module.createdAt));

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-200/40">
      <div className="flex flex-col p-6 space-y-4">
        {/* Header: Name and Quick Link */}
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/modules/${module.slug}`}
            className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600"
          >
            {module.name}
          </Link>
          
          <div className="flex items-center gap-2">
            {module.demoUrl && (
              <a
                href={module.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Xem bản Demo"
                aria-label={`Xem bản demo của ${module.name}`}
                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
              >
                <ExternalLinkIcon />
              </a>
            )}
            {module.repoUrl && (
              <a
                href={module.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Xem mã nguồn trên GitHub"
                aria-label={`Xem mã nguồn ${module.name} trên GitHub`}
                className="rounded-lg bg-gray-50 p-2 text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
              >
                <GitHubIcon />
              </a>
            )}
          </div>
        </div>

        {/* Categories & Badge */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50/50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-indigo-600 uppercase border border-indigo-100">
            {module.category.name}
          </span>
        </div>

        {/* Description */}
        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-gray-600/90 group-hover:text-gray-700">
          {module.description}
        </p>

        {/* Author & Footer */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm transition-transform group-hover:scale-110">
              {module.author.image ? (
                <Image
                  src={module.author.image}
                  alt={module.author.name || "Tác giả"}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-400">
                  {module.author.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900 leading-tight">
                {module.author.name || "Ẩn danh"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {formattedDate}
              </span>
            </div>
          </div>

          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
        </div>
      </div>
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
