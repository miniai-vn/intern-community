import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { NextRequest } from "next/server"


export const GET = async (req: NextRequest) => {
    try {
        const session = await auth();
        if(!session?.user.isAdmin) return errorResponse("Forbidden", 403);
        const {searchParams} = new URL(req.url);
        const search = searchParams.get("q");
        const limit = 10;
        const cursor = searchParams.get("cursor");  
        const users = await db.user.findMany({
            where : {
                ...(search ?
                    {OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ]} : {}
                )
            },
            select: { id: true, name: true, email: true, image: true, isAdmin: true, isLocked: true },
            take: limit + 1,
            orderBy: { createdAt: "desc" },
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = users.length > limit;
        const items = hasMore ? users.slice(0, limit) : users;
        const nextCursor = hasMore ? items[items.length - 1].id : null;
        return successResponse({ items, nextCursor });
    } catch (error: any) {
        console.log(error.message);
        return errorResponse("Internal Server Error", 500);
    }
}