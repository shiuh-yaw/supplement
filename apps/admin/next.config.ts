import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "node:path";

// Share the monorepo's root .env in development.
config({ path: path.resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@supplement/engine", "@supplement/db"],
};

export default nextConfig;
