/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fileshift/shared-types', '@fileshift/constants'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
