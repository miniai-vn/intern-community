import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Security headers applied to every route.
   *
   * Content-Security-Policy notes:
   * - `frame-ancestors 'self'` — Prevents the *app itself* from being embedded
   *   in a foreign iframe (anti-clickjacking). This is the modern replacement
   *   for X-Frame-Options.
   * - `X-Frame-Options: SAMEORIGIN` — Legacy fallback for browsers that don't
   *   parse the CSP `frame-ancestors` directive.
   * - We do NOT set `frame-src` here, because restricting which origins our
   *   sandboxed <iframe> may load is the responsibility of the sandbox attribute
   *   on the element itself plus the origin server's own CSP — not ours.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              // Allow our own app to be framed only by same origin (anti-clickjacking)
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
