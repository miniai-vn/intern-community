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

  it("returns an already valid slug unchanged", () => {
    expect(generateSlug("already-valid-slug")).toBe("already-valid-slug");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App 2048 v2")).toBe("app-2048-v2");
  });

  it("returns an empty string when given an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens created by special character removal", () => {
    expect(generateSlug("!!!hello world???")).toBe("hello-world");
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

  it("ignores similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date("2026-04-03T09:59:30.000Z"))).toBe(
      "just now"
    );
  });

  it("returns minutes for dates between 1 and 59 minutes ago", () => {
    expect(formatRelativeTime(new Date("2026-04-03T09:15:00.000Z"))).toBe(
      "45m ago"
    );
  });

  it("returns hours for dates between 1 and 23 hours ago", () => {
    expect(formatRelativeTime(new Date("2026-04-03T07:00:00.000Z"))).toBe(
      "3h ago"
    );
  });

  it("returns days for dates between 1 and 29 days ago", () => {
    expect(formatRelativeTime(new Date("2026-03-29T10:00:00.000Z"))).toBe(
      "5d ago"
    );
  });

  it("falls back to locale date format for dates 30 or more days ago", () => {
    const date = new Date("2026-02-20T10:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
