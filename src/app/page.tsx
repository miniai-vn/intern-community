import {db} from "@/lib/db";
import {auth} from "@/lib/auth";
import {ModuleCard} from "@/components/module-card";
import {Search, Filter} from "lucide-react";

export default async function HomePage({
                                           searchParams,
                                       }: {
    searchParams: Promise<{ q?: string; category?: string }>;
}) {
    const {q, category} = await searchParams;
    const session = await auth();

    const modules = await db.miniApp.findMany({
        where: {
            status: "APPROVED",
            ...(category ? {category: {slug: category}} : {}),
            ...(q
                ? {
                    OR: [
                        {name: {contains: q, mode: "insensitive"}},
                        {description: {contains: q, mode: "insensitive"}},
                    ],
                }
                : {}),
        },
        include: {
            category: true,
            author: {select: {id: true, name: true, image: true}},
        },
        orderBy: {voteCount: "desc"},
        take: 12,
    });

    let votedIds = new Set<string>();
    if (session?.user) {
        const votes = await db.vote.findMany({
            where: {
                userId: session.user.id,
                moduleId: {in: modules.map((m) => m.id)},
            },
            select: {moduleId: true},
        });
        votedIds = new Set(votes.map((v) => v.moduleId));
    }

    const categories = await db.category.findMany({orderBy: {name: "asc"}});

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">

                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full mb-6">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium uppercase tracking-wide">
                            🚀 Community Modules
                        </span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
                        Discover Awesome
                        <br />
                        <span className="text-4xl lg:text-5xl">Mini Apps</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Explore thousands of community-built modules.
                        <span className="font-semibold text-orange-600"> Vote, share, and build together.</span>
                    </p>
                </div>

                {/* Enhanced Search & Filter */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <form className="flex gap-3">
                                <input
                                    name="q"
                                    defaultValue={q}
                                    placeholder="Search 1000+ modules by name or description..."
                                    className="flex-1 pl-12 pr-4 py-5 text-lg border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm
                                    focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none
                                    transition-all duration-300 shadow-lg hover:shadow-xl"
                                />
                                <button
                                    type="submit"
                                    className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                                    px-8 py-5 rounded-2xl text-lg font-bold text-white shadow-xl hover:shadow-2xl
                                    transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            <a
                                href="/"
                                className={`group px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${
                                    !category
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25 hover:shadow-orange-500/50 transform -translate-y-1"
                                        : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl hover:-translate-y-1 border border-gray-200/50"
                                }`}
                            >
                                <Filter className={`h-4 w-4 ${!category ? 'text-white/90' : 'text-gray-500 group-hover:text-orange-500'}`} />
                                All Modules
                                {!category && <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse ml-2" />}
                            </a>

                            {categories.map((c) => (
                                <a
                                    key={c.id}
                                    href={`/?category=${c.slug}`}
                                    className={`group px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${
                                        category === c.slug
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25 hover:shadow-orange-500/50 transform -translate-y-1"
                                            : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl hover:-translate-y-1 border border-gray-200/50"
                                    }`}
                                >
                                    <div className={`w-2 h-2 rounded-full transition-all ${category === c.slug ? 'bg-white/90 scale-110' : 'bg-gray-400 group-hover:bg-orange-500 group-hover:scale-110'}`} />
                                    {c.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                {modules.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-xl">
                            <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">No modules found</h3>
                        <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
                            Try adjusting your search or filter by category
                        </p>
                        {q && (
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                                px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                Clear Filters
                            </a>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                            <span>Showing {modules.length} of 1000+ modules</span>
                            {category && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                    {category}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="group bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl
                                    border border-white/50 hover:border-orange-200/50 transition-all duration-500
                                    hover:-translate-y-3 hover:rotate-1 overflow-hidden"
                                >
                                    <ModuleCard
                                        module={module}
                                        hasVoted={votedIds.has(module.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}