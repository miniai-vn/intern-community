"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetAdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function setAdmin() {
      try {
        const res = await fetch("/api/dev/set-admin", { method: "POST" });
        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/admin"), 1500);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }
    setAdmin();
  }, [router]);

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
      {status === "loading" && (
        <>
          <div className="text-4xl">⏳</div>
          <h1 className="text-xl font-bold">Setting Admin...</h1>
          <p className="text-gray-500">Please wait...</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-green-600">Admin Set!</h1>
          <p className="text-gray-500">Redirecting to admin panel...</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl">❌</div>
          <h1 className="text-xl font-bold text-red-600">Error</h1>
          <p className="text-gray-500">Failed to set admin. Are you logged in?</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Home
          </button>
        </>
      )}
    </div>
  );
}