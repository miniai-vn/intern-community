import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Restrict which origins can be framed in our iframes.
          // "https:" allows any https origin (broad but safe for a demo gallery).
          // Tighten to an allowlist (e.g. "https://vercel.app") in production.
          {
            key: "Content-Security-Policy",
            value: "frame-src https:;",
          },
          // Prevent our own pages from being embedded in foreign iframes (clickjacking).
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
