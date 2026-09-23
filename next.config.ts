import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product imagery uploaded through the dashboard is served from Sanity's
    // CDN. Local uploads (seed mode) land in /public and need no pattern.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
