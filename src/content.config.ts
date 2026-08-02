import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
// Imported directly rather than re-exported from `astro:content`, which
// deprecated its own `z` in Astro 7.
import { z } from 'zod'

/**
 * Posts are plain markdown files under `contents/`. Every frontmatter field is
 * optional by design — dropping a bare `.md` file into a folder is a complete,
 * valid post. Anything omitted is derived in `src/lib/posts.ts`:
 *
 *   title    ← first `# Heading`, else the filename
 *   excerpt  ← first paragraph, trimmed to ~200 chars
 *   date     ← git commit date (see scripts/git-dates.mjs)
 *   category ← parent folder name
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './contents' }),
  schema: z.object({
    title: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /**
     * BCP-47 tag for this post. Derived from the body when omitted, which is
     * the expected default — see `detectLang` in src/lib/posts.ts.
     */
    lang: z.string().optional(),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
  }),
})

export const collections = { posts }
