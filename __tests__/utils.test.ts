import { describe, it, expect } from "vitest";
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
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

// TODO [easy-challenge]: Write a full test suite for `formatRelativeTime`.
// Requirements:
// - "just now" for dates less than 1 minute ago
// - "{n}m ago" for dates 1–59 minutes ago
// - "{n}h ago" for dates 1–23 hours ago
// - "{n}d ago" for dates 1–29 days ago
// - toLocaleDateString() format for dates 30+ days ago
//
// Hint: You'll need to mock or control `Date.now()` to make these tests
// deterministic. Look into Vitest's `vi.setSystemTime()`.
