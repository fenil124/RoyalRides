import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/image': path.resolve(__dirname, './src/lib/adapters/next-image.tsx'),
        'next/link': path.resolve(__dirname, './src/lib/adapters/next-link.tsx'),
        'next/navigation': path.resolve(__dirname, './src/lib/adapters/next-navigation.ts'),
        'next/font/google': path.resolve(__dirname, './src/lib/adapters/next-font.ts'),
        'next/cache': path.resolve(__dirname, './src/lib/adapters/next-cache.ts'),
      },
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        NEXT_PUBLIC_DEMO_MODE: JSON.stringify(env.NEXT_PUBLIC_DEMO_MODE || env.VITE_DEMO_MODE || 'false'),
        NEXT_PUBLIC_SUPABASE_URL: JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: JSON.stringify(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ''),
        NEXT_PUBLIC_APP_URL: JSON.stringify(env.NEXT_PUBLIC_APP_URL || env.VITE_APP_URL || ''),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist/client',
      emptyOutDir: true,
    },
  };
});
