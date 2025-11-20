import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors won't break build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ TS errors won't break build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
