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

function Avatar({
  image,
  name,
  sizeClass,
}: {
  image: string | null;
  name: string;
  sizeClass: string;
}) {
  if (image) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${name} avatar`}
          className={`${sizeClass} rounded-full border border-gray-200 object-cover`}
        />
      </>
    );
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700`}
    >
      {getInitials(name)}
    </div>
  );
}

export function LeaderboardList({ items }: LeaderboardListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No approved submissions yet this month.</p>
      </div>
    );
  }

  const topThree = items.slice(0, 3);
  const remaining = items.slice(3);
  const first = topThree.find((entry) => entry.rank === 1);
  const second = topThree.find((entry) => entry.rank === 2);
  const third = topThree.find((entry) => entry.rank === 3);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5">
        <h2 className="text-center text-sm font-semibold tracking-wide text-blue-700 uppercase">
          Top Contributors
        </h2>
        <ol className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
          {[second, first, third].filter(Boolean).map((entry) => (
            <li
              key={entry!.userId}
              className="flex flex-col items-center rounded-xl border border-blue-100 bg-white p-4 text-center"
            >
              <span className="text-xs font-semibold text-blue-600">#{entry!.rank}</span>
              <div
                className={`my-2 rounded-full border-2 p-1 ${
                  entry!.rank === 1 ? "border-yellow-400" : "border-blue-300"
                }`}
              >
                <Avatar
                  image={entry!.image}
                  name={entry!.name}
                  sizeClass={entry!.rank === 1 ? "h-20 w-20" : "h-14 w-14"}
                />
              </div>
              <p className="line-clamp-1 text-sm font-semibold text-gray-900">{entry!.name}</p>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{entry!.approvedSubmissions}</span>{" "}
                approved
              </p>
            </li>
          ))}
        </ol>
      </section>

      {remaining.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[70px_1fr_120px] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            <span>Rank</span>
            <span>Name</span>
            <span className="text-right">Approved</span>
          </div>
          <ol>
            {remaining.map((entry) => (
              <li
                key={entry.userId}
                className="grid grid-cols-[70px_1fr_120px] items-center border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <span className="text-sm font-semibold text-gray-600">#{entry.rank}</span>
                <div className="flex items-center gap-3">
                  <Avatar image={entry.image} name={entry.name} sizeClass="h-9 w-9" />
                  <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                </div>
                <span className="text-right text-sm font-semibold text-gray-800">
                  {entry.approvedSubmissions}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
