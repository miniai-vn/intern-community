import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activity — recent community activity (comments + votes + submissions)
export async function GET() {
  const [recentComments, recentVotes, recentSubmissions] = await Promise.all([
    db.comment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        miniApp: { select: { slug: true, name: true } },
      },
    }),
    db.vote.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        module: { select: { slug: true, name: true } },
      },
    }),
    db.miniApp.findMany({
      take: 5,
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  // Merge and sort by time
  const activities = [
    ...recentComments.map((c: any) => ({
      type: "comment" as const,
      id: c.id,
      user: c.author,
      moduleSlug: c.miniApp.slug,
      moduleName: c.miniApp.name,
      preview: c.text.length > 60 ? c.text.slice(0, 60) + "…" : c.text,
      createdAt: c.createdAt,
    })),
    ...recentVotes.map((v: any) => ({
      type: "vote" as const,
      id: v.id,
      user: v.user,
      moduleSlug: v.module.slug,
      moduleName: v.module.name,
      preview: null,
      createdAt: v.createdAt,
    })),
    ...recentSubmissions.map((s: any) => ({
      type: "submission" as const,
      id: s.id,
      user: s.author,
      moduleSlug: s.slug,
      moduleName: s.name,
      preview: null,
      createdAt: s.createdAt,
    })),
  ]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return NextResponse.json(activities);
}
