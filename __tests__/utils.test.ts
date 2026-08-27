import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  it("keeps an already valid slug unchanged", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers", () => {
    expect(generateSlug("Version 2 App 2026")).toBe("version-2-app-2026");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading/trailing hyphens after normalization", () => {
    expect(generateSlug("---Hello---")).toBe("hello");
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

  it("finds the next available suffix when many are taken", () => {
    expect(
      makeUniqueSlug("my-app", [
        "my-app",
        "my-app-1",
        "my-app-2",
        "my-app-3",
        "my-app-4",
        "my-app-5",
      ])
    ).toBe("my-app-6");
  });

  it("ignores similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
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
  const NOW = new Date("2026-04-21T12:00:00.000Z");
  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns 'just now' for less than 1 minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const date = new Date(NOW.getTime() - 30_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });
  it("returns minutes for 1-59 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    expect(formatRelativeTime(new Date(NOW.getTime() - 1 * 60_000))).toBe("1m ago");
    expect(formatRelativeTime(new Date(NOW.getTime() - 59 * 60_000))).toBe("59m ago");
  });
  it("returns hours for 1-23 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    expect(formatRelativeTime(new Date(NOW.getTime() - 60 * 60_000))).toBe("1h ago");
    expect(formatRelativeTime(new Date(NOW.getTime() - 23 * 60 * 60_000))).toBe("23h ago");
  });
  it("returns days for 1-29 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    expect(formatRelativeTime(new Date(NOW.getTime() - 24 * 60 * 60_000))).toBe("1d ago");
    expect(formatRelativeTime(new Date(NOW.getTime() - 29 * 24 * 60 * 60_000))).toBe("29d ago");
  });
  it("returns locale date string for 30+ days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const date = new Date(NOW.getTime() - 30 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
