import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
