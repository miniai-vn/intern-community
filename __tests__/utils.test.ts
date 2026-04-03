import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("keeps an already valid slug unchanged", () => {
    expect(generateSlug("already-a-slug")).toBe("already-a-slug");
  });

  it("preserves numbers", () => {
    expect(generateSlug("Top 10 App 2026")).toBe("top-10-app-2026");
  });

  it("returns an empty string for an empty name", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after cleanup", () => {
    expect(generateSlug("---Hello World---")).toBe("hello-world");
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

  it("skips to the next available suffix after many conflicts", () => {
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
  const now = new Date("2026-04-04T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns just now for dates less than one minute ago", () => {
    expect(formatRelativeTime(new Date("2026-04-04T11:59:30.000Z"))).toBe("just now");
  });

  it("returns minutes for dates between one and fifty-nine minutes ago", () => {
    expect(formatRelativeTime(new Date("2026-04-04T11:15:00.000Z"))).toBe("45m ago");
  });

  it("returns hours for dates between one and twenty-three hours ago", () => {
    expect(formatRelativeTime(new Date("2026-04-04T07:00:00.000Z"))).toBe("5h ago");
  });

  it("returns days for dates between one and twenty-nine days ago", () => {
    expect(formatRelativeTime(new Date("2026-03-10T12:00:00.000Z"))).toBe("25d ago");
  });

  it("falls back to locale date string for dates thirty days or older", () => {
    const date = new Date("2026-03-01T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
