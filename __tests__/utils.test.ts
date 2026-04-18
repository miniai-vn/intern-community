import { describe, it, vi, expect , beforeEach , afterEach } from "vitest";
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

  // TODO [easy-challenge]: Add test cases for the following:
  // 1. A name that is already a valid slug (no changes needed)
  // 2. A name with numbers (numbers should be preserved)
  // 3. An empty string (what should the output be? Check the implementation)
  // 4. A name with leading/trailing hyphens after special char removal
  //
  // Hint: read `src/lib/utils.ts` to understand the exact transformation rules
  // before writing your assertions.
  it("returns the same string if already a valid slug", () => {
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers", () => {
    expect(generateSlug("App 123 Version")).toBe("app-123-version");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("removes leading/trailing hyphens after cleanup", () => {
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
  // TODO [easy-challenge]: Add test cases for:
  // 1. When many suffixed versions already exist (e.g. -1 through -5)
  // 2. When the existing list contains similar but non-conflicting slugs
  //    e.g. existing = ["my-app-tool"] should NOT block "my-app"
  it("handles many existing suffixes", () => {
    expect(
      makeUniqueSlug("my-app", [
        "my-app",
        "my-app-1",
        "my-app-2",
        "my-app-3",
        "my-app-4",
        "my-app-5",
      ]),
    ).toBe("my-app-6");
  });

  it("ignores similar but non-conflicting slugs", () => {
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
describe("formatRelativeTime", () => {
  const now = new Date("2025-01-01T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for less than 1 minute ago", () => {
    const date = new Date(now.getTime() - 30 * 1000); // 30s ago
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const date = new Date(now.getTime() - 10 * 60 * 1000); // 10m ago
    expect(formatRelativeTime(date)).toBe("10m ago");
  });

  it("returns hours ago", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3h ago
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5d ago
    expect(formatRelativeTime(date)).toBe("5d ago");
  });

  it("returns formatted date for 30+ days ago", () => {
    const date = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
