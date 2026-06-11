import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    // Only proxy on Vercel/Production. Locally, the browser will hit the API directly 
    // or proxy to localhost to avoid ENOTFOUND tunnel DNS errors.
    const isVercel = process.env.VERCEL === '1';
    const isProd = process.env.NODE_ENV === 'production';
    
    if ((isVercel || isProd) && process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
        }
      ];
    }
    
    // In local dev, if we still want to avoid CORS for some reason, point to local backend
    return [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:4000/api/:path*`
      }
    ];
  }
};

export default nextConfig;
