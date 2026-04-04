import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  // Redirect to user's profile page where submissions are now displayed
  redirect(`/users/${session.user.id}`);
}
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{sub.name}</p>
                <p className="text-xs text-gray-400">
                  {sub.category.name} ·{" "}
                  {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    Feedback: {sub.feedback}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                  statusStyles[sub.status]
                }`}
              >
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
