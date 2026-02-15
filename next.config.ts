import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "slluttmrucwctluyxiah.supabase.co",
      },
    ],
  },
};

export default nextConfig;
