import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["maplibre-gl"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mechafrica-backend.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      }
    ],
  },
};

export default nextConfig;
