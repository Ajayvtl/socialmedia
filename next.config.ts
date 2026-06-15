import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    // ALWAYS proxy to the local backend running on port 4000 by default.
    // This prevents circular routing if NEXT_PUBLIC_API_URL points to the Next.js frontend itself (e.g. via Cloudflare Tunnel).
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
