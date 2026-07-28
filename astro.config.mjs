import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { remarkStripLeadingHeading } from './src/plugins/remark-strip-leading-heading.mjs'
import { site, features } from './src/config.mjs'

// https://astro.build/config
export default defineConfig({
  site: site.url,
  integrations: [sitemap()],

  // Hover-prefetch. Costs a couple of KB; disable via `features.prefetch`
  // to return to a build that ships no navigation JS at all.
  prefetch: features.prefetch ? { prefetchAll: true, defaultStrategy: 'hover' } : false,

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    // Keep CSS in an external file rather than inlining small sheets, so the
    // Content-Security-Policy can use `style-src 'self'` for stylesheets
    // instead of having to allow arbitrary inline <style> blocks.
    inlineStylesheets: 'never',
  },

  markdown: {
    // The first `# Heading` is promoted to the post title, so drop it from the
    // body to avoid rendering the title twice.
    remarkPlugins: [remarkStripLeadingHeading],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            class: 'heading-anchor',
            ariaLabel: 'Link to this section',
          },
          // A span rather than the default '#' text node, so it can be hidden
          // until hover without also hiding it from screen readers.
          content: { type: 'element', tagName: 'span', properties: {}, children: [] },
        },
      ],
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
})
