import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

// ============================================================
// generateSlug — already written as examples
// ============================================================

describe("generateSlug", () => {
  // Converts simple title-cased input to lowercase slug tokens.
  it("lowercases and hyphenates words", () => {
    expect(generateSlug("My Cool App")).toBe("my-cool-app");
  });

  // Removes punctuation/symbols that are not URL-safe.
  it("strips special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  // Ignores extra spaces at the beginning/end of input.
  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  Hello  World  ")).toBe("hello-world");
  });

  // Collapses repeated inner spaces into a single separator.
  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  // Leaves a clean slug unchanged (idempotent behavior).
  it("keeps an already-valid slug unchanged", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  // Preserves numeric characters in the generated slug.
  it("preserves numbers", () => {
    expect(generateSlug("App 2 Version 10")).toBe("app-2-version-10");
  });

  // Empty input remains empty after normalization.
  it("returns an empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  // Ensures no dangling hyphens remain after sanitization.
  it("strips leading/trailing hyphens after normalization", () => {
    expect(generateSlug("***my app***")).toBe("my-app");
  });
});

// ============================================================
// makeUniqueSlug — already written as examples
// ============================================================

describe("makeUniqueSlug", () => {
  // Base slug is reused when there is no collision.
  it("returns the base slug when there are no conflicts", () => {
    expect(makeUniqueSlug("my-app", [])).toBe("my-app");
  });

  // First collision gets suffix "-1".
  it("appends -1 when base slug is taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app"])).toBe("my-app-1");
  });

  // Existing suffixes force increment to the next available number.
  it("increments the suffix when previous suffixes are taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1"])).toBe("my-app-2");
  });

  // Handles a dense sequence of already-taken suffixes.
  it("finds the next available suffix when many versions already exist", () => {
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

  // Similar strings should not block the exact base slug.
  it("ignores similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"]))
      .toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  // Freeze time for deterministic, non-flaky assertions.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Anything below 60 seconds should stay in the "just now" bucket.
  it('returns "just now" for less than 1 minute', () => {
    expect(formatRelativeTime(new Date("2026-04-03T11:59:30.000Z")))
      .toBe("just now");
  });

  // Boundary coverage for minute formatting range.
  it("returns minutes for 1 to 59 minutes ago", () => {
    expect(formatRelativeTime(new Date("2026-04-03T11:59:00.000Z")))
      .toBe("1m ago");
    expect(formatRelativeTime(new Date("2026-04-03T11:01:00.000Z")))
      .toBe("59m ago");
  });

  // Boundary coverage for hour formatting range.
  it("returns hours for 1 to 23 hours ago", () => {
    expect(formatRelativeTime(new Date("2026-04-03T11:00:00.000Z")))
      .toBe("1h ago");
    expect(formatRelativeTime(new Date("2026-04-02T13:00:00.000Z")))
      .toBe("23h ago");
  });

  // Boundary coverage for day formatting range.
  it("returns days for 1 to 29 days ago", () => {
    expect(formatRelativeTime(new Date("2026-04-02T12:00:00.000Z")))
      .toBe("1d ago");
    expect(formatRelativeTime(new Date("2026-03-05T12:00:00.000Z")))
      .toBe("29d ago");
  });

  // 30+ days falls back to locale date formatting.
  it("returns locale date string for 30+ days", () => {
    const oldDate = new Date("2026-03-04T12:00:00.000Z");
    expect(formatRelativeTime(oldDate)).toBe(oldDate.toLocaleDateString());
  });
});
