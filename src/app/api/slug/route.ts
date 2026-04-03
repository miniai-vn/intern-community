import { generateSlug } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

/**
 * ===== SLUG GENERATOR API =====
 * 
 * Hàm này xử lý yêu cầu POST để tạo slug từ text input
 * 
 * Input: { name: "Hello World!" }
 * Output: { slug: "hello-world" }
 */

// ===== VALIDATION SCHEMA =====
// Zod schema để validate input từ client
const slugRequestSchema = z.object({
  // `name` phải là string, có độ dài từ 1-100 ký tự
  name: z
    .string()
    .min(1, "Name không thể trống")
    .max(100, "Name tối đa 100 ký tự"),
});

// ===== API HANDLER =====
/**
 * POST /api/slug
 * 
 * @param req - HTTP request từ client
 * @returns JSON response chứa slug được tạo
 * 
 * @example
 * // Request
 * POST /api/slug
 * Content-Type: application/json
 * 
 * { "name": "My Cool App" }
 * 
 * // Response (200 OK)
 * { "slug": "my-cool-app" }
 * 
 * // Response (400 Bad Request) nếu validation fail
 * { "error": "Name không thể trống" }
 */
export async function POST(req: Request) {
  try {
    // 0️⃣ Rate limit check
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip)) {
      return Response.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 } // 429 Too Many Requests
      );
    }

    // 1️⃣ Parse JSON body từ request
    const body = await req.json();

    // 2️⃣ Validate input bằng Zod schema
    // Nếu fail, sẽ throw error với message chi tiết
    const { name } = slugRequestSchema.parse(body);

    // 3️⃣ Tạo slug từ input
    const slug = generateSlug(name);

    // 4️⃣ Return slug đã tạo
    return Response.json({
      success: true,
      slug,
      // Đưa thêm input gốc để debug
      original: name,
    });
  } catch (error) {
    // ===== ERROR HANDLING =====
    
    // Nếu là lỗi validation từ Zod
    if (error instanceof z.ZodError) {
      // Lấy message của lỗi đầu tiên
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
        { status: 400 } // 400 Bad Request
      );
    }

    // Nếu lỗi khác (ví dụ: JSON parse fail)
    if (error instanceof SyntaxError) {
      return Response.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    // ===== SERVER ERROR =====
    // Lỗi không mong muốn - log và return 500
    console.error("Slug generation error:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 } // 500 Internal Server Error
    );
  }
}
