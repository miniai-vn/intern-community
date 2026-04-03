/**
 * ===== PASSWORD STRENGTH CHECKER API =====
 * 
 * API endpoint để kiểm tra độ mạnh của mật khẩu
 * Input: { password: string }
 * Output: { strength, score, suggestions, checks }
 */

import { analyzePassword } from "@/lib/password";
import { z } from "zod";

const passwordSchema = z.object({
  password: z
    .string()
    .min(1, "Mật khẩu không thể trống")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = passwordSchema.parse(body);

    // Phân tích mật khẩu
    const analysis = analyzePassword(password);

    return Response.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      const errorMessage = firstError
        ? `${firstError.path.join(".")} - ${firstError.message}`
        : "Invalid input";

      return Response.json(
        {
          success: false,
          error: "Validation failed",
          details: errorMessage,
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return Response.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    console.error("Password analysis error:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
