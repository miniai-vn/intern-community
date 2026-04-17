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

  it("works with a name that is already a valid slug", () => {
    expect(generateSlug("my-valid-slug")).toBe("my-valid-slug");
  });

  it("preserves numbers in the name", () => {
    expect(generateSlug("App 2.0 Beta")).toBe("app-20-beta");
    expect(generateSlug("123 Game")).toBe("123-game");
  });

  it("returns an empty string when given an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles leading/trailing hyphens after special character removal", () => {
    // "@Hello!" -> "hello" (special chars removed, then trimmed/hyphenated)
    expect(generateSlug("!#@hello$%^")).toBe("hello");
    // "-hello-" -> "hello"
    expect(generateSlug("-hello-")).toBe("hello");
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

  it("handles cases where many suffixed versions already exist", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not block if existing list contains similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-apple"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  const NOW = new Date("2024-01-01T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for dates less than 1 minute ago", () => {
    const target = new Date(NOW.getTime() - 45 * 1000); // 45s ago
    expect(formatRelativeTime(target)).toBe("just now");
  });

  it("returns minutes ago for dates 1-59 minutes ago", () => {
    const target = new Date(NOW.getTime() - 5 * 60 * 1000); // 5m ago
    expect(formatRelativeTime(target)).toBe("5m ago");

    const targetLimit = new Date(NOW.getTime() - 59 * 60 * 1000); // 59m ago
    expect(formatRelativeTime(targetLimit)).toBe("59m ago");
  });

  it("returns hours ago for dates 1-23 hours ago", () => {
    const target = new Date(NOW.getTime() - 3 * 3600 * 1000); // 3h ago
    expect(formatRelativeTime(target)).toBe("3h ago");

    const targetLimit = new Date(NOW.getTime() - 23 * 3600 * 1000); // 23h ago
    expect(formatRelativeTime(targetLimit)).toBe("23h ago");
  });

  it("returns days ago for dates 1-29 days ago", () => {
    const target = new Date(NOW.getTime() - 10 * 24 * 3600 * 1000); // 10d ago
    expect(formatRelativeTime(target)).toBe("10d ago");

    const targetLimit = new Date(NOW.getTime() - 29 * 24 * 3600 * 1000); // 29d ago
    expect(formatRelativeTime(targetLimit)).toBe("29d ago");
  });

  it("returns locale date string for dates 30+ days ago", () => {
    const target = new Date(NOW.getTime() - 31 * 24 * 3600 * 1000); // 31d ago
    expect(formatRelativeTime(target)).toBe(target.toLocaleDateString());
  });
});
