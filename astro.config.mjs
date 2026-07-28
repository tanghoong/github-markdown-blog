import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import { remarkStripLeadingHeading } from './src/plugins/remark-strip-leading-heading.mjs'
import { site } from './src/config.mjs'

// https://astro.build/config
export default defineConfig({
  site: site.url,
  // Both interactive bits (theme toggle, search) are plain Astro components
  // with hoisted scripts, so no UI-framework runtime ships. Adding React later
  // for a genuinely stateful island is one command: `npx astro add react`.
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // The first `# Heading` is promoted to the post title, so drop it from the
    // body to avoid rendering the title twice.
    remarkPlugins: [remarkStripLeadingHeading],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
})
