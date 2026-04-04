import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import { checkRateLimitUlti } from "@/lib/utils";
import { QuickUpdateUserInput } from "@/lib/validations";
import { Params } from "@/types";

import { NextRequest } from "next/server";
//quick update
export const PATCH = async (req: NextRequest, { params }: Params) => {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return errorResponse("Forbidden", 403);
    }
    if(!checkRateLimitUlti(session.user.id, 20, 60_000)) {
        return errorResponse("Too many requests. Please wait a moment.", 429);
    }
    const body = (await req.json()) as QuickUpdateUserInput;
    const { id } = await params;


    if (id === session.user.id) {
      return errorResponse("You cannot update yourself", 400);
    }

    const user = await db.user.findUnique({
      where: { id }
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const allowedFields = ["isLocked", "isAdmin"] as const;

    const providedFields = allowedFields.filter(
      (field) => body[field] !== undefined
    );//lọc ra những trường được phép cập nhật mà người dùng đã cung cấp

 
    if (providedFields.length === 0) {
      return errorResponse("No valid updates provided", 400);
    }

    // console.log(providedFields.length);
    if (providedFields.length > 1) {
      return errorResponse("Only one field can be updated at a time", 400);
    }

    const field = providedFields[0];

    if (body[field] === user[field]) {
      return errorResponse("No changes detected", 400);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        [field]: body[field]
      }
    });

    return successResponse(updatedUser);

  } catch (error) {
    console.error(error);
    return errorResponse("Internal Server Error", 500);
  }
};