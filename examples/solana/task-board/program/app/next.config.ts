import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/bugra/Desktop/dev/solana-orm/curvhex-orm",
  },
  allowedDevOrigins: ["192.168.1.100"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
