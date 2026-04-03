import { describe, it, expect } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

// ============================================================
// generateSlug — already written as examples
// ============================================================

describe("generateSlug", () => {
  // ===== Test Cases Cơ Bản =====
  it("lowercases and hyphenates words", () => {
    expect(generateSlug("My Cool App")).toBe("my-cool-app");
  });

  it("strips special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  Hello  World  ")).toBe("hello-world");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  // ===== Edge Cases =====
  // Test case 1: Slug đã hợp lệ (không cần thay đổi)
  it("keeps already valid slugs unchanged", () => {
    expect(generateSlug("valid-slug-here")).toBe("valid-slug-here");
  });

  // Test case 2: Bảo toàn số trong slug (ví dụ: "App v2" -> "app-v2")
  it("preserves numbers in the slug", () => {
    expect(generateSlug("App v2.5 Release")).toBe("app-v25-release");
  });

  // Test case 3: Xử lý chuỗi trống (rỗng -> rỗng)
  it("handles empty string gracefully", () => {
    expect(generateSlug("")).toBe("");
  });

  // Test case 4: Xóa dấu gạch ngang thừa ở đầu/cuối (sau khi xóa ký tự đặc biệt)
  it("removes leading and trailing hyphens after special char removal", () => {
    expect(generateSlug("-Hello World-")).toBe("hello-world");
  });

  // Test case 5: Mix của tất cả - special chars, spaces, số, hoa/thường
  it("handles complex input with mixed cases", () => {
    expect(generateSlug("!@# Hello123 --- World @#$")).toBe("hello123-world");
  });

  // ===== MAX LENGTH TESTS =====
  // Test case 6: Input dài hơn 100 ký tự (shouldtruncate/limit)
  it("handles input at boundary (100 characters)", () => {
    const longInput = "a".repeat(100);
    const result = generateSlug(longInput);
    expect(result).toBe("a".repeat(100));
    expect(result.length).toBeLessThanOrEqual(100);
  });

  // Test case 7: Very long input (dài hơn 100)
  it("should handle very long input gracefully", () => {
    const veryLongInput = "The quick brown fox jumps over the lazy dog ".repeat(5);
    const result = generateSlug(veryLongInput);
    // Result should be valid slug (lowercase, hyphens, no special chars)
    expect(result).toMatch(/^[a-z0-9-]*$/);
  });
});

// ============================================================
// makeUniqueSlug — already written as examples
// ============================================================

describe("makeUniqueSlug", () => {
  it("returns the base slug when there are no conflicts", () => {
    expect(makeUniqueSlug("my-app", [])).toBe("my-app");
  });

  it("appends -1 when base slug is taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app"])).toBe("my-app-1");
  });

  it("increments the suffix when previous suffixes are taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1"])).toBe("my-app-2");
  });

  // TODO [easy-challenge]: Add test cases for:
  // 1. When many suffixed versions already exist (e.g. -1 through -5)
  // 2. When the existing list contains similar but non-conflicting slugs
  //    e.g. existing = ["my-app-tool"] should NOT block "my-app"
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

// TODO [easy-challenge]: Write a full test suite for `formatRelativeTime`.
// Requirements:
// - "just now" for dates less than 1 minute ago
// - "{n}m ago" for dates 1–59 minutes ago
// - "{n}h ago" for dates 1–23 hours ago
// - "{n}d ago" for dates 1–29 days ago
// - toLocaleDateString() format for dates 30+ days ago
//
// Hint: You'll need to mock or control `Date.now()` to make these tests
// deterministic. Look into Vitest's `vi.setSystemTime()`.
