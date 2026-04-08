import useSWR from "swr";
import { useState, useRef, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 60000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    setIsOpen(!isOpen);

    if (!isOpen && data?.unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      mutate();
    }
  };

  if (!data) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {data.unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {data.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="border-b border-gray-100 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {data.notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                You have no notifications.
              </p>
            ) : (
              data.notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                    n.isRead ? "opacity-70" : "bg-blue-50/50"
                  }`}
                >
                  <p
                    className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}
                  >
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
