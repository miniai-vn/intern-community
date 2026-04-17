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
    expect(generateSlug("Project 123")).toBe("project-123");
  });

  it("returns an empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special char removal", () => {
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

  it("finds the next suffix when many suffixed versions already exist", () => {
    expect(
      makeUniqueSlug("my-app", [
        "my-app",
        "my-app-1",
        "my-app-2",
        "my-app-3",
        "my-app-4",
        "my-app-5",
      ])
    ).toBe("my-app-6");
  });

  it("does not treat a longer similar slug as blocking the base", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  it('returns "just now" for dates less than 1 minute ago', () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    const past = new Date(now.getTime() - 30_000);
    expect(formatRelativeTime(past)).toBe("just now");
  });

  it('returns "{n}m ago" for dates 1–59 minutes ago', () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime(new Date(now.getTime() - 1 * MIN))).toBe("1m ago");
    expect(formatRelativeTime(new Date(now.getTime() - 59 * MIN))).toBe("59m ago");
  });

  it('returns "{n}h ago" for dates 1–23 hours ago', () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime(new Date(now.getTime() - 1 * HOUR))).toBe("1h ago");
    expect(formatRelativeTime(new Date(now.getTime() - 23 * HOUR))).toBe("23h ago");
  });

  it('returns "{n}d ago" for dates 1–29 days ago', () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime(new Date(now.getTime() - 1 * DAY))).toBe("1d ago");
    expect(formatRelativeTime(new Date(now.getTime() - 29 * DAY))).toBe("29d ago");
  });

  it("returns toLocaleDateString for dates 30 or more days ago", () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    const past30 = new Date(now.getTime() - 30 * DAY);
    const past31 = new Date(now.getTime() - 31 * DAY);
    expect(formatRelativeTime(past30)).toBe(past30.toLocaleDateString());
    expect(formatRelativeTime(past31)).toBe(past31.toLocaleDateString());
  });
});
