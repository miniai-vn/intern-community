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

  it("returns the same slug when input is already valid", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App 2.0 Release")).toBe("app-20-release");
  });

  it("returns an empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special char removal", () => {
    // e.g. "!hello!" → after removing special chars → "hello"
    expect(generateSlug("!hello!")).toBe("hello");
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

  it("skips to the next available suffix when many are taken", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not treat similar but non-conflicting slugs as conflicts", () => {
    // "my-app-tool" should NOT block "my-app"
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    const date = new Date(Date.now() - 30_000); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "just now" for the exact current time', () => {
    const date = new Date(Date.now());
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for 1 minute ago', () => {
    const date = new Date(Date.now() - 60_000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it('returns "{n}m ago" for 59 minutes ago', () => {
    const date = new Date(Date.now() - 59 * 60_000);
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it('returns "{n}h ago" for 1 hour ago', () => {
    const date = new Date(Date.now() - 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it('returns "{n}h ago" for 23 hours ago', () => {
    const date = new Date(Date.now() - 23 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  it('returns "{n}d ago" for 1 day ago', () => {
    const date = new Date(Date.now() - 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });

  it('returns "{n}d ago" for 29 days ago', () => {
    const date = new Date(Date.now() - 29 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("29d ago");
  });

  it("returns toLocaleDateString() for dates 30+ days ago", () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });

  it("returns toLocaleDateString() for very old dates", () => {
    const date = new Date("2020-01-01T00:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
