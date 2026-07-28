import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

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
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
  }),
})

export const collections = { posts }
