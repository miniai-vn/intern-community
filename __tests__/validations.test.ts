import { describe, it, expect } from "vitest";
import { createCommentSchema, editCommentSchema } from "../src/lib/validations";

describe("Validations", () => {
  describe("createCommentSchema", () => {
    it("should pass with valid data", () => {
      const validData = {
        text: "This is a valid comment.",
        miniAppId: "clq9s8xz" // example cuid/id
      };
      
      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate and trim the comment string properly", () => {
      const dataWithSpaces = {
        text: "  Spaces will be trimmed   ",
        miniAppId: "clq9s8xz"
      };

      const result = createCommentSchema.safeParse(dataWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe("Spaces will be trimmed");
      }
    });

    it("should fail when text is empty after trimming", () => {
      const emptyTextData = {
        text: "   ",
        miniAppId: "clq9s8xz"
      };

      const result = createCommentSchema.safeParse(emptyTextData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Comment cannot be empty");
      }
    });

    it("should fail when text exceeds 1000 characters", () => {
      const longTextData = {
        text: "a".repeat(1001),
        miniAppId: "clq9s8xz"
      };
      
      const result = createCommentSchema.safeParse(longTextData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Comment must be at most 1000 characters");
      }
    });

    it("should fail when miniAppId is missing an empty string", () => {
      const missingIdData = {
        text: "Some text",
        miniAppId: ""
      };
      const result = createCommentSchema.safeParse(missingIdData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Module ID is required");
      }
    });

    it("should allow optional parentId for nested replies", () => {
      const withParentId = {
        text: "Reply to comment",
        miniAppId: "clq9s8xz",
        parentId: "some-parent-comment-id"
      };
      const result = createCommentSchema.safeParse(withParentId);
      expect(result.success).toBe(true);
    });
  });

  describe("editCommentSchema", () => {
    it("should pass with valid text", () => {
      const validData = {
        text: "Updated text"
      };
      const result = editCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail when text is empty after trimming", () => {
      const emptyData = {
        text: "   "
      };
      const result = editCommentSchema.safeParse(emptyData);
      expect(result.success).toBe(false);
    });
  });
});
