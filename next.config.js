/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Sophia-Atlas',
  assetPrefix: '/Sophia-Atlas/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
