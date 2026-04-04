import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

  it("returns the same string when already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers", () => {
    expect(generateSlug("App 2024")).toBe("app-2024");
    expect(generateSlug("v3 release")).toBe("v3-release");
  });

  it("returns an empty string for an empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens produced by special char removal", () => {
    // "!hello!" → after stripping specials → "-hello-" → trimmed → "hello"
    expect(generateSlug("!hello!")).toBe("hello");
    expect(generateSlug("---leading")).toBe("leading");
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

  it("skips all taken suffixes up to -5", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not treat similar-but-different slugs as conflicts", () => {
    // "my-app-tool" should NOT block "my-app"
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
    // "my-app-tool" should NOT block "my-app-1"
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-tool"])).toBe("my-app-1");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  const NOW = new Date("2024-06-15T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a date less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date(NOW - 30_000))).toBe("just now");
    expect(formatRelativeTime(new Date(NOW - 59_000))).toBe("just now");
  });

  it('returns "just now" for the exact current time', () => {
    expect(formatRelativeTime(new Date(NOW))).toBe("just now");
  });

  it('returns "{n}m ago" for 1–59 minutes ago', () => {
    expect(formatRelativeTime(new Date(NOW - 60_000))).toBe("1m ago");
    expect(formatRelativeTime(new Date(NOW - 30 * 60_000))).toBe("30m ago");
    expect(formatRelativeTime(new Date(NOW - 59 * 60_000))).toBe("59m ago");
  });

  it('returns "{n}h ago" for 1–23 hours ago', () => {
    expect(formatRelativeTime(new Date(NOW - 60 * 60_000))).toBe("1h ago");
    expect(formatRelativeTime(new Date(NOW - 12 * 60 * 60_000))).toBe("12h ago");
    expect(formatRelativeTime(new Date(NOW - 23 * 60 * 60_000))).toBe("23h ago");
  });

  it('returns "{n}d ago" for 1–29 days ago', () => {
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
});
