import type { NextConfig } from 'next'

// BACKEND_URL: base URL of the FastAPI backend (no trailing slash).
//   Local dev : http://localhost:8000 (default)
//   Production: https://<workspace>--examind-be-api.modal.run
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
