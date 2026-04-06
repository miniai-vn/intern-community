import { describe, it, expect } from "vitest";
import { isValidPreviewUrl } from "@/components/sandboxed-preview";

describe("isValidPreviewUrl", () => {
  it("accepts valid HTTPS URLs", () => {
    expect(isValidPreviewUrl("https://example.com")).toBe(true);
    expect(isValidPreviewUrl("https://my-app.vercel.app/demo")).toBe(true);
    expect(isValidPreviewUrl("https://sub.domain.co/path?q=1")).toBe(true);
  });

  it("rejects HTTP URLs", () => {
    expect(isValidPreviewUrl("http://example.com")).toBe(false);
    expect(isValidPreviewUrl("http://localhost:3000")).toBe(false);
  });

  it("rejects non-URL strings", () => {
    expect(isValidPreviewUrl("not-a-url")).toBe(false);
    expect(isValidPreviewUrl("")).toBe(false);
    expect(isValidPreviewUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects javascript: protocol", () => {
    expect(isValidPreviewUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URIs", () => {
    expect(isValidPreviewUrl("data:text/html,<h1>hi</h1>")).toBe(false);
  });
});
