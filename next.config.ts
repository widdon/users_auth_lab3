import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Включает директиву 'use cache', cacheLife/cacheTag и Partial Prerendering
  cacheComponents: true,
  // Рекомендуется вместе с Cache Components в Next.js 16.4+
  partialPrefetching: true,
  images: {
    // Аватары DummyJSON отдаются с https://dummyjson.com/icon/<username>/128
    remotePatterns: [{ protocol: 'https', hostname: 'dummyjson.com', pathname: '/icon/**' }],
  },
};

export default nextConfig;
