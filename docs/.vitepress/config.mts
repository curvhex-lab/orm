import { defineConfig } from 'vitepress'

const enNav = [
  { text: 'Guide', link: '/guide/introduction' },
  { text: 'Examples', link: '/examples/solana-task-board' },
  { text: 'API Reference', link: '/api/define-model' },
  { text: 'Roadmap', link: '/guide/roadmap' },
  { text: 'Team', link: '/team' },
  {
    text: 'v0.1.2',
    items: [
      { text: 'Changelog', link: 'https://github.com/vertext-labs/orm/releases' },
      { text: 'npm', link: 'https://www.npmjs.com/package/@curvhex/orm' },
    ],
  },
]

const trNav = [
  { text: 'Rehber', link: '/tr/guide/introduction' },
  { text: 'Örnekler', link: '/tr/examples/solana-task-board' },
  { text: 'API Referansı', link: '/tr/api/define-model' },
  { text: 'Yol Haritası', link: '/tr/guide/roadmap' },
  { text: 'Ekip', link: '/tr/team' },
  {
    text: 'v0.1.2',
    items: [
      { text: 'Değişiklik Günlüğü', link: 'https://github.com/vertext-labs/orm/releases' },
      { text: 'npm', link: 'https://www.npmjs.com/package/@curvhex/orm' },
    ],
  },
]

const enSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
      { text: 'Installation', link: '/guide/installation' },
    ],
  },
  {
    text: 'Core Concepts',
    items: [
      { text: 'Schema Definition', link: '/guide/schema' },
      { text: 'Querying', link: '/guide/querying' },
      { text: 'Filtering', link: '/guide/filtering' },
      { text: 'Relations', link: '/guide/relations' },
      { text: 'Aggregations', link: '/guide/aggregations' },
    ],
  },
  {
    text: 'Adapters',
    items: [
      { text: 'Overview', link: '/guide/adapters' },
      { text: 'RpcAdapter', link: '/guide/rpc-adapter' },
      { text: 'HeliusAdapter', link: '/guide/helius-adapter' },
      { text: 'PostgresAdapter', link: '/guide/postgres-adapter' },
    ],
  },
  {
    text: 'API Reference',
    items: [
      { text: 'defineModel', link: '/api/define-model' },
      { text: 'CurvhexORM', link: '/api/curvhex-orm' },
      { text: 'findMany', link: '/api/find-many' },
      { text: 'findFirst', link: '/api/find-first' },
      { text: 'findByAddress', link: '/api/find-by-address' },
      { text: 'findByPda', link: '/api/find-by-pda' },
      { text: 'count', link: '/api/count' },
      { text: 'aggregate', link: '/api/aggregate' },
      { text: 'groupBy', link: '/api/group-by' },
      { text: 'Field Types', link: '/api/field-types' },
    ],
  },
  {
    text: 'Examples',
    items: [
      { text: 'Solana Task Board', link: '/examples/solana-task-board' },
    ],
  },
  {
    text: 'Contributing',
    items: [
      { text: 'Architecture', link: '/guide/architecture' },
      { text: 'Adding an Adapter', link: '/guide/custom-adapter' },
      { text: 'Roadmap', link: '/guide/roadmap' },
    ],
  },
]

const trSidebar = [
  {
    text: 'Başlangıç',
    items: [
      { text: 'Giriş', link: '/tr/guide/introduction' },
      { text: 'Hızlı Başlangıç', link: '/tr/guide/quick-start' },
      { text: 'Kurulum', link: '/tr/guide/installation' },
    ],
  },
  {
    text: 'Temel Kavramlar',
    items: [
      { text: 'Şema Tanımı', link: '/tr/guide/schema' },
      { text: 'Sorgulama', link: '/tr/guide/querying' },
      { text: 'Filtreleme', link: '/tr/guide/filtering' },
      { text: 'İlişkiler', link: '/tr/guide/relations' },
      { text: 'Agregasyon', link: '/tr/guide/aggregations' },
    ],
  },
  {
    text: 'Adaptörler',
    items: [
      { text: 'Genel Bakış', link: '/tr/guide/adapters' },
      { text: 'RpcAdapter', link: '/tr/guide/rpc-adapter' },
      { text: 'HeliusAdapter', link: '/tr/guide/helius-adapter' },
      { text: 'PostgresAdapter', link: '/tr/guide/postgres-adapter' },
    ],
  },
  {
    text: 'API Referansı',
    items: [
      { text: 'defineModel', link: '/tr/api/define-model' },
      { text: 'CurvhexORM', link: '/tr/api/curvhex-orm' },
      { text: 'findMany', link: '/tr/api/find-many' },
      { text: 'findFirst', link: '/tr/api/find-first' },
      { text: 'findByAddress', link: '/tr/api/find-by-address' },
      { text: 'findByPda', link: '/tr/api/find-by-pda' },
      { text: 'count', link: '/tr/api/count' },
      { text: 'aggregate', link: '/tr/api/aggregate' },
      { text: 'groupBy', link: '/tr/api/group-by' },
      { text: 'Alan Türleri', link: '/tr/api/field-types' },
    ],
  },
  {
    text: 'Örnekler',
    items: [
      { text: 'Solana Görev Panosu', link: '/tr/examples/solana-task-board' },
    ],
  },
  {
    text: 'Katkı',
    items: [
      { text: 'Mimari', link: '/tr/guide/architecture' },
      { text: 'Adaptör Ekleme', link: '/tr/guide/custom-adapter' },
      { text: 'Yol Haritası', link: '/tr/guide/roadmap' },
    ],
  },
]

export default defineConfig({
  title: 'Curvhex ORM',
  description: 'TypeScript ORM for Solana PDA accounts',
  base: '/orm/',

  head: [
    ['link', { rel: 'icon', href: '/orm/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { property: 'og:title', content: 'Curvhex ORM' }],
    ['meta', { property: 'og:description', content: 'TypeScript ORM for Solana PDA accounts. Query, filter, and aggregate on-chain data with a Prisma-style API.' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        editLink: {
          pattern: 'https://github.com/vertext-labs/orm/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },
      },
    },
    tr: {
      label: 'Türkçe',
      lang: 'tr',
      themeConfig: {
        nav: trNav,
        sidebar: trSidebar,
        editLink: {
          pattern: 'https://github.com/vertext-labs/orm/edit/main/docs/:path',
          text: 'Bu sayfayı GitHub\'da düzenle',
        },
        outlineTitle: 'Bu sayfada',
        returnToTopLabel: 'Yukarı dön',
        sidebarMenuLabel: 'Menü',
        darkModeSwitchLabel: 'Tema',
        langMenuLabel: 'Dil',
        docFooter: {
          prev: 'Önceki sayfa',
          next: 'Sonraki sayfa',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Curvhex ORM',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vertext-labs/orm' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@curvhex/orm' },
    ],

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2025 Curvhex',
    },

    search: {
      provider: 'local',
    },
  },
})
