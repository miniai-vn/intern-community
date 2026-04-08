import { cn } from "@/lib/utils";

export type NotificationFilter = "all" | "read" | "unread";

type NotificationTabsProps = {
  value: NotificationFilter;
  onChange: (next: NotificationFilter) => void;
};

const tabs: Array<{ id: NotificationFilter; label: string }> = [
  { id: "all", label: "All noti" },
  { id: "read", label: "Read" },
  { id: "unread", label: "Unread" },
];

export function NotificationTabs({ value, onChange }: NotificationTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === tab.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
          aria-pressed={value === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
