import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply smart caching to all page routes, but NOT to static assets (images, fonts, etc.)
        source: '/((?!_next|static|favicon.ico|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            // s-maxage=1: Cloudflare/CDN ignores it after 1 second
            // stale-while-revalidate: Serve old version instantly while fetching new one in background
            value: 'public, s-maxage=1, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
