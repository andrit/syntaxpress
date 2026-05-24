/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  // Revalidate Shopify data every 60 seconds
  experimental: {
    // Enable PPR when stable
  },
};

module.exports = nextConfig;
