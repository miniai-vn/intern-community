"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export interface CategoryFilterProps {
	categories: { id: string; name: string; slug: string }[];
	selectedCategory?: string;
}

export default function CategoryFilter({
	categories,
	selectedCategory,
}: CategoryFilterProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const buildHref = (slug?: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (
			!slug ||
			slug === selectedCategory // If current category is already selected, toggle them off
		) {
			params.delete("category");
		} else {
			params.set("category", slug);
		}

		const query = params.toString();
		return query ? `${pathname}?${query}` : pathname;
	};

	return (
		<div className="flex flex-wrap gap-2">
			<Link
				className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
					!selectedCategory
					? "bg-blue-600 text-white"
					: "bg-gray-100 text-gray-600 hover:bg-gray-200"
				}`}
				href={buildHref(undefined)}
			>
				All
			</Link>
			{categories.map((c) => (
				<Link
					key={c.id}
					className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
						selectedCategory === c.slug
							? "bg-blue-600 text-white"
							: "bg-gray-100 text-gray-600 hover:bg-gray-200"
					}`}
					href={buildHref(c.slug)}
				>
					{c.name}
				</Link>
			))}
		</div>
	);
}
