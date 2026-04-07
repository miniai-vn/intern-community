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

  it("returns the same string when already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the name", () => {
    expect(generateSlug("App 2024 v3")).toBe("app-2024-v3");
  });

  it("returns an empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special char removal", () => {
    expect(generateSlug("!!!hello!!!")).toBe("hello");
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

  it("finds the next available suffix when -1 through -5 are taken", () => {
    const existing = ["app", "app-1", "app-2", "app-3", "app-4", "app-5"];
    expect(makeUniqueSlug("app", existing)).toBe("app-6");
  });

  it("does not treat similar but non-conflicting slugs as conflicts", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  const NOW = new Date("2026-04-08T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for 0 seconds ago", () => {
    expect(formatRelativeTime(new Date(NOW))).toBe("just now");
  });

  it("returns 'just now' for 30 seconds ago", () => {
    const date = new Date(NOW.getTime() - 30_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns 'just now' for 59 seconds ago", () => {
    const date = new Date(NOW.getTime() - 59_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns '1m ago' for exactly 1 minute ago", () => {
    const date = new Date(NOW.getTime() - 60_000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it("returns '30m ago' for 30 minutes ago", () => {
    const date = new Date(NOW.getTime() - 30 * 60_000);
    expect(formatRelativeTime(date)).toBe("30m ago");
  });

  it("returns '59m ago' for 59 minutes ago", () => {
    const date = new Date(NOW.getTime() - 59 * 60_000);
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it("returns '1h ago' for exactly 1 hour ago", () => {
    const date = new Date(NOW.getTime() - 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it("returns '12h ago' for 12 hours ago", () => {
    const date = new Date(NOW.getTime() - 12 * 3_600_000);
    expect(formatRelativeTime(date)).toBe("12h ago");
  });

  it("returns '23h ago' for 23 hours ago", () => {
    const date = new Date(NOW.getTime() - 23 * 3_600_000);
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  it("returns '1d ago' for exactly 1 day ago", () => {
    const date = new Date(NOW.getTime() - 24 * 3_600_000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });

  it("returns '15d ago' for 15 days ago", () => {
    const date = new Date(NOW.getTime() - 15 * 86_400_000);
    expect(formatRelativeTime(date)).toBe("15d ago");
  });

  it("returns '29d ago' for 29 days ago", () => {
    const date = new Date(NOW.getTime() - 29 * 86_400_000);
    expect(formatRelativeTime(date)).toBe("29d ago");
  });

  it("returns toLocaleDateString() for exactly 30 days ago", () => {
    const date = new Date(NOW.getTime() - 30 * 86_400_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });

  it("returns toLocaleDateString() for dates older than 30 days", () => {
    const date = new Date(NOW.getTime() - 365 * 86_400_000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
