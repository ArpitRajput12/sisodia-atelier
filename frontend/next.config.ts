import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack: (config) => {
    config.output = config.output || {};
    config.output.chunkLoadTimeout = 300000;
    return config;
  },
};

export default nextConfig;
