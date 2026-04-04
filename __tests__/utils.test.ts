import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

// ============================================================
// generateSlug
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

  // [easy-challenge] TODO completions ↓

  it("returns the same slug when input is already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App v2 Release")).toBe("app-v2-release");
    expect(generateSlug("123 Numbers")).toBe("123-numbers");
  });

  it("returns an empty string for an empty input", () => {
    // The implementation strips all chars and trims hyphens → result is ""
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special char removal", () => {
    // "!hello!" → after removing special chars: "hello" → no leading/trailing hyphens
    expect(generateSlug("!hello!")).toBe("hello");
    // "---" → only hyphens remain after collapse, stripped by ^-|-$ → ""
    expect(generateSlug("---")).toBe("");
  });
});

// ============================================================
// makeUniqueSlug
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

  // [easy-challenge] TODO completions ↓

  it("skips to the next available suffix when many suffixes are taken", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not treat similar-but-non-conflicting slugs as conflicts", () => {
    // "my-app-tool" shares a prefix but is NOT the same as "my-app"
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
    // "myapp" is also not a conflict
    expect(makeUniqueSlug("my-app", ["myapp"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  // Pin Date.now() to a fixed point in time for deterministic tests
  const NOW = new Date("2024-06-15T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a date less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date(NOW - 30_000))).toBe("just now");
  });

  it('returns "just now" for a date exactly 0 seconds ago', () => {
    expect(formatRelativeTime(new Date(NOW))).toBe("just now");
  });

  it('returns "{n}m ago" for dates 1–59 minutes ago', () => {
    expect(formatRelativeTime(new Date(NOW - 60_000))).toBe("1m ago");
    expect(formatRelativeTime(new Date(NOW - 30 * 60_000))).toBe("30m ago");
    expect(formatRelativeTime(new Date(NOW - 59 * 60_000))).toBe("59m ago");
  });

  it('returns "{n}h ago" for dates 1–23 hours ago', () => {
    expect(formatRelativeTime(new Date(NOW - 60 * 60_000))).toBe("1h ago");
    expect(formatRelativeTime(new Date(NOW - 12 * 60 * 60_000))).toBe("12h ago");
    expect(formatRelativeTime(new Date(NOW - 23 * 60 * 60_000))).toBe("23h ago");
  });

  it('returns "{n}d ago" for dates 1–29 days ago', () => {
    expect(formatRelativeTime(new Date(NOW - 24 * 60 * 60_000))).toBe("1d ago");
    expect(formatRelativeTime(new Date(NOW - 15 * 24 * 60 * 60_000))).toBe("15d ago");
    expect(formatRelativeTime(new Date(NOW - 29 * 24 * 60 * 60_000))).toBe("29d ago");
  });

  it("returns toLocaleDateString() for dates 30+ days ago", () => {
    const thirtyDaysAgo = new Date(NOW - 30 * 24 * 60 * 60_000);
    expect(formatRelativeTime(thirtyDaysAgo)).toBe(thirtyDaysAgo.toLocaleDateString());

    const oneYearAgo = new Date(NOW - 365 * 24 * 60 * 60_000);
    expect(formatRelativeTime(oneYearAgo)).toBe(oneYearAgo.toLocaleDateString());
  });

  it("at the 30-day boundary switches to date string (not 'd ago')", () => {
    const exactly30Days = new Date(NOW - 30 * 24 * 60 * 60_000);
    const result = formatRelativeTime(exactly30Days);
    expect(result).not.toMatch(/d ago$/);
    expect(result).toBe(exactly30Days.toLocaleDateString());
  });
});
