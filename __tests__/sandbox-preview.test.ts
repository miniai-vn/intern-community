import { describe, it, expect } from "vitest";

/**
 * Security unit tests for the iframe URL validation logic used in SandboxPreview.
 *
 * The component itself requires a DOM/jsdom environment to render, but the
 * URL-safety guard (`url.startsWith("https://")`) is pure logic that can be
 * tested here without mounting React.
 *
 * These tests document and protect the security contract:
 *   - Only https:// URLs are allowed → prevents javascript: URI injection
 *     and mixed-content (http://) loading.
 */

// Mirror the exact guard used in page.tsx so tests stay in sync:
//   miniApp.demoUrl && miniApp.demoUrl.startsWith("https://")
function isSafePreviewUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith("https://"));
}

describe("SandboxPreview — URL safety guard", () => {
  // ── Safe URLs (should render the iframe) ──────────────────────────────────

  it("allows a well-formed https:// URL", () => {
    expect(isSafePreviewUrl("https://example.com")).toBe(true);
  });

  it("allows an https:// URL with a path and query string", () => {
    expect(isSafePreviewUrl("https://myapp.vercel.app/demo?ref=community")).toBe(true);
  });

  it("allows an https:// URL with a subdomain", () => {
    expect(isSafePreviewUrl("https://demo.myapp.io")).toBe(true);
  });

  // ── Dangerous / unsafe URLs (must NOT render the iframe) ──────────────────

  it("blocks plain http:// URLs (mixed-content risk)", () => {
    expect(isSafePreviewUrl("http://example.com")).toBe(false);
  });

  it("blocks javascript: URIs (XSS vector)", () => {
    expect(isSafePreviewUrl("javascript:alert(1)")).toBe(false);
  });

  it("blocks data: URIs (arbitrary HTML injection)", () => {
    expect(isSafePreviewUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("blocks blob: URIs", () => {
    expect(isSafePreviewUrl("blob:https://example.com/some-id")).toBe(false);
  });

  it("blocks protocol-relative URLs (//example.com)", () => {
    // These resolve to http:// in some contexts
    expect(isSafePreviewUrl("//example.com")).toBe(false);
  });

  it("blocks an empty string", () => {
    expect(isSafePreviewUrl("")).toBe(false);
  });

  it("blocks null (module has no demoUrl)", () => {
    expect(isSafePreviewUrl(null)).toBe(false);
  });

  it("blocks undefined", () => {
    expect(isSafePreviewUrl(undefined)).toBe(false);
  });

  it("blocks a URL that starts with whitespace before https://", () => {
    // A naive server might store ' https://...' with a leading space
    expect(isSafePreviewUrl("  https://example.com")).toBe(false);
  });

  it("is case-sensitive: HTTPS:// (uppercase) is blocked", () => {
    // startsWith is case-sensitive; the DB should normalise URLs on save,
    // but our client-side guard must not silently trust uppercase variants.
    expect(isSafePreviewUrl("HTTPS://example.com")).toBe(false);
  });
});
