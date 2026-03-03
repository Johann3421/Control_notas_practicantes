import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for optimised Docker images (copies only necessary files)
  output: "standalone",

  // Allow <img> from any HTTPS domain (adjust if you use next/image with external URLs)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Suppress noisy build warnings for packages that use dynamic require
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
