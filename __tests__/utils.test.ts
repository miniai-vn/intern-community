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

  it("preserves a valid slug", () => {
    expect(generateSlug("valid-slug-already")).toBe("valid-slug-already");
  });

  it("preserves numbers within the name", () => {
    expect(generateSlug("App Version 2.0")).toBe("app-version-20");
  });

  it("returns an empty string when provided an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading/trailing hyphens after special char removal", () => {
    expect(generateSlug("!Hello World!")).toBe("hello-world");
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

  it("handles when many suffixed versions already exist", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"])).toBe("my-app-6");
  });

  it("does not block if existing list contains similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    const date = new Date("2024-01-01T11:59:30.000Z"); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for dates 1–59 minutes ago', () => {
    const date = new Date("2024-01-01T11:30:00.000Z"); // 30 minutes ago
    expect(formatRelativeTime(date)).toBe("30m ago");
  });

  it('returns "{n}h ago" for dates 1–23 hours ago', () => {
    const date = new Date("2024-01-01T07:00:00.000Z"); // 5 hours ago
    expect(formatRelativeTime(date)).toBe("5h ago");
  });

  it('returns "{n}d ago" for dates 1–29 days ago', () => {
    const date = new Date("2023-12-20T12:00:00.000Z"); // 12 days ago
    expect(formatRelativeTime(date)).toBe("12d ago");
  });

  it("returns toLocaleDateString() format for dates 30+ days ago", () => {
    const date = new Date("2023-11-01T12:00:00.000Z"); // 61 days ago
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
