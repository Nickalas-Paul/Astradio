/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true },
  eslint: { ignoreDuringBuilds: false } // Re-enable linting
};
export default nextConfig;