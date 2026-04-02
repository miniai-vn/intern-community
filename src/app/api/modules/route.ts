import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, categorySlug, repoUrl, authorName } = body;

    if (!name || !description || !categorySlug || !repoUrl || !authorName) {
      return NextResponse.json({ error: "Thiếu thông tin. Vui lòng kiểm tra lại!" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    const newModule = await prisma.module.create({
      data: {
        name,
        description,
        slug: name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
        repoUrl,
        categoryId: category?.id || "",
        authorName: authorName,
        voteCount: 0,
      },
    });

    return NextResponse.json(newModule);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server!" }, { status: 500 });
  }
}