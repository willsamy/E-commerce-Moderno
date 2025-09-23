/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'images.unsplash.com' 
      },
      { 
        protocol: 'https', 
        hostname: '**' 
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Otimizações para Vercel
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Configurações de build para produção
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig