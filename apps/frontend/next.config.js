/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@shared/types', '@shared/utils'],
  eslint: {
    // ESLint plugin deps aren't installed at the monorepo root level;
    // skip ESLint during `next build` to avoid missing-plugin errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
