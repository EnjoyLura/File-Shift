/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fileshift/shared-types', '@fileshift/constants'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
