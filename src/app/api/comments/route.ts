import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations";
import { checkAndModerateComment } from "@/lib/moderation";

/**
 * Hàm đệ quy để chuyển mảng phẳng các comment thành cấu trúc cây.
 * @param allComments Danh sách toàn bộ comment (phẳng)
 * @param parentId ID của comment cha (mặc định là null cho các comment gốc)
 */
function buildCommentTree(allComments: any[], parentId: string | null = null): any[] {
  return allComments
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      ...c,
      // Đệ quy để tìm các phản hồi của comment hiện tại
      replies: buildCommentTree(allComments, c.id),
    }))
    // Sắp xếp replies theo thời gian tăng dần (cũ trước mới sau)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// GET /api/comments?miniAppId=xxx — list comments for a module (infinite nesting)
export async function GET(req: NextRequest) {
  const miniAppId = req.nextUrl.searchParams.get("miniAppId");
  if (!miniAppId) {
    return NextResponse.json({ error: "miniAppId is required" }, { status: 400 });
  }

  // Lấy toàn bộ comment của module (không lọc parentId ở tầng DB)
  const allComments = await db.comment.findMany({
    where: { miniAppId },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
    // Sắp xếp gốc theo mới nhất (desc), các replies sẽ được sort lại trong hàm buildTree
    orderBy: { createdAt: "desc" },
  });

  // Xây dựng cây comment bằng đệ quy
  const commentTree = buildCommentTree(allComments, null);

  return NextResponse.json(commentTree);
}

// POST /api/comments — create a new comment
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { text, miniAppId, parentId } = parsed.data;

  // Nếu là phản hồi, chỉ cần đảm bảo comment cha tồn tại.
  // Đã bỏ giới hạn single-level nesting để hỗ trợ lồng nhau vô hạn.
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await db.comment.create({
    data: {
      text,
      miniAppId,
      authorId: session.user.id,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: true,
    },
  });

  // Schedule background moderation using Next.js after()
  after(async () => {
    await checkAndModerateComment(comment.id, comment.text, session.user.id);
  });

  return NextResponse.json(comment, { status: 201 });
}
