/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable turbopack for stable development
  experimental: {
    turbo: {
      rules: {},
    },
  },
  // Enable static optimization
  output: 'standalone',
}

module.exports = nextConfig
