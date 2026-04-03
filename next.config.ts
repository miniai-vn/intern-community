import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/modules/:slug",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
