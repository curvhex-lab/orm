import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @curvhex/orm is local — keep external so Next.js doesn't try to bundle its dist
  serverExternalPackages: ["@curvhex/orm"],
  turbopack: {
    root: "/Users/bugra/Desktop/dev/solana-orm/curvhex-orm",
  },
  allowedDevOrigins: ["192.168.1.100"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // @solana/web3.js uses Node built-ins not available in the browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
