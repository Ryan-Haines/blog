import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    define: {
      '__CF_PAGES_BRANCH__': JSON.stringify(process.env.CF_PAGES_BRANCH || ''),
    },
  },
  site: 'https://yourdomain.com', // Update this with your domain
  output: 'server', // Server mode for actions (Astro v5 removed hybrid mode)
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});

