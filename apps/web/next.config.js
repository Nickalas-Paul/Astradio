import createAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true },
  eslint: { ignoreDuringBuilds: true },
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  async headers() {
    return [
      { 
        source: "/(.*)", 
        headers: [
          { key: "Cache-Control", value: "public, max-age=60" }
        ]
      }
    ];
  }
};

const withAnalyzer = createAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withAnalyzer(nextConfig);