/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Groq and Supabase calls from server components and API routes
  // No external image domains needed for Phase 1
  experimental: {
    // Server Actions enabled by default in Next.js 14 — explicit here for clarity
    serverActions: {
      allowedOrigins: ['localhost:3000', 'zyvv.app', '*.vercel.app'],
    },
  },

  // Silence Supabase realtime websocket warnings during build
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
