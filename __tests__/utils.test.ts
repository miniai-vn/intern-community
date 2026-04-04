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

  it("keeps an already slug-shaped name (lowercased, hyphens preserved)", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves digits in the slug", () => {
    expect(generateSlug("App 2 Beta")).toBe("app-2-beta");
    expect(generateSlug("v1.0 release")).toBe("v10-release");
  });

  it("returns an empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after stripping special characters", () => {
    expect(generateSlug("---hello---")).toBe("hello");
    expect(generateSlug("!wow!")).toBe("wow");
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

  it("finds the next free suffix when many suffixed versions exist", () => {
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

  it("does not treat a longer slug as a conflict with the base", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-app-extra"])).toBe(
      "my-app"
    );
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  const fixedNow = new Date("2025-06-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for timestamps less than one minute ago', () => {
    const date = new Date(fixedNow.getTime() - 30_000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for 1–59 minutes ago', () => {
    const fiveMinAgo = new Date(fixedNow.getTime() - 5 * 60_000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
    const fiftyNineMinAgo = new Date(fixedNow.getTime() - 59 * 60_000);
    expect(formatRelativeTime(fiftyNineMinAgo)).toBe("59m ago");
  });

  it('returns "{n}h ago" for 1–23 hours ago', () => {
    const twoHoursAgo = new Date(fixedNow.getTime() - 2 * 60 * 60_000);
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
    const twentyThreeHoursAgo = new Date(
      fixedNow.getTime() - 23 * 60 * 60_000
    );
    expect(formatRelativeTime(twentyThreeHoursAgo)).toBe("23h ago");
  });

  it('returns "{n}d ago" for 1–29 days ago', () => {
    const fifteenDaysAgo = new Date(
      fixedNow.getTime() - 15 * 24 * 60 * 60_000
    );
    expect(formatRelativeTime(fifteenDaysAgo)).toBe("15d ago");
    const twentyNineDaysAgo = new Date(
      fixedNow.getTime() - 29 * 24 * 60 * 60_000
    );
    expect(formatRelativeTime(twentyNineDaysAgo)).toBe("29d ago");
  });

  it("uses toLocaleDateString for 30+ days ago", () => {
    const fortyDaysAgo = new Date(
      fixedNow.getTime() - 40 * 24 * 60 * 60_000
    );
    expect(formatRelativeTime(fortyDaysAgo)).toBe(
      fortyDaysAgo.toLocaleDateString()
    );
  });
});
