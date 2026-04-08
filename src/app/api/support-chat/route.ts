import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Role = "user" | "model";

type IncomingMessage = {
  role: Role;
  content: string;
};

type RequestBody = {
  threadId: string;
  messages: IncomingMessage[];
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function trySolveBasicMath(input: string) {
  const text = input
    .toLowerCase()
    .replaceAll("×", "*")
    .replaceAll("x", "*")
    .replaceAll("÷", "/");

  // Match patterns like: 3 + 3, 10-2, 4*5, 9 / 3
  const m = text.match(/(-?\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return null;

  const a = Number(m[1]);
  const op = m[2];
  const b = Number(m[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  let res: number;
  switch (op) {
    case "+":
      res = a + b;
      break;
    case "-":
      res = a - b;
      break;
    case "*":
      res = a * b;
      break;
    case "/":
      if (b === 0) return "Không thể chia cho 0.";
      res = a / b;
      break;
    default:
      return null;
  }

  // Avoid very long floating outputs.
  const pretty = Number.isInteger(res) ? String(res) : String(Number(res.toFixed(6)));
  return `${m[1]} ${m[2]} ${m[3]} = ${pretty}`;
}

export async function POST(req: NextRequest) {
  if (!genAI) {
    return badRequest("Gemini API key is not configured on the server.", 500);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!body.threadId || !Array.isArray(body.messages) || body.messages.length === 0) {
    return badRequest("threadId and messages are required.");
  }

  // Simple in-memory rate limit per IP (best-effort only)
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `support-chat:${ip}`;
  const store: Map<string, { count: number; resetAt: number }> =
    (globalThis as unknown as { __supportRateLimitStore?: Map<string, { count: number; resetAt: number }> })
      .__supportRateLimitStore ?? new Map();
  (globalThis as unknown as { __supportRateLimitStore: Map<string, { count: number; resetAt: number }> })
    .__supportRateLimitStore = store;

  const now = Date.now();
  const windowMs = 60_000;
  const limit = 20;
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    if (current.count >= limit) {
      return badRequest("Too many requests. Please slow down.", 429);
    }
    current.count += 1;
    store.set(key, current);
  }

  // Transform messages into Gemini format. We only keep the last 10 turns
  // to avoid sending excessively long histories.
  const recentMessages = body.messages.slice(-10);

  const lastUserMessage = [...recentMessages].reverse().find((m) => m.role === "user");
  if (lastUserMessage?.content) {
    const math = trySolveBasicMath(lastUserMessage.content);
    if (math) {
      return NextResponse.json({
        threadId: body.threadId,
        reply: math,
      });
    }
  }

  const history = recentMessages
    .filter((m) => m.role === "user" || m.role === "model")
    .map((m) => ({
      role: m.role === "user" ? "user" : "model" as const,
      parts: [{ text: m.content }],
    }));

  const systemInstruction =
    [
      "Bạn là chatbot trong ứng dụng Intern Community Hub.",
      "Ưu tiên chính:",
      "- Hỗ trợ người dùng về dự án này: cách chạy local (Node, pnpm, Docker, .env, Prisma, NextAuth),",
      "  các luồng browse/submit/My Submissions/admin review/vote, và debug lỗi thường gặp.",
      "Yêu cầu:",
      "- Bạn vẫn có thể trả lời các câu hỏi ngoài phạm vi dự án (ví dụ: toán học, kiến thức chung).",
      "- Nếu câu hỏi ngoài phạm vi dự án, hãy trả lời bình thường nhưng có thể mở đầu ngắn gọn rằng câu hỏi không liên quan trực tiếp tới Intern Community Hub.",
      "- Ưu tiên trả lời tiếng Việt, rõ ràng, súc tích.",
    ].join("\n");

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
    });

    const last = recentMessages[recentMessages.length - 1]!;

    const result = await model.generateContent({
      contents: history,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512,
      },
      safetySettings: [],
    });

    const response = result.response;
    const text = response.text().trim();

    // Fallback if model returned empty.
    const reply =
      text ||
      "Mình chưa nhận được nội dung trả lời từ Gemini. Bạn thử gửi lại câu hỏi (hoặc hỏi theo cách khác) nhé.";

    return NextResponse.json({
      threadId: body.threadId,
      reply,
      echo: last.content,
    });
  } catch (err) {
    console.error("[support-chat] Gemini error", err);

    const msg = (err as { message?: string } | undefined)?.message ?? "";
    const isQuotaOrRateLimit =
      msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate");

    // If Gemini is rate-limited / out of quota, return a friendly fallback instead
    // of 500 so the UI doesn't break.
    if (isQuotaOrRateLimit) {
      return NextResponse.json({
        threadId: body.threadId,
        reply:
          "Hiện tại Gemini đang hết quota / bị giới hạn tần suất. Bạn hãy thử lại sau hoặc chọn các gợi ý trong khung chat để nhận hướng dẫn nhanh.",
      });
    }

    return badRequest(
      "Hiện chatbot đang gặp sự cố khi gọi Gemini API. Vui lòng thử lại sau.",
      500,
    );
  }
}

