"use client";

import { ModuleCard } from "@/components/module-card";
import { SubmissionStatus } from "@prisma/client";
import { Session } from "next-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ModulesProps = {
  id: string;
  slug: string;
  name: string;
  description: string;
  repoUrl: string;
  demoUrl: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  categoryId: string;
  authorId: string;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string };
  author: { id: string; name: string | null; image: string | null };
};

type CategoriesProp = {
  id: string;
  name: string;
  slug: string;
};

type PageProps = {
  categories: Array<CategoriesProp>;
  initialModules: Array<ModulesProps>;
  initialVotedIds: Array<string>;
  session: Session | null;
};

export default function PageClient({
  categories,
  initialModules,
  initialVotedIds,
  session,
}: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listModule, setListModule] = useState(initialModules);
  const [votedSet, setVotedSet] = useState(new Set(initialVotedIds));

  const [isSearch, setIsSearch] = useState(false);
  const qFromUrl = searchParams.get("q") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const [param, setParam] = useState({
    q: qFromUrl,
    category: categoryFromUrl,
  });

  //Wait for search to stop the user from repeatedly pressing the search button
  const handleSearch = async (q: string, category: string) => {
    if (isSearch) return;
    setIsSearch(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`, { scroll: false });
    setParam({ q: q, category: category });
    try {
      const response = await fetch(`/api/modules?q=${q}&category=${category}`);
      if (!response.ok) return setListModule([]);
      const data = await response.json();
      setListModule(data.items);
    } catch (error) {
      setListModule([]);
      console.log(error);
    } finally {
      setIsSearch(false);
    }
  };

  //Update the user vote list without waiting for the database update
  const updateVoteUI = (id: string) => {
    setVotedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-5 w-3/5 max-lg:w-[95%] py-3">
      <div className="flex gap-3 flex-wrap items-center justify-center lg:h-30 p-3 rounded-lg shadow-default bg-kate-salad bg-[linear-gradient(90deg,#00C9FF_0%,#92FE9D_100%)]">
        <div className="flex-1">
          <h1 className="text-[30px] font-bold">Community Modules</h1>
          <p className="text-cloud">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>
        <form
          className="flex-1 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(param.q, param.category);
          }}
        >
          <input
            value={param.q}
            onChange={(e) => setParam({ ...param, q: e.target.value })}
            placeholder="Search modules…"
            className="flex-1 bg-white border-deep-ocen border-2 rounded-lg p-2 shadow-default duration-300 ease-in focus:shadow"
          />
          <button
            type="submit"
            disabled={isSearch}
            className="px-3 bg-deep-ocen text-white rounded-lg border-deep-ocen border-2 scale-100 duration-300 ease-in hover:bg-white hover:text-deep-ocen active:scale-95"
          >
            {isSearch ? "Searching" : "Search"}
          </button>
        </form>
      </div>

      {/* Category filter placeholder — see TODO above */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            handleSearch(param.q, "");
          }}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            !param.category
              ? "bg-dim-skye text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((c: CategoriesProp) => (
          <button
            key={c.id}
            onClick={() => {
              handleSearch(param.q, c.slug);
            }}
            className={`rounded-full px-3 py-1 text-sm duration-300 ease-in ${
              param.category === c.slug
                ? "bg-dim-skye text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {listModule && listModule.length === 0 ? (
        <div className="flex flex-col gap-3 items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {param.q && (
            <button
              onClick={() => {
                handleSearch("", "");
              }}
              className="p-1 bg-deep-ocen text-white rounded-lg border-deep-ocen border-2 scale-100 duration-300 ease-in hover:bg-white hover:text-deep-ocen active:scale-95"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listModule.map((module: ModulesProps) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedSet.has(module.id)}
              handleSearch={handleSearch}
              param={param}
              updateVotedUI={updateVoteUI}
            />
          ))}
          {session?.user && (
            <Link
              href={"/submit"}
              className="flex justify-center items-center h-50 max-lg:h-40 gap-3 rounded-xl border-2 border-deep-ocen bg-white p-5 duration-300 ease-in-out hover:shadow-default"
            >
              <p className="text-[50px]">+</p>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
