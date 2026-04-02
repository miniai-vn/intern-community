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
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date("2026-04-02T11:59:45.000Z"))).toBe("just now");
  });

  it('returns minutes for dates 1-59 minutes ago', () => {
    expect(formatRelativeTime(new Date("2026-04-02T11:45:00.000Z"))).toBe("15m ago");
  });

  it('returns hours for dates 1-23 hours ago', () => {
    expect(formatRelativeTime(new Date("2026-04-02T06:00:00.000Z"))).toBe("6h ago");
  });

  it('returns days for dates 1-29 days ago', () => {
    expect(formatRelativeTime(new Date("2026-03-29T12:00:00.000Z"))).toBe("4d ago");
  });

  it('falls back to locale date string for dates 30+ days ago', () => {
    const date = new Date("2026-03-01T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
