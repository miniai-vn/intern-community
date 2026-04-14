import { loadLeaderboard } from "../api/leaderboard/route";

export const revalidate = 600;

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-teal-100 text-teal-800",
  "bg-pink-100 text-pink-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Avatar({
  user,
  size = "md",
  colorIdx = 0,
}: {
  user?: { name?: string | null; image?: string | null } | null;
  size?: "sm" | "md" | "lg";
  colorIdx?: number;
}) {
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  }[size];

  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];

  if (user?.image) {
    return (
      <img
        src={user.image}
        alt={user.name ?? ""}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-medium flex-shrink-0`}
    >
      {getInitials(user?.name)}
    </div>
  );
}

const RING_CLASS = [
  "ring-2 ring-amber-400",
  "ring-2 ring-blue-300",
  "ring-1 ring-gray-300",
];

const CHIP_CLASS = [
  "bg-amber-50 text-amber-800 border border-amber-300",
  "bg-blue-50 text-blue-800 border border-blue-200",
  "bg-gray-100 text-gray-600 border border-gray-200",
];

const POD_BORDER = [
  "border border-amber-300",
  "border border-blue-200",
  "border border-gray-200",
];

export default async function LeaderboardPage() {
  const now = new Date();

  const result = await loadLeaderboard(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    10,
  );

  const top3 = result.slice(0, 3);
  const rest = result.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const podiumMeta = [
    {
      chipCls: CHIP_CLASS[1],
      ringCls: RING_CLASS[1],
      borderCls: POD_BORDER[1],
      marginTop: "mt-5",
    },
    {
      chipCls: CHIP_CLASS[0],
      ringCls: RING_CLASS[0],
      borderCls: POD_BORDER[0],
      marginTop: "",
    },
    {
      chipCls: CHIP_CLASS[2],
      ringCls: RING_CLASS[2],
      borderCls: POD_BORDER[2],
      marginTop: "mt-9",
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-medium tracking-widest text-gray-400 uppercase border border-gray-200 rounded-full px-3 py-1">
          {now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
        </span>
        <h1 className="text-2xl font-serif font-normal text-gray-900 tracking-tight">
          Contributor Leaderboard
        </h1>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 items-end">
          {podiumOrder.map((entry, i) => {
            const meta = podiumMeta[i];
            return (
              <div
                key={entry?.user?.id ?? i}
                className={`flex flex-col items-center ${meta.borderCls} bg-white rounded-2xl px-3 py-5 relative ${meta.marginTop}`}
              >
                {/* Rank chip */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.chipCls}`}
                >
                  #{entry?.rank}
                </div>

                {/* Avatar with ring */}
                <div
                  className={`rounded-full ${meta.ringCls} ring-offset-2 mb-3`}
                >
                  <Avatar
                    user={entry?.user}
                    size="lg"
                    colorIdx={(entry?.rank ?? 1) - 1}
                  />
                </div>

                <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {entry?.user?.name ?? "Unknown"}
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1 leading-none">
                  {entry?.count}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">modules</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Hạng 4 – 10
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Rest list */}
      <div className="flex flex-col gap-1.5">
        {rest.map((entry) => (
          <div
            key={entry.user?.id ?? entry.rank}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-400 w-4 text-center flex-shrink-0">
              {entry.rank}
            </span>

            <Avatar user={entry.user} size="sm" colorIdx={entry.rank - 1} />

            <span className="text-sm font-medium text-gray-900 flex-1 truncate">
              {entry.user?.name ?? "Unknown"}
            </span>

            <span className="text-sm font-semibold text-gray-700 tabular-nums">
              {entry.count}
              <span className="text-xs font-normal text-gray-400 ml-1">
                modules
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
