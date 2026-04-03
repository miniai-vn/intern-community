import { describe, it, expect, vi, afterEach } from "vitest";
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

  it("returns the same string if already a valid slug", () => {
    expect(generateSlug("valid-slug")).toBe("valid-slug");
  });

  it("preserves numbers in the name", () => {
    expect(generateSlug("Project 2024")).toBe("project-2024");
  });

  it("returns empty string for an empty string input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens after special character removal", () => {
    expect(generateSlug("!@hello-world!@")).toBe("hello-world");
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

  it("increments the suffix when many suffixed versions already exist", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1", "my-app-2", "my-app-3", "my-app-4", "my-app-5"])).toBe("my-app-6");
  });

  it("does not block if existing list contains similar but non-conflicting slugs", () => {
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-application"])).toBe("my-app");
  });
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for dates less than 1 minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    const date = new Date("2024-01-01T11:59:30Z"); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns '{n}m ago' for dates 1-59 minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    const date = new Date("2024-01-01T11:55:00Z"); // 5 minutes ago
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns '{n}h ago' for dates 1-23 hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    const date = new Date("2024-01-01T10:00:00Z"); // 2 hours ago
    expect(formatRelativeTime(date)).toBe("2h ago");
  });

  it("returns '{n}d ago' for dates 1-29 days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-16T12:00:00Z"));
    const date = new Date("2024-01-01T12:00:00Z"); // 15 days ago
    expect(formatRelativeTime(date)).toBe("15d ago");
  });

  it("returns toLocaleDateString() format for dates 30+ days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-01T12:00:00Z"));
    const date = new Date("2024-01-01T12:00:00Z"); // 60 days ago
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
