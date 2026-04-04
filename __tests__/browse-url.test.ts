import { describe, it, expect } from "vitest";
import { buildBrowseHref } from "@/lib/browse-url";

describe("buildBrowseHref", () => {
  it("returns root when no filters", () => {
    expect(buildBrowseHref({})).toBe("/");
  });

  it("adds q only", () => {
    expect(buildBrowseHref({ q: "timer" })).toBe("/?q=timer");
  });

  it("trims q", () => {
    expect(buildBrowseHref({ q: "  hello  " })).toBe("/?q=hello");
  });

  it("adds category only", () => {
    expect(buildBrowseHref({ category: "game" })).toBe("/?category=game");
  });

  it("composes q and category for filter + search together", () => {
    expect(buildBrowseHref({ q: "pomodoro", category: "productivity" })).toBe(
      "/?q=pomodoro&category=productivity"
    );
  });
});
