import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'llmctx',
  description: 'Code intelligence tool with semantic search',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'ADRs', link: '/adr/' }
    ],
    
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/' },
        { text: 'Configuration', link: '/guide/configuration' },
        { text: 'Indexing Code', link: '/guide/indexing' },
        { text: 'Querying', link: '/guide/querying' }
      ],
      '/adr/': [
        { text: 'ADR-0001: Hexagonal Architecture', link: '/adr/0001-hexagonal-architecture' },
        { text: 'ADR-0002: Plugin System', link: '/adr/0002-plugin-system' }
      ]
    }
  }
}); 