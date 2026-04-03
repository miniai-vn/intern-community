import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 422 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 409 });
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: userId,
      },
    },
    create: {
      followerId: session.user.id,
      followingId: userId,
    },
    update: {},
  });

  const followerCount = await db.follow.count({ where: { followingId: userId } });

  return NextResponse.json({ following: true, followerCount });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 422 });
  }

  await db.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: userId,
    },
  });

  const followerCount = await db.follow.count({ where: { followingId: userId } });

  return NextResponse.json({ following: false, followerCount });
}
