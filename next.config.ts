import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚨 ESLint errors will NOT break `next build`
    ignoreDuringBuilds: true,
  },
  /* other config options here (if any) */
};

export default nextConfig;
