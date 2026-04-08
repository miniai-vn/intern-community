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

  it("leaves an already-valid slug unchanged", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves digits", () => {
    expect(generateSlug("App 2 Go v3")).toBe("app-2-go-v3");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after stripping specials", () => {
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

  it("finds the next free suffix when many numbered variants exist", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not treat similar longer slugs as conflicts", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than one minute ago', () => {
    const date = new Date("2026-04-08T11:59:30.000Z");
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for 1–59 minutes ago', () => {
    expect(formatRelativeTime(new Date("2026-04-08T11:58:00.000Z"))).toBe("2m ago");
    expect(formatRelativeTime(new Date("2026-04-08T11:01:00.000Z"))).toBe("59m ago");
  });

  it('returns "{n}h ago" for 1–23 hours ago', () => {
    expect(formatRelativeTime(new Date("2026-04-08T11:00:00.000Z"))).toBe("1h ago");
    expect(formatRelativeTime(new Date("2026-04-07T13:00:00.000Z"))).toBe("23h ago");
  });

  it('returns "{n}d ago" for 1–29 days ago', () => {
    expect(formatRelativeTime(new Date("2026-04-07T12:00:00.000Z"))).toBe("1d ago");
    expect(formatRelativeTime(new Date("2026-03-10T12:00:00.000Z"))).toBe("29d ago");
  });

  it("uses toLocaleDateString for 30 or more days ago", () => {
    const date = new Date("2026-03-08T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
