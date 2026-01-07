import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    // Local development: proxy API calls to backend services
    // Only used when NEXT_PUBLIC_API_URL is empty (same-origin requests)
    return [
      // Auth service (port 8080)
      { source: "/v1/:path*", destination: "http://localhost:8080/v1/:path*" },
      // Campaign/Google Ads service (port 8081)
      { source: "/google-ads/v1/:path*", destination: "http://localhost:8081/v1/:path*" },
      // Optimization service (port 8085)
      { source: "/optimization/v1/:path*", destination: "http://localhost:8085/api/v1/:path*" },
      // Alert service (port 8086)
      { source: "/alert/v1/:path*", destination: "http://localhost:8086/v1/:path*" },
      // Analytics/Reports service (port 8083)
      { source: "/reports/v1/:path*", destination: "http://localhost:8083/v1/:path*" },
    ];
  },
};

export default nextConfig;
