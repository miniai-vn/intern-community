import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { formatFieldErrors } from "@/lib/utils";
import { CommentInput, commentSchema } from "@/lib/validations";
import { NextRequest } from "next/server";
export const eventhandler = () => {}

export const GET = async(req: NextRequest )=>{
    try{
        const { searchParams } = new URL(req.url) ;//lấy query
        const appId = searchParams.get("appId");
        const cursor = searchParams.get("cursor");
        const limit = 10;
        if(!appId){
           return errorResponse("appId query parameter is required", 400);
        }
        const comments = await db.comment.findMany({
            where: {
                appId,
                isDeleted: false
            },
            include: {
                user: {select: { id: true, name: true, email: true, image: true }}
            },
            orderBy: {createdAt: "desc"},
            take: limit + 1,
            ...(cursor ? { skip: 1, cursor: { id: cursor }} : {})//nếu có curso thì skip ko bỏ qua : {})
        });
        
        const hasMore = comments.length > limit;//nếu  lớn hơn limit thì còn tiếp
        const items  = hasMore ? comments.slice(0, limit) : comments;
        const nextCursor = hasMore ? items[items.length - 1].id : null;//nếu còn tiếp thì lấy id của phần tử cuối cùng làm cursor tiếp theo
        return successResponse({ items, nextCursor });
       
    }catch(err){
        console.error("Error fetching comments:", err);
        return errorResponse("Internal Server Error", 500);
    }
    
}
export const POST = async(req: NextRequest)=>{
    
    try {
        const  session = await auth();
        if(!session?.user){
            return errorResponse("Unauthorized", 401);
        }
        const body = await req.json() as CommentInput;
        const parse = commentSchema.safeParse(body);
        console.log("Parsed comment input:", parse);
        if(!parse.success){
            const err = parse.error.flatten();
            const formattedErrors = formatFieldErrors(err);
            return errorResponse(formattedErrors, 400);
        }
        const existingApp = await db.miniApp.findUnique({ where: { id: parse.data.appId } });
        if(!existingApp){
            return errorResponse("App not found", 404);
        }  
        const result  = await db.$transaction(async (tx) => {
             
            const  comment = await tx.comment.create({
                data: {
                    content : parse.data.content,
                    appId: parse.data.appId,
                    userId: session.user.id
                },
                include: {
                    user: {select: { id: true, name: true, email: true, image: true }}  
                }
            });
            await tx.miniApp.update({
                where: { id: parse.data.appId },
                data: { commentCount: { increment: 1 } }
            });
           return comment;
        });
         return successResponse(result, 201);

       
    } catch (error) {
        console.error("Error creating comment:", error);
        return errorResponse("Internal Server Error", 500);
    }
    
}