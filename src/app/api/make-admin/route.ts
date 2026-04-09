import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Set current user as admin
    await db.user.update({
      where: { id: session.user.id },
      data: { isAdmin: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "You are now an admin! Please refresh the page." 
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
