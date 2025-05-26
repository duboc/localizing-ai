import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_VERTEX_API_URL: process.env.NEXT_PUBLIC_VERTEX_API_URL,
    NEXT_PUBLIC_SCRAPER_API_URL: process.env.NEXT_PUBLIC_SCRAPER_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  }
};

export default nextConfig;
