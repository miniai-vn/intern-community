import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { formatFieldErrors, generateSlug, makeUniqueSlug } from "@/lib/utils";
import { createCatagoryInput, CreateCatagorySchema } from "@/lib/validations";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {//seach and get all
    try {
        const session = await auth();
        if(!session?.user?.isAdmin) return errorResponse("Forbidden", 403);
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("q");
        const limit = 10;
        const cursor = searchParams.get("cursor");
        const categories = await db.category.findMany({
            where: {
                ...(search ? { OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    {slug: { contains: search, mode: "insensitive" } },
                ]} : {})
            },
            take: limit + 1,
            // orderBy: { id: "desc" },
            ...(cursor ? { skip: 1, cursor: { id: cursor }} : {})
        });
        const hasMore = categories.length > limit;
        const items = hasMore ? categories.slice(0, limit) : categories;
        const nextCursor = hasMore ? items[items.length - 1].id : null;
        return successResponse({ items, nextCursor });
    } catch (error) {
        return errorResponse("Internal Server Error", 500);
    }
}
export const POST = async (req: NextRequest) => {
    try {
        const  session = await auth();
        if(!session?.user?.isAdmin) return errorResponse("Forbidden", 403);
        const body = await req.json() as createCatagoryInput;
        const  parse = CreateCatagorySchema.safeParse(body);
        if(!parse.success){
            const err = parse.error.flatten();
           const formattedErrors = formatFieldErrors(err);
            return errorResponse(formattedErrors, 400);
        }
        const {name} = body;
        const baseSlug = generateSlug(name);
        const existingSlugs = await db.category.findMany({
            where: {slug: {startsWith: baseSlug},
            },
            select : {slug: true},
        }).then((r)=> r.map((m)=> m.slug));//r là mang ket qua tu db la key va vlaue cua slug map chuyển thành mang duy nahtas
        const slug = makeUniqueSlug(baseSlug, existingSlugs);
        const catagory = await db.category.create({
            data: {
                name,
                slug
            }
        });
        return successResponse(catagory, 201);
    } catch (error) {
        return errorResponse("Internal Server Error", 500);
    }
}