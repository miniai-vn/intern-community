export function NotificationItem({ note }: { note: any }) {
  return (
    <div
      className={`p-4 border-b transition cursor-pointer ${
        note.isRead
          ? "bg-white text-gray-400"
          : "bg-blue-50 border-l-4 border-l-blue-500"
      }`}
    >
      <div className="flex justify-between items-start">
        <h4
          className={`text-sm ${!note.isRead ? "font-bold text-gray-900" : ""}`}
        >
          {note.title}
        </h4>
        <span className="text-[10px]">
          {new Date(note.createdAt).toLocaleDateString("Vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-xs mt-1">{note.message}</p>
    </div>
  );
}
