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
// formatRelativeTime — Testing time-based logic
// ============================================================

describe("formatRelativeTime", () => {
  // Thiết lập thời gian giả định: Wednesday, April 8, 2026, 10:00:00 AM
  const MOCK_NOW = new Date("2026-04-08T10:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for dates less than 1 minute ago", () => {
    const thirtySecondsAgo = new Date(MOCK_NOW.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe("just now");
  });

  it("returns '{n}m ago' for dates 1–59 minutes ago", () => {
    const tenMinutesAgo = new Date(MOCK_NOW.getTime() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo)).toBe("10m ago");
  });

  it("returns '{n}h ago' for dates 1–23 hours ago", () => {
    const fiveHoursAgo = new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveHoursAgo)).toBe("5h ago");
  });

  it("returns '{n}d ago' for dates 1–29 days ago", () => {
    const threeDaysAgo = new Date(MOCK_NOW.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("returns locale date string for dates 30+ days ago", () => {
    const fortyDaysAgo = new Date(MOCK_NOW.getTime() - 40 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(fortyDaysAgo);
    expect(result).not.toContain("ago");
    expect(result).toBe(fortyDaysAgo.toLocaleDateString());
  });
});
