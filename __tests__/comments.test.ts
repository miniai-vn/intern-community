import { describe, it, expect } from "vitest";
import {
  createCommentSchema,
  updateCommentSchema,
} from "@/lib/validations";

// ============================================================
// Comment Validation Tests
// ============================================================

describe("createCommentSchema", () => {
  describe("content validation", () => {
    it("accepts valid comment content", () => {
      const result = createCommentSchema.safeParse({
        content: "This is a great module!",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty content", () => {
      const result = createCommentSchema.safeParse({
        content: "",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Comment cannot be empty");
      }
    });

    it("rejects whitespace-only content", () => {
      const result = createCommentSchema.safeParse({
        content: "   ",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from content", () => {
      const result = createCommentSchema.safeParse({
        content: "  Hello world  ",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("Hello world");
      }
    });

    it("rejects content over 1000 characters", () => {
      const longContent = "a".repeat(1001);
      const result = createCommentSchema.safeParse({
        content: longContent,
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Comment must be at most 1000 characters"
        );
      }
    });

    it("accepts content exactly 1000 characters", () => {
      const maxContent = "a".repeat(1000);
      const result = createCommentSchema.safeParse({
        content: maxContent,
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("moduleId validation", () => {
    it("accepts valid CUID moduleId", () => {
      const result = createCommentSchema.safeParse({
        content: "Test comment",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid moduleId format", () => {
      const result = createCommentSchema.safeParse({
        content: "Test comment",
        moduleId: "invalid-id",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing moduleId", () => {
      const result = createCommentSchema.safeParse({
        content: "Test comment",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("parentId validation", () => {
    it("accepts comment without parentId (root comment)", () => {
      const result = createCommentSchema.safeParse({
        content: "Root comment",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBeUndefined();
      }
    });

    it("accepts valid CUID parentId (reply)", () => {
      const result = createCommentSchema.safeParse({
        content: "Reply comment",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
        parentId: "clyyyyyyyyyyyyyyy456",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid parentId format", () => {
      const result = createCommentSchema.safeParse({
        content: "Reply comment",
        moduleId: "clxxxxxxxxxxxxxxxxx123",
        parentId: "bad-id",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("updateCommentSchema", () => {
  it("accepts valid update content", () => {
    const result = updateCommentSchema.safeParse({
      content: "Updated comment content",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = updateCommentSchema.safeParse({
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from content", () => {
    const result = updateCommentSchema.safeParse({
      content: "  Updated content  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Updated content");
    }
  });

  it("rejects content over 1000 characters", () => {
    const result = updateCommentSchema.safeParse({
      content: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// Edge Cases & Security
// ============================================================

describe("comment content edge cases", () => {
  it("preserves newlines in content", () => {
    const result = createCommentSchema.safeParse({
      content: "Line 1\nLine 2\nLine 3",
      moduleId: "clxxxxxxxxxxxxxxxxx123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toContain("\n");
    }
  });

  it("preserves unicode characters", () => {
    const result = createCommentSchema.safeParse({
      content: "Great module! 🎉 Rất tuyệt vời 👍",
      moduleId: "clxxxxxxxxxxxxxxxxx123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Great module! 🎉 Rất tuyệt vời 👍");
    }
  });

  it("accepts content with special characters", () => {
    const result = createCommentSchema.safeParse({
      content: "Check out https://example.com & read the docs!",
      moduleId: "clxxxxxxxxxxxxxxxxx123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts content with code snippets", () => {
    const result = createCommentSchema.safeParse({
      content: "```js\nconst x = 1;\n```",
      moduleId: "clxxxxxxxxxxxxxxxxx123",
    });
    expect(result.success).toBe(true);
  });
});
