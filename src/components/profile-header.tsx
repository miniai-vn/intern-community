import Image from "next/image";
import type { User } from "@prisma/client";

interface ProfileHeaderProps {
    user: Pick<User, "id" | "name" | "image" | "createdAt">;
    approvedCount: number;
}

function getBadge(approvedCount: number): { label: string; style: string } | null {
    if (approvedCount >= 10)
        return { label: "🏆 Elite Contributor", style: "bg-purple-50 text-purple-700 border-purple-200" };
    if (approvedCount >= 5)
        return { label: "⭐ Top Contributor", style: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    if (approvedCount >= 1)
        return { label: "🌱 Contributor", style: "bg-green-50 text-green-700 border-green-200" };
    return null;
}

export function ProfileHeader({ user, approvedCount }: ProfileHeaderProps) {
    const badge = getBadge(approvedCount);
    const joinedYear = new Date(user.createdAt).getFullYear();

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="shrink-0">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name ?? "User avatar"}
                        width={80}
                        height={80}
                        className="rounded-full border border-gray-200"
                    />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">{user.name ?? "Anonymous"}</h1>
                    {badge && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.style}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-400">Member since {joinedYear}</p>
            </div>
        </div>
    );
}