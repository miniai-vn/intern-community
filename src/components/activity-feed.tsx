import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export async function ActivityFeed() {
  const activities = await db.activity.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { 
      user: true 
    }
  });


  const getActionLabel = (type: string) => {
    switch (type) {
      case "COMMENT": return "commented on a module";
      case "VOTE": return "voted for a module";
      case "SUBMIT": return "submitted a new module";
      default: return `performed a ${type.toLowerCase()}`;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-[#161b22] shadow-sm">
      <h3 className="font-bold text-sm mb-4 text-gray-900 dark:text-gray-100">
        Community Activity
      </h3>
      
      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex gap-3 text-xs">
            {/* User Avatar Placeholder */}
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
              {act.user.name?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col gap-0.5">
              <p className="text-gray-700 dark:text-gray-300 leading-snug">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {act.user.name}
                </span>{" "}
                {getActionLabel(act.type)}
              </p>
              <p className="text-[10px] text-gray-500">
                {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-4 italic text-xs">
            No recent activity.
          </p>
        )}
      </div>
    </div>
  );
}