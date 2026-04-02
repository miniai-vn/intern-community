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

  it("keeps a valid slug unchanged", () => {
    expect(generateSlug("already-valid-slug")).toBe("already-valid-slug");
  });

  it("preserves numbers", () => {
    expect(generateSlug("Version 2.0!")).toBe("version-20");
  });

  it("returns an empty string for an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading and trailing hyphens after special character removal", () => {
    expect(generateSlug("!hello-world!")).toBe("hello-world");
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

  it("increments past many existing suffixed versions", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"])).toBe("my-app-6");
  });

  it("does not incorrectly conflict with prefix-matching slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    const date = new Date("2026-04-02T11:59:30Z"); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for dates 1-59 minutes ago', () => {
    const date = new Date("2026-04-02T11:45:00Z"); // 15 minutes ago
    expect(formatRelativeTime(date)).toBe("15m ago");
  });

  it('returns "{n}h ago" for dates 1-23 hours ago', () => {
    const date = new Date("2026-04-02T05:00:00Z"); // 7 hours ago
    expect(formatRelativeTime(date)).toBe("7h ago");
  });

  it('returns "{n}d ago" for dates 1-29 days ago', () => {
    const date = new Date("2026-03-23T12:00:00Z"); // 10 days ago
    expect(formatRelativeTime(date)).toBe("10d ago");
  });

  it("returns toLocaleDateString() for dates 30+ days ago", () => {
    const date = new Date("2026-01-01T12:00:00Z"); // ~3 months ago
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
