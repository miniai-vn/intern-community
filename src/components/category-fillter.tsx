"use client";
import { useRouter, useSearchParams } from "next/navigation";

type Category = {
    id: string;
    name: string;
    slug: string;
};
export function CategoryFilter({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category");

    const handleClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (currentCategory === slug) {
            params.delete("category"); // !:toggle off
        } else {
            params.set("category", slug);
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 flex-wrap">
            {categories.map((c) => {
                const active = currentCategory === c.slug;

                return (
                    <button
                        key={c.id}
                        onClick={() => handleClick(c.slug)}
                        className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700"
                            }`}
                    >
                        {c.name}
                    </button>
                );
            })}
        </div>
    );
}