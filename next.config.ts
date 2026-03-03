import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverComponentsExternalPackages: ["@prisma/client"],
};

export default nextConfig;
