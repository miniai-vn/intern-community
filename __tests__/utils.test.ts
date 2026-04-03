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

  it("keeps a highly valid slug unchanged", () => {
    expect(generateSlug("valid-slug-already")).toBe("valid-slug-already");
  });

  it("preserves numbers within the slug", () => {
    expect(generateSlug("Cool App 123")).toBe("cool-app-123");
  });

  it("returns an empty string when given an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("cleans up leading and trailing hyphens after special character removals", () => {
    expect(generateSlug("!!!Hello World???")).toBe("hello-world");
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

  it("appends correct index when many suffixed versions already exist", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3"])).toBe("my-app-4");
  });

  it("does not clash with similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-app-2", "my-app-xyz"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 10, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns just now for dates less than 1 minute ago", () => {
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeTime(thirtySecsAgo)).toBe("just now");
  });

  it("returns {n}m ago for dates 1–59 minutes ago", () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinsAgo)).toBe("5m ago");
  });

  it("returns {n}h ago for dates 1–23 hours ago", () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveHoursAgo)).toBe("5h ago");
  });

  it("returns {n}d ago for dates 1–29 days ago", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveDaysAgo)).toBe("5d ago");
  });

  it("returns toLocaleDateString() format for dates 30+ days ago", () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(fortyDaysAgo)).toBe(fortyDaysAgo.toLocaleDateString());
  });
});
