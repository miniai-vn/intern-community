import { revalidatePath } from "next/cache";

// POST /api/revalidate/leaderboard  - revalidate leaderboard
export async function POST(req: Request) {
  const secret = req.headers.get("x-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidatePath("/leaderboard");

  return Response.json({ revalidated: true });
}
