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
      const backendBase = process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
        },
        {
          source: '/uploads/:path*',
          destination: `${backendBase}/uploads/:path*`
        }
      ];
    }
    
    // In local dev, point to local backend
    return [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:4000/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `http://127.0.0.1:4000/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
