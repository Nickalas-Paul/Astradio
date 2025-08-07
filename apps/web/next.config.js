/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://astradio.onrender.com/api/:path*',
      },
    ];
  },
  // Handle client-side only modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure client-side only modules are properly handled
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Environment variables for API
  env: {
    NEXT_PUBLIC_API_URL: 'https://astradio.onrender.com',
  },
  // Disable static generation for error pages
  trailingSlash: false,
  // Handle SSR issues
  experimental: {
    // Disable static generation for error pages
    staticPageGenerationTimeout: 0,
  },
}

module.exports = nextConfig 