import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

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

  it("returns a name that is already a valid slug unchanged", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App123")).toBe("app123");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading/trailing hyphens after special character removal", () => {
    // "!@#hello$%^" → "hello" (special chars removed, leading/trailing hyphens stripped)
    expect(generateSlug("!@#hello$%^")).toBe("hello");
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

  it("finds the next available number when many versions exist", () => {
    expect(makeUniqueSlug("my-app", [
      "my-app",
      "my-app-1",
      "my-app-2",
      "my-app-3",
      "my-app-4",
      "my-app-5",
    ])).toBe("my-app-6");
  });

  it("does not block base slug when similar but non-conflicting slugs exist", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-app-maker"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than 1 minute ago', () => {
    const now = new Date("2026-04-08T10:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date("2026-04-08T09:59:30.000Z"); // 30 seconds ago
    expect(formatRelativeTime(past)).toBe("just now");
  });

  it("returns minutes ago for 1–59 minutes", () => {
    const now = new Date("2026-04-08T10:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date("2026-04-08T09:30:00.000Z"); // 30 minutes ago
    expect(formatRelativeTime(past)).toBe("30m ago");
  });

  it("returns hours ago for 1–23 hours", () => {
    const now = new Date("2026-04-08T10:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date("2026-04-08T03:00:00.000Z"); // 7 hours ago
    expect(formatRelativeTime(past)).toBe("7h ago");
  });

  it("returns days ago for 1–29 days", () => {
    const now = new Date("2026-04-08T10:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date("2026-04-01T10:00:00.000Z"); // 7 days ago
    expect(formatRelativeTime(past)).toBe("7d ago");
  });

  it("returns toLocaleDateString for 30+ days ago", () => {
    const now = new Date("2026-04-08T10:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date("2026-01-01T10:00:00.000Z"); // ~97 days ago
    const result = formatRelativeTime(past);
    // Should NOT contain "ago" — should be a date string
    expect(result).not.toMatch(/ago$/);
  });
});
