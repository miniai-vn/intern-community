import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { EditCommentInput } from "@/lib/validations";
import { Params } from "@/types";
import { NextRequest, NextResponse } from "next/server";



export const PATCH = async (req: NextRequest, { params }: Params ) => {
    
    try{
        const session = await auth()
        const body = await req.json() as EditCommentInput
        // console.log(params.id, body);
        const {id} = await params;
        // console.log("Comment ID:", id);
        if(!id) return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
        if (!session?.user)  return  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if(!body.content || body.content.length < 10 ) return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        const existingComment = await db.comment.findUnique({ where: { id: id} });
        // console.log(existingComment);
        if (!existingComment || existingComment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const updatedComment = await db.comment.update({
            where: { id: id},
            data: { content: body.content, isEdited: true }
        });
        return successResponse(updatedComment);
    }catch(err){
        console.error("Error updating comment:", err);
        return errorResponse("Internal Server Error", 500);
    }
    
}
export const DELETE = async (req: NextRequest, { params }: Params ) => {
    try{
        const session = await auth()
        if (!session?.user) return errorResponse("Unauthorized", 401);
        const { id } = await params;    
        if(!id) return errorResponse("Comment ID is required", 400);
        const existingComment = await db.comment.findUnique({ where: { id: id} });
        const isAdmin = session.user?.isAdmin;
        if (!existingComment || (existingComment.userId !== session.user.id && !isAdmin)) return errorResponse("Forbidden", 403);

        await db.comment.update({ where: { id: id},
        data: { content: "[deleted]", isDeleted: true } });
        return errorResponse("Comment deleted successfully", 200);
    }catch(err){
        console.error("Error deleting comment:", err);  
        return errorResponse("Internal Server Error", 500);
    }
    
}