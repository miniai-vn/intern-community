import { formatRelativeTime, generateSlug, makeUniqueSlug } from "@/lib/utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ============================================================
// generateSlug — already written as examples
// ============================================================

describe("generateSlug", () => {
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

  // TODO [easy-challenge]: Add test cases for the following:
  // 1. A name that is already a valid slug (no changes needed)
  // 2. A name with numbers (numbers should be preserved)
  // 3. An empty string (what should the output be? Check the implementation)
  // 4. A name with leading/trailing hyphens after special char removal
  //
  // Hint: read `src/lib/utils.ts` to understand the exact transformation rules
  // before writing your assertions.

  it("returns same string when name is already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in slug", () => {
    expect(generateSlug("App 2.0 Version 3")).toBe("app-20-version-3");
  });

  it("returns empty string when input is empty", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles leading/trailing hyphens after special char removal", () => {
    // Special chars at start/end become hyphens then get stripped
    expect(generateSlug("!Hello World!")).toBe("hello-world");
    expect(generateSlug("-Hello-")).toBe("hello");
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

  it("handles many suffixed versions already exist", () => {
    const existing = [
      "my-app",
      "my-app-1",
      "my-app-2",
      "my-app-3",
      "my-app-4",
      "my-app-5",
    ];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not block when similar but non-conflicting slugs exist", () => {
    const existing = ["my-app-tool", "my-app-plugin", "other-app"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app");
  });
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

describe("formatRelativeTime", () => {
  const mockNow = new Date("2024-01-01T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than 1 minute ago', () => {
    const date = new Date(mockNow - 30 * 1000); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "1m ago" for exactly 1 minute ago', () => {
    const date = new Date(mockNow - 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it('returns "5m ago" for 5 minutes ago', () => {
    const date = new Date(mockNow - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it('returns "59m ago" for 59 minutes ago', () => {
    const date = new Date(mockNow - 59 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it('returns "1h ago" for exactly 1 hour ago', () => {
    const date = new Date(mockNow - 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it('returns "5h ago" for 5 hours ago', () => {
    const date = new Date(mockNow - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5h ago");
  });

  it('returns "23h ago" for 23 hours ago', () => {
    const date = new Date(mockNow - 23 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  it('returns "1d ago" for exactly 1 day ago', () => {
    const date = new Date(mockNow - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });

  it('returns "5d ago" for 5 days ago', () => {
    const date = new Date(mockNow - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5d ago");
  });

  it('returns "29d ago" for 29 days ago', () => {
    const date = new Date(mockNow - 29 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("29d ago");
  });

  it("returns formatted date for 30 days or more", () => {
    const date = new Date("2023-12-01T12:00:00Z"); // 31 days before mockNow
    const result = formatRelativeTime(date);
    // Should return something like "12/1/2023" or "1/12/2023" depending on locale
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it("returns 'just now' for future dates", () => {
    const date = new Date(mockNow + 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns formatted date for dates older than 30 days", () => {
    const date = new Date("2023-12-01T12:00:00Z");
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
