import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

// ─── Prompt ─────────────────────────────────────────────────────────────────
const MODERATION_PROMPT = (text: string) => `
Analyze the following text and determine if it contains ANY severe profanity, heavy insults, or extremely abusive language in any language (especially Vietnamese or English).
Examples of violations include heavy swearing, racial slurs, death threats, or explicit obscenity.
Mild negative opinions or constructive criticisms are fine.

Text: "${text}"

Reply with exactly one word: "YES" if it contains severe profanity/insults, or "NO" if it is clean.
`;

// ─── Provider 1: DeepSeek (primary) ─────────────────────────────────────────
async function checkWithDeepSeek(text: string): Promise<{ hasProfanity: boolean; model: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: MODERATION_PROMPT(text) }],
      max_tokens: 5,
      temperature: 0,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const answer: string = data.choices?.[0]?.message?.content?.trim().toUpperCase() ?? "";

  return {
    hasProfanity: answer.includes("YES"),
    model: "deepseek-chat",
  };
}

// ─── Provider 2: Gemini (backup) ────────────────────────────────────────────
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];

async function checkWithGemini(text: string): Promise<{ hasProfanity: boolean; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr: any;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(MODERATION_PROMPT(text));
      const answer = result.response.text().trim().toUpperCase();
      return { hasProfanity: answer.includes("YES"), model: modelName };
    } catch (err: any) {
      console.warn(`[Moderation] Gemini model ${modelName} failed: ${err.message}`);
      lastErr = err;
    }
  }

  throw new Error(`All Gemini models failed. Last: ${lastErr?.message}`);
}

// ─── Orchestrator: try DeepSeek → fallback Gemini ───────────────────────────
async function executeProfanityCheck(text: string): Promise<{ hasProfanity: boolean; model: string }> {
  // 1. Try DeepSeek first
  try {
    return await checkWithDeepSeek(text);
  } catch (err: any) {
    console.warn(`[Moderation] DeepSeek failed, falling back to Gemini. Reason: ${err.message}`);
  }

  // 2. Fallback to Gemini
  try {
    return await checkWithGemini(text);
  } catch (err: any) {
    console.warn(`[Moderation] Gemini also failed. Reason: ${err.message}`);
  }

  // 3. Both failed
  throw new Error("All AI moderation providers failed (DeepSeek + Gemini).");
}

// ─── Background moderation task ─────────────────────────────────────────────
/**
 * Checks a comment for profanity in the background.
 * - If profanity found → deletes comment + notifies user.
 * - If clean → marks comment as PASSED.
 * - If all providers fail → logs error in ModerationLog for retry.
 *
 * This function returns a Promise. You MUST use `waitUntil()` in the
 * calling route to ensure this runs to completion.
 */
export async function checkAndModerateComment(
  commentId: string,
  text: string,
  userId: string
): Promise<void> {
  try {
    const { hasProfanity, model } = await executeProfanityCheck(text);

    if (hasProfanity) {
      // Notify the user with the specific reason
      await db.notification.create({
        data: {
          userId,
          message: `Bình luận "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}" của bạn chứa từ ngữ vi phạm tiêu chuẩn cộng đồng và đã bị hệ thống gỡ bỏ. (Checked by ${model})`,
        },
      });
      // Remove the offending comment
      await db.comment.delete({ where: { id: commentId } });
      console.log(`[Moderation] Comment ${commentId} DELETED (profanity detected by ${model})`);
    } else {
      // Mark as passed
      await db.comment.update({
        where: { id: commentId },
        data: { moderationStatus: "PASSED", moderationError: null },
      });
      console.log(`[Moderation] Comment ${commentId} PASSED (checked by ${model})`);
    }
  } catch (err: any) {
    console.error(`[Moderation] FAILED for comment ${commentId}:`, err.message);

    // Log the error for future retry — only store essential info
    try {
      await db.moderationLog.create({
        data: {
          commentId,
          errorMsg: err.message || "Unknown moderation error",
        },
      });

      await db.comment.update({
        where: { id: commentId },
        data: {
          moderationStatus: "FAILED",
          moderationError: err.message || "All providers failed",
        },
      });
    } catch (dbErr) {
      console.error("[Moderation] Could not log error to DB:", dbErr);
    }
  }
}
