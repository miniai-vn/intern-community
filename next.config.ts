import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/modules/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // Keep this directive focused for the iframe preview use case:
            // - frame-src: only self + https origins
            // - frame-ancestors: prevent this page being framed by untrusted origins
            // - object-src: disallow legacy plugin embeds
            value: "frame-src 'self' https:; frame-ancestors 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
