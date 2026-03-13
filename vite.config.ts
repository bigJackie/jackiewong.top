import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import Markdown from 'vite-plugin-vue-markdown'
import shiki from 'markdown-it-shiki'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-toc-done-right'
import { slugify } from 'transliteration'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueDevTools(),
    Markdown({
      wrapperComponent: 'post',
      markdownItSetup(md) {
        md.use(shiki, {
          theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
        })
        md.use(anchor, {
          level: 2,
          slugify: slugify,
          permalink: true,
          permalinkBefore: true,
          permalinkSymbol: '#',
        })
        md.use(toc, {
          level: 2,
          slugify: slugify,
          containerClass: 'md-toc',
          listClass: 'md-toc-list',
          itemClass: 'md-toc-item',
          linkClass: 'md-toc-link',
          listType: 'ul',
        })
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/abstracts/mixins" as mx;
          @use "@/styles/abstracts/breakpoints" as bp;
        `,
      },
    },
  },
})
