// This file usually remains JavaScript (.js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add the hostnames for all external logo URLs here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's2.googleusercontent.com',
      },
      // Add other domains if needed
    ],
  },
};

module.exports = nextConfig;