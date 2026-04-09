import { describe, it, expect, beforeEach, afterEach } from "vitest";
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

  it("keeps valid slug unchanged", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers", () => {
    expect(generateSlug("My App 2.0")).toBe("my-app-20");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("!Hello!")).toBe("hello");
    expect(generateSlug("World!")).toBe("world");
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

  it("handles many existing suffixed versions", () => {
    const existing = ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("ignores similar but non-conflicting slugs", () => {
    const existing = ["my-app-tool", "my-app-helper", "my-awesome-app"];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

import { vi } from "vitest";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 1 minute ago', () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    
    const date = new Date("2024-01-01T11:59:30Z"); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it('returns "{n}m ago" for dates 1-59 minutes ago', () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    
    expect(formatRelativeTime(new Date("2024-01-01T11:58:00Z"))).toBe("2m ago");
    expect(formatRelativeTime(new Date("2024-01-01T11:30:00Z"))).toBe("30m ago");
    expect(formatRelativeTime(new Date("2024-01-01T11:01:00Z"))).toBe("59m ago");
  });

  it('returns "{n}h ago" for dates 1-23 hours ago', () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    
    expect(formatRelativeTime(new Date("2024-01-01T10:00:00Z"))).toBe("2h ago");
    expect(formatRelativeTime(new Date("2023-12-31T13:00:00Z"))).toBe("23h ago");
  });

  it('returns "{n}d ago" for dates 1-29 days ago', () => {
    const now = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(now);
    
    expect(formatRelativeTime(new Date("2024-01-13T12:00:00Z"))).toBe("2d ago");
    expect(formatRelativeTime(new Date("2023-12-17T12:00:00Z"))).toBe("29d ago");
  });

  it('returns toLocaleDateString() format for dates 30+ days ago', () => {
    const now = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(now);
    
    const oldDate = new Date("2023-12-10T12:00:00Z"); // 36 days ago
    const result = formatRelativeTime(oldDate);
    expect(result).toBe(oldDate.toLocaleDateString());
  });
});
