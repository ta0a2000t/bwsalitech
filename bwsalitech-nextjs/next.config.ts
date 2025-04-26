// This file usually remains JavaScript (.js)
/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/bwsalitech/' : '',
  basePath: isProd ? '/bwsalitech' : '',
  output: 'export'
};

export default nextConfig;