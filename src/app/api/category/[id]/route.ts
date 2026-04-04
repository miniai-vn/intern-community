import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { formatFieldErrors, generateSlug, makeUniqueSlug } from "@/lib/utils";
import { createCatagoryInput, CreateCatagorySchema } from "@/lib/validations";
import { Params } from "@/types";
import { NextRequest } from "next/server";

export const  GET  = async(req: NextRequest, {params}: Params) => {
    try {
        const session = await auth();
        if(session?.user.isAdmin) return errorResponse("Forbidden", 403)
        const {id} = await params;
        const  category = await db.category.findUnique({
            where: {id},  
        })
        if(!category) return errorResponse("not Found", 404)
        return successResponse({category});
        
    } catch (error) {
        return errorResponse("Internal Server Error", 500);
    }
}
export const PATCH = async(req: NextRequest, {params} : Params) => {
    try {
        const session = await auth();
        if(!session?.user.isAdmin) return errorResponse("Forbidden", 403)
        const {id} = await params;
        const  category = await db.category.findUnique({
            where: {id},  
        })
        if(!category) return errorResponse("not Found Catagory", 404)
        const body = await req.json() as createCatagoryInput;
        const {name} = body;
        const  parse = CreateCatagorySchema.safeParse(body);
        if(!parse.success){
            const err = parse.error.flatten();
            const formattedErrors = formatFieldErrors(err);
            return errorResponse(formattedErrors, 400);
        }
        if(name  && name !== category.name ){
            const baseSlug = generateSlug(name);
            const existingSlugs = await db.category.findMany({
                where: {slug: {startsWith: baseSlug},
                },
                select : {slug: true},
            }).then((r)=> r.map((m)=> m.slug));
            const slug = makeUniqueSlug(baseSlug, existingSlugs);
            const item = await db.category.update({
                where : {id},
                data : {
                    name,
                    slug
                }
            });
            return successResponse(item)
        }
        return successResponse(category)
        
    } catch (error) {
        return errorResponse("Internal Server Error", 500);
    }
}
export const DELETE = async(req: NextRequest, {params} : Params)=> {
    try {
         const session = await auth();
        if(!session?.user.isAdmin) return errorResponse("Forbidden", 403)
        const {id} = await params;
        const category = await db.category.findUnique({
            where : {id},
            select: {id: true}
        });
        if(!category) return errorResponse("NOt found category", 404);
        const isInCategory = await db.miniApp.count({
            where :{ categoryId: category.id}
        })
        if(isInCategory > 0){
            return errorResponse("Cannot be deleted because there is a mini-app still inside the category.", 400);
        }
        await db.category.delete({
            where : {id}
        });
        return successResponse("Delete Success");
    } catch (error) {
        return errorResponse("Internal Server Error", 500);
    }
}
