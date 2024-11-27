import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vite-plugin-remix-flat-routes',
  description: 'Remix-flat-routes style file-system routing for React',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guides', link: '/guides/introduction' },
          {
            text: 'Reference',
            link: '/reference/plugin-api',
          },
          {
            text: 'Examples',
            link: 'https://github.com/hemengke1997/vite-plugin-remix-flat-routes/tree/master/playground',
          },
        ],
        sidebar: [
          {
            text: 'Guides',
            items: [
              { text: 'Introduction', link: '/guides/introduction' },
              { text: 'Getting Started', link: '/guides/getting-started' },
              { text: 'Defining Routes', link: '/guides/defining-routes' },
              { text: 'Using Data APIs', link: '/guides/using-data-apis' },
              {
                text: 'Legacy Route',
                link: '/guides/legacy-route',
              },
              {
                text: 'Configuration Route',
                link: '/guides/configuration-route',
              },
            ],
          },
          {
            text: 'Reference',
            items: [{ text: 'Plugin API', link: '/reference/plugin-api' }],
          },
        ],
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guides/introduction' },
          {
            text: '参考',
            link: '/zh/reference/plugin-api',
          },
          {
            text: '示例',
            link: 'https://github.com/hemengke1997/vite-plugin-remix-flat-routes/tree/master/playground',
          },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '介绍', link: '/zh/guides/introduction' },
              { text: '快速上手', link: '/zh/guides/getting-started' },
              { text: '定义路由', link: '/zh/guides/defining-routes' },
              { text: '使用 Data API', link: '/zh/guides/using-data-apis' },
              {
                text: '传统路由',
                link: '/zh/guides/legacy-route',
              },
              {
                text: '配置式路由',
                link: '/zh/guides/configuration-route',
              },
            ],
          },
          {
            text: '参考',
            items: [{ text: '插件 API', link: '/zh/reference/plugin-api' }],
          },
        ],
      },
    },
  },
  base: '/vite-plugin-remix-flat-routes/',
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/hemengke1997/vite-plugin-remix-flat-routes' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 hemengke1997',
    },
    search: {
      provider: 'local',
    },
    logo: '/logo.svg',
  },
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/vite-plugin-remix-flat-routes/logo.svg' }]],
})
