import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

// ============================================================
// generateSlug
// ============================================================

describe("generateSlug", () => {
  // --- examples provided by the codebase ---
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

  // --- additional cases (easy-challenge TODO) ---

  it("returns the same string when input is already a valid slug", () => {
    // A valid slug has no uppercase, no spaces, no special chars.
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App 2048")).toBe("app-2048");
    expect(generateSlug("v2 release")).toBe("v2-release");
  });

  it("returns an empty string for an empty input", () => {
    // The implementation strips everything; nothing remains.
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens produced by special-char removal", () => {
    // "!Hello!" → after strip → "Hello" → "hello"
    expect(generateSlug("!Hello!")).toBe("hello");
    // "---" → all hyphens → collapses → stripped → ""
    expect(generateSlug("---")).toBe("");
  });

  it("handles strings that are only special characters", () => {
    expect(generateSlug("!@#$%")).toBe("");
  });

  it("handles mixed numbers, letters and symbols", () => {
    expect(generateSlug("My App v2.0!")).toBe("my-app-v20");
  });
});

// ============================================================
// makeUniqueSlug
// ============================================================

describe("makeUniqueSlug", () => {
  // --- examples provided by the codebase ---
  it("returns the base slug when there are no conflicts", () => {
    expect(makeUniqueSlug("my-app", [])).toBe("my-app");
  });

  it("appends -1 when base slug is taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app"])).toBe("my-app-1");
  });

  it("increments the suffix when previous suffixes are taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1"])).toBe("my-app-2");
  });

  // --- additional cases (easy-challenge TODO) ---

  it("skips to the first available suffix when -1 through -5 are taken", () => {
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

  it("does not block the base when existing list has only similar-but-different slugs", () => {
    // "my-app-tool" starts with "my-app" but is not "my-app" itself.
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });

  it("does not confuse suffixed variants from a different base", () => {
    // "my-app-1" exists but "my-app" does not → base is returned as-is.
    expect(makeUniqueSlug("my-app", ["my-app-1", "my-app-2"])).toBe("my-app");
  });

  it("handles a large number of taken suffixes efficiently", () => {
    const existing = ["my-app", ...Array.from({ length: 99 }, (_, i) => `my-app-${i + 1}`)];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-100");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================
// All tests use vi.useFakeTimers() so that Date.now() is deterministic.
// The "now" anchor is fixed to 2025-01-15T12:00:00.000Z throughout.

describe("formatRelativeTime", () => {
  const NOW = new Date("2025-01-15T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- "just now" boundary ---

  it('returns "just now" for a date 0 seconds ago', () => {
    const date = new Date(NOW);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "just now" for a date 30 seconds ago', () => {
    const date = new Date(NOW - 30_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "just now" for a date 59 seconds ago (still < 1 minute)', () => {
    const date = new Date(NOW - 59_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  // --- minutes boundary ---

  it('returns "1m ago" for a date exactly 1 minute ago', () => {
    const date = new Date(NOW - 60_000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it('returns "30m ago" for a date 30 minutes ago', () => {
    const date = new Date(NOW - 30 * 60_000);
    expect(formatRelativeTime(date)).toBe("30m ago");
  });

  it('returns "59m ago" for a date 59 minutes ago', () => {
    const date = new Date(NOW - 59 * 60_000);
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  // --- hours boundary ---

  it('returns "1h ago" for a date exactly 1 hour ago', () => {
    const date = new Date(NOW - 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it('returns "5h ago" for a date 5 hours ago', () => {
    const date = new Date(NOW - 5 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("5h ago");
  });

  it('returns "23h ago" for a date 23 hours ago', () => {
    const date = new Date(NOW - 23 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  // --- days boundary ---

  it('returns "1d ago" for a date exactly 24 hours ago', () => {
    const date = new Date(NOW - 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });

  it('returns "7d ago" for a date 7 days ago', () => {
    const date = new Date(NOW - 7 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("7d ago");
  });

  it('returns "29d ago" for a date 29 days ago', () => {
    const date = new Date(NOW - 29 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("29d ago");
  });

  // --- locale date boundary (≥ 30 days) ---

  it("returns toLocaleDateString() for a date exactly 30 days ago", () => {
    const date = new Date(NOW - 30 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });

  it("returns toLocaleDateString() for a date 1 year ago", () => {
    const date = new Date(NOW - 365 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
