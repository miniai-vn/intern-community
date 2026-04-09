import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get modules with demoUrl
    const modulesWithDemo = await db.miniApp.findMany({
      where: {
        demoUrl: {
          not: null,
        },
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        demoUrl: true,
        repoUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      modules: modulesWithDemo.map(module => ({
        id: module.id,
        name: module.name,
        demoUrl: module.demoUrl,
        repoUrl: module.repoUrl,
        slug: module.name.toLowerCase().replace(/\s+/g, '-'),
      })),
      count: modulesWithDemo.length,
    });
  } catch (error) {
    console.error('Error checking demo URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
