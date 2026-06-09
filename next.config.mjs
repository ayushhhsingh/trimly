/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server external packages for App Router
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Experimental features for Next.js 16 App Router
  experimental: {
    // Server actions body size limit
    serverActions: {
      bodySizeLimit: '80mb',
    },
  },
};

export default nextConfig;
