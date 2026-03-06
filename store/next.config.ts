import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // Payment provider SDKs use Node.js built-ins — keep server-side only
  serverExternalPackages: ["iyzipay", "stripe"],
};

export default nextConfig;
