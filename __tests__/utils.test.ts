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

  it("returns an already valid slug unchanged", () => {
    expect(generateSlug("already-a-valid-slug")).toBe("already-a-valid-slug");
  });

  it("preserves numbers in the slug", () => {
    expect(generateSlug("App 2 Version 10")).toBe("app-2-version-10");
  });

  it("returns an empty string when given an empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special character removal", () => {
    expect(generateSlug("!!!my-app???")).toBe("my-app");
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

  it("skips over many existing suffixed versions", () => {
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
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-apps"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-31T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date("2026-01-31T11:59:30.000Z"))).toBe("just now");
  });

  it("returns minutes for dates between 1 and 59 minutes ago", () => {
    expect(formatRelativeTime(new Date("2026-01-31T11:59:00.000Z"))).toBe("1m ago");
    expect(formatRelativeTime(new Date("2026-01-31T11:01:00.000Z"))).toBe("59m ago");
  });

  it("returns hours for dates between 1 and 23 hours ago", () => {
    expect(formatRelativeTime(new Date("2026-01-31T11:00:00.000Z"))).toBe("1h ago");
    expect(formatRelativeTime(new Date("2026-01-30T13:00:00.000Z"))).toBe("23h ago");
  });

  it("returns days for dates between 1 and 29 days ago", () => {
    expect(formatRelativeTime(new Date("2026-01-30T12:00:00.000Z"))).toBe("1d ago");
    expect(formatRelativeTime(new Date("2026-01-02T12:00:00.000Z"))).toBe("29d ago");
  });

  it("returns the locale date string for dates 30 or more days ago", () => {
    const oldDate = new Date("2026-01-01T12:00:00.000Z");
    vi.spyOn(Date.prototype, "toLocaleDateString").mockReturnValue("mocked-date");

    expect(formatRelativeTime(oldDate)).toBe("mocked-date");
  });
});
