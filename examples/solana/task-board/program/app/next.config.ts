import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @solana/web3.js uses Node.js built-ins — keep it server-side only.
  serverExternalPackages: ["@solana/web3.js", "@curvhex/orm"],
  // Silence the Turbopack warning — we have no custom webpack config.
  turbopack: {
    root: "/Users/bugra/Desktop/dev/solana-orm/curvhex-orm",
  },
  allowedDevOrigins: ["192.168.1.100"],
};

export default nextConfig;
