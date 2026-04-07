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

  it("leaves valid slug unchanged", () => {
    expect(generateSlug("valid-slug")).toBe("valid-slug");
  });

  it("preserves numbers", () => {
    expect(generateSlug("version 2.0!")).toBe("version-20");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("trims hyphens after special char removal", () => {
    expect(generateSlug("-@hello@-")).toBe("hello");
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

  it("increments past many suffixed versions", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"])).toBe("my-app-6");
  });

  it("does not block if existing contains similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for dates less than 1 minute ago", () => {
    const d = new Date("2026-04-07T11:59:30Z");
    expect(formatRelativeTime(d)).toBe("just now");
  });

  it("returns '{n}m ago' for dates 1-59 minutes ago", () => {
    const d = new Date("2026-04-07T11:55:00Z");
    expect(formatRelativeTime(d)).toBe("5m ago");
  });

  it("returns '{n}h ago' for dates 1-23 hours ago", () => {
    const d = new Date("2026-04-07T09:00:00Z");
    expect(formatRelativeTime(d)).toBe("3h ago");
  });

  it("returns '{n}d ago' for dates 1-29 days ago", () => {
    const d = new Date("2026-04-02T12:00:00Z");
    expect(formatRelativeTime(d)).toBe("5d ago");
  });

  it("returns Vietnam localized date string for 30+ days ago (UTC+7)", () => {
    const d = new Date("2026-01-01T15:00:00Z"); // UTC+0, equates to 22:00 in Vietnam Time
    expect(formatRelativeTime(d)).toBe(d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));
  });
});
