import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime } from "@/lib/utils";

// ============================================================
// generateSlug
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

  it("returns the slug unchanged when it is already a valid slug", () => {
    // A string that is already lowercase, hyphenated, and alphanumeric
    // should pass through every transformation step without modification.
    expect(generateSlug("my-cool-app")).toBe("my-cool-app");
  });

  it("preserves numbers in the output", () => {
    // Numbers match [a-z0-9] in the regex, so they must NOT be stripped.
    expect(generateSlug("App 2 Go")).toBe("app-2-go");
    expect(generateSlug("Version 3 Beta")).toBe("version-3-beta");
  });

  it("returns an empty string for an empty input", () => {
    // Each step is a no-op on "": trim → "", replace → "", etc.
    expect(generateSlug("")).toBe("");
  });

  it("strips leading and trailing hyphens that result from special-char removal", () => {
    // "!hello!" → after stripping special chars → "hello", then the final
    // step removes boundary hyphens.
    expect(generateSlug("!hello!")).toBe("hello");
    // A string composed entirely of hyphens (after transforms) → ""
    expect(generateSlug("---")).toBe("");
  });
});

// ============================================================
// makeUniqueSlug
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

  it("skips to the first free suffix when many consecutive suffixes are taken", () => {
    // Existing: my-app, my-app-1 … my-app-5  →  next free is my-app-6.
    const existing = [
      "my-app",
      "my-app-1",
      "my-app-2",
      "my-app-3",
      "my-app-4",
      "my-app-5",
    ];
    expect(makeUniqueSlug("my-app", existing)).toBe("my-app-6");
  });

  it("does not treat a slug that merely starts with the base as a conflict", () => {
    // "my-app-tool" shares a prefix with "my-app" but is a different slug,
    // so "my-app" should be returned as-is.
    expect(makeUniqueSlug("my-app", ["my-app-tool"])).toBe("my-app");
    expect(makeUniqueSlug("my-app", ["my-app-tool", "my-app-extra"])).toBe(
      "my-app"
    );
  });
});

// ============================================================
// formatRelativeTime
// ============================================================

describe("formatRelativeTime", () => {
  // Fix "now" to a specific UTC timestamp so every test is fully deterministic.
  const NOW = new Date("2024-06-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helpers ─────────────────────────────────────────────────────────────────

  const secondsAgo = (s: number) => new Date(NOW.getTime() - s * 1_000);
  const minutesAgo = (m: number) => secondsAgo(m * 60);
  const hoursAgo = (h: number) => minutesAgo(h * 60);
  const daysAgo = (d: number) => hoursAgo(d * 24);

  // "just now" — diff < 60 000 ms ──────────────────────────────────────────

  it('returns "just now" for the current instant', () => {
    expect(formatRelativeTime(NOW)).toBe("just now");
  });

  it('returns "just now" for 30 seconds ago', () => {
    expect(formatRelativeTime(secondsAgo(30))).toBe("just now");
  });

  it('returns "just now" for 59 seconds ago (boundary just below 1 m)', () => {
    expect(formatRelativeTime(secondsAgo(59))).toBe("just now");
  });

  // "{n}m ago" — 1 ≤ minutes < 60 ─────────────────────────────────────────

  it('returns "1m ago" at exactly 1 minute', () => {
    expect(formatRelativeTime(minutesAgo(1))).toBe("1m ago");
  });

  it('returns "30m ago" for 30 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(30))).toBe("30m ago");
  });

  it('returns "59m ago" at the boundary just below 1 hour', () => {
    expect(formatRelativeTime(minutesAgo(59))).toBe("59m ago");
  });

  // "{n}h ago" — 1 ≤ hours < 24 ───────────────────────────────────────────

  it('returns "1h ago" at exactly 1 hour', () => {
    expect(formatRelativeTime(hoursAgo(1))).toBe("1h ago");
  });

  it('returns "12h ago" for 12 hours ago', () => {
    expect(formatRelativeTime(hoursAgo(12))).toBe("12h ago");
  });

  it('returns "23h ago" at the boundary just below 1 day', () => {
    expect(formatRelativeTime(hoursAgo(23))).toBe("23h ago");
  });

  // "{n}d ago" — 1 ≤ days < 30 ────────────────────────────────────────────

  it('returns "1d ago" at exactly 1 day', () => {
    expect(formatRelativeTime(daysAgo(1))).toBe("1d ago");
  });

  it('returns "15d ago" for 15 days ago', () => {
    expect(formatRelativeTime(daysAgo(15))).toBe("15d ago");
  });

  it('returns "29d ago" at the boundary just below 30 days', () => {
    expect(formatRelativeTime(daysAgo(29))).toBe("29d ago");
  });

  // toLocaleDateString() — days ≥ 30 ──────────────────────────────────────

  it("returns toLocaleDateString() for exactly 30 days ago", () => {
    const date = daysAgo(30);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });

  it("returns toLocaleDateString() for 6 months ago", () => {
    const date = daysAgo(180);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });
});
