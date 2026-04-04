export const revalidate = 600;

export const metadata = { title: "Leaderboard — Intern Community Hub" };

async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/leaderboard`, {
    next: { revalidate: 600 },
  } as RequestInit);
  if (!res.ok) return [];
  const data = await res.json();
  return data.contributors as {
    rank: number;
    userId: string;
    name: string;
    image: string | null;
    approvedCount: number;
  }[];
}

const rankStyles: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-gray-300 text-gray-800",
  3: "bg-amber-600 text-white",
};

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function LeaderboardPage() {
  const contributors = await getLeaderboard();
  const now = new Date();
  const monthLabel = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top contributors for {monthLabel} · ranked by approved submissions
        </p>
      </div>

      {contributors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No approved submissions this month yet.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {contributors.map((contributor) => (
            <li
              key={contributor.rank}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rankStyles[contributor.rank] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {contributor.rank}
              </span>

              <Avatar name={contributor.name} image={contributor.image} />

              <span className="flex-1 font-medium text-gray-900">
                {contributor.name}
              </span>

              <span className="text-sm text-gray-500">
                {contributor.approvedCount}{" "}
                {contributor.approvedCount === 1 ? "module" : "modules"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
