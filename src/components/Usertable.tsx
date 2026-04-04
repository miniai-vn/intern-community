"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (userId: string, data: { isLocked?: boolean; isAdmin?: boolean }) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // console.log("Error updating user:", errorData.error);
        throw new Error(errorData.error || "Error updating user");
      }
      toast.success("User has been updated!");
      router.refresh(); // Load lại dữ liệu mới nhất
    } catch (error : any) {
        // console.log(error);
      toast.error("Error updating user: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-900 text-left">Người dùng</th>
            <th className="px-4 py-2 font-medium text-gray-900 text-center">Quyền Admin</th>
            <th className="px-4 py-2 font-medium text-gray-900 text-center">Trạng thái Khóa</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {initialUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 flex items-center gap-3">
                <img src={user.image || "/avatar.png"} className="h-8 w-8 rounded-full" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </td>

              {/* Cột isAdmin */}
              <td className="px-4 py-2 text-center">
                <button
                  disabled={loadingId === user.id}
                  onClick={() => handleUpdate(user.id, { isAdmin: user.isAdmin ? false : true })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    user.isAdmin ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    user.isAdmin ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </td>

              {/* Cột isLocked */}
              <td className="px-4 py-2 text-center">
                <button
                  disabled={loadingId === user.id}
                  onClick={() => handleUpdate(user.id, { isLocked: !user.isLocked })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    user.isLocked ? "bg-red-600" : "bg-gray-200"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    user.isLocked ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}