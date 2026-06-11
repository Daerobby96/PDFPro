/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // PDF.js worker configuration
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Enable experimental features
  experimental: {
  },
  // Image domains for Supabase storage
  images: {
    domains: ['localhost', 'supabase.co'],
  },
}

module.exports = nextConfig
