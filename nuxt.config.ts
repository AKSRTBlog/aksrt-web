import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  srcDir: '.',
  modules: ['@nuxt/icon'],
  icon: {
    // 使用 CSS 模式（FA6 在此模式下更可靠）
    mode: 'css',
    // 本地打包常用图标集
    serverBundle: ['lucide'],
    clientBundle: ['lucide'],
    // 其他图标从 CDN 按需加载（包括 FA6）
    providers: ['iconify', 'local'],
  },
  ssr: true,
  sourcemap: {
    client: false,
    server: false,
  },
  experimental: {
    appManifest: false,
  },
  css: ['~/assets/css/main.css', '~/assets/css/admin.css'],
  vite: {
    css: {
      devSourcemap: false,
    },
    build: {
      sourcemap: false,
    },
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [workspaceRoot],
      },
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap' },
        // FontAwesome 6 CSS (用于 icon mode='css')
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', integrity: 'sha512-DTOQO9RW3CHCoKbIbs/0dRjP7m6FqVU3XvC+L/RaFYlDPGq6W+M/9N+5H8f8B+qH1wJYBMSMKM5e8SIE5u', crossorigin: 'anonymous' },
      ],
    },
  },
  runtimeConfig: {
    // Used by server-side rendering and Nitro server routes.
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:4000',
    public: {
      // Production: set via NUXT_PUBLIC_API_BASE environment variable
      // Development: 'http://127.0.0.1:4000' (set via .env or default below)
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:4000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000',
    },
  },
  routeRules: {
    '/admin/**': { ssr: false },
    '/**': { prerender: false },
  },
  loadingIndicator: {
    color: '#b15d32',
    height: '2px',
  },
  nitro: {
    compressPublicAssets: true,
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
