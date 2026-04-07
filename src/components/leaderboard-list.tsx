import type { LeaderboardEntry } from "@/types";

interface LeaderboardListProps {
  items: LeaderboardEntry[];
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function LeaderboardList({ items }: LeaderboardListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No approved submissions yet this month.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((entry) => (
        <li
          key={entry.userId}
          className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 text-sm font-semibold text-gray-500">#{entry.rank}</span>

            {entry.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={entry.image}
                alt={`${entry.name} avatar`}
                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700">
                {getInitials(entry.name)}
              </div>
            )}

            <p className="text-sm font-medium text-gray-900">{entry.name}</p>
          </div>

          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{entry.approvedSubmissions}</span>{" "}
            approved
          </p>
        </li>
      ))}
    </ol>
  );
}
