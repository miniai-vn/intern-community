import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

  it("preserves a name that is already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App 2.0 Pro")).toBe("app-20-pro");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading and trailing hyphens after special char removal", () => {
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

  it("increments through many suffixed versions", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"])).toBe("my-app-6");
  });

  it("does not conflict with similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-app-pro"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — complete test suite
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    const now = new Date("2026-04-08T12:00:00Z");
    vi.setSystemTime(now);

    const dateJustNow = new Date("2026-04-08T11:59:30Z"); // 30 seconds ago
    expect(formatRelativeTime(dateJustNow)).toBe("just now");

    const dateAlmostMinute = new Date("2026-04-08T11:59:01Z"); // 59 seconds ago
    expect(formatRelativeTime(dateAlmostMinute)).toBe("just now");
  });

  it("returns {n}m ago for dates 1-59 minutes ago", () => {
    const now = new Date("2026-04-08T12:00:00Z");
    vi.setSystemTime(now);

    const date1MinAgo = new Date("2026-04-08T11:59:00Z");
    expect(formatRelativeTime(date1MinAgo)).toBe("1m ago");

    const date30MinAgo = new Date("2026-04-08T11:30:00Z");
    expect(formatRelativeTime(date30MinAgo)).toBe("30m ago");

    const date59MinAgo = new Date("2026-04-08T11:01:00Z");
    expect(formatRelativeTime(date59MinAgo)).toBe("59m ago");
  });

  it("returns {n}h ago for dates 1-23 hours ago", () => {
    const now = new Date("2026-04-08T12:00:00Z");
    vi.setSystemTime(now);

    const date1HourAgo = new Date("2026-04-08T11:00:00Z");
    expect(formatRelativeTime(date1HourAgo)).toBe("1h ago");

    const date12HourAgo = new Date("2026-04-08T00:00:00Z");
    expect(formatRelativeTime(date12HourAgo)).toBe("12h ago");

    const date23HourAgo = new Date("2026-04-07T13:00:00Z");
    expect(formatRelativeTime(date23HourAgo)).toBe("23h ago");
  });

  it("returns {n}d ago for dates 1-29 days ago", () => {
    const now = new Date("2026-04-08T12:00:00Z");
    vi.setSystemTime(now);

    const date1DayAgo = new Date("2026-04-07T12:00:00Z");
    expect(formatRelativeTime(date1DayAgo)).toBe("1d ago");

    const date7DaysAgo = new Date("2026-04-01T12:00:00Z");
    expect(formatRelativeTime(date7DaysAgo)).toBe("7d ago");

    const date29DaysAgo = new Date("2026-03-10T12:00:00Z");
    expect(formatRelativeTime(date29DaysAgo)).toBe("29d ago");
  });

  it("returns formatted date (formatDateLong) for dates 30+ days ago", () => {
    const now = new Date("2026-04-08T12:00:00Z");
    vi.setSystemTime(now);

    const date30DaysAgo = new Date("2026-03-09T12:00:00Z");
    expect(formatRelativeTime(date30DaysAgo)).toBe("09 Mar 2026");

    const date60DaysAgo = new Date("2026-02-07T12:00:00Z");
    expect(formatRelativeTime(date60DaysAgo)).toBe("07 Feb 2026");

    const dateLastYear = new Date("2025-04-08T12:00:00Z");
    expect(formatRelativeTime(dateLastYear)).toBe("08 Apr 2025");
  });
});
