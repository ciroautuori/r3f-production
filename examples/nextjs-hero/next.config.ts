import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // R3F ships ESM-only; keep Next's transpilation honest.
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default withBundleAnalyzer(nextConfig);
