import { getCollection, type CollectionEntry } from 'astro:content'
import gitDates from '../data/git-dates.json'

type Entry = CollectionEntry<'posts'>

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string | null
  tags: string[]
  date: Date | null
  updated: Date | null
  pinned: boolean
  readingMinutes: number
  entry: Entry
}

const dates = gitDates as Record<string, { created: string; updated: string }>

/** First `# Heading` in the body. */
function headingTitle(body: string): string | null {
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/** Filename turned into something readable: `my-first-post` → `My first post`. */
function filenameTitle(id: string): string {
  const base = id.split('/').pop() ?? id
  const words = base.replace(/[-_]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * First real paragraph, with the title heading and common markdown syntax
 * stripped so the feed shows prose rather than markup.
 */
function deriveExcerpt(body: string, limit = 200): string {
  const withoutFrontmatter = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  const withoutTitle = withoutFrontmatter.replace(/^#\s+.+$/m, '')

  const paragraph = withoutTitle
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('```'))

  if (!paragraph) return ''

  const plain = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return plain.length > limit ? plain.slice(0, limit).trimEnd() + '…' : plain
}

function readingMinutes(body: string): number {
  // Counts CJK characters individually, everything else by whitespace-delimited
  // word, so mixed-language posts get a sane estimate.
  const cjk = (body.match(/[一-鿿぀-ヿ]/g) ?? []).length
  const words = body.replace(/[一-鿿぀-ヿ]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(cjk / 400 + words / 220))
}

function toPost(entry: Entry): Post {
  const body = entry.body ?? ''
  const filePath = entry.filePath ?? `contents/${entry.id}.md`
  const git = dates[filePath]

  const segments = entry.id.split('/')
  const category = segments.length > 1 ? segments[segments.length - 2] : null

  const date =
    entry.data.date ?? (git?.created ? new Date(git.created) : null)
  const updated =
    entry.data.updated ?? (git?.updated ? new Date(git.updated) : null)

  return {
    id: entry.id,
    slug: entry.id,
    title: entry.data.title ?? headingTitle(body) ?? filenameTitle(entry.id),
    excerpt: entry.data.excerpt ?? deriveExcerpt(body),
    category,
    tags: entry.data.tags,
    date,
    updated: updated && date && updated.getTime() === date.getTime() ? null : updated,
    pinned: entry.data.pinned,
    readingMinutes: readingMinutes(body),
    entry,
  }
}

/** Pinned first, then newest, then alphabetical for undated posts. */
function byFeedOrder(a: Post, b: Post): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  if (a.date && b.date) return b.date.getTime() - a.date.getTime()
  if (a.date) return -1
  if (b.date) return 1
  return a.title.localeCompare(b.title)
}

export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('posts', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  )
  return entries.map(toPost).sort(byFeedOrder)
}

export interface Term {
  /** As written in frontmatter or on the folder. */
  name: string
  /** URL-safe form used for routes and links. */
  slug: string
  count: number
}

/**
 * URL-safe key for a taxonomy term.
 *
 * Tags are arbitrary strings, and several common ones are hostile to URLs:
 * `c#` would truncate at the fragment, `c++` and `.net` need escaping, and
 * anything with a space needs encoding. Slugifying once here — and using the
 * result for both the generated route and every link to it — keeps the two
 * from disagreeing.
 */
function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    // Keep a readable stand-in for the two cases that would otherwise collapse
    // to the same slug as their base language name.
    .replace(/\+\+/g, '-plus-plus')
    .replace(/#/g, '-sharp')
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // A tag of only punctuation would slugify to nothing; fall back to an
  // encoded form so the route still exists and stays unique.
  return slug || encodeURIComponent(value.toLowerCase())
}

/**
 * Assigns slugs, disambiguating any that collide so two distinct terms never
 * share a route (the second would otherwise overwrite the first).
 */
function withSlugs(counts: Map<string, number>): Term[] {
  const taken = new Set<string>()

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => {
      let slug = slugify(name)
      if (taken.has(slug)) {
        let n = 2
        while (taken.has(`${slug}-${n}`)) n += 1
        slug = `${slug}-${n}`
      }
      taken.add(slug)
      return { name, slug, count }
    })
}

export async function getCategories(): Promise<Term[]> {
  const posts = await getPosts()
  const counts = new Map<string, number>()

  for (const post of posts) {
    if (!post.category) continue
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
  }

  return withSlugs(counts)
}

/** Slug for a single term, for linking from a post to its category or tags. */
export function termSlug(name: string): string {
  return slugify(name)
}

/**
 * Frontmatter tags, which are deliberately separate from categories: a
 * category comes from the folder a post lives in and there is exactly one,
 * while tags are declared in frontmatter and a post can carry many.
 */
export async function getTags(): Promise<Term[]> {
  const posts = await getPosts()
  const counts = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return withSlugs(counts)
}

/**
 * Posts grouped by year, newest first. Undated posts collect under a null year
 * rather than being dropped, so nothing silently disappears from the archive.
 */
export function groupByYear(posts: Post[]): { year: number | null; posts: Post[] }[] {
  const groups = new Map<number | null, Post[]>()

  for (const post of posts) {
    const year = post.date ? post.date.getFullYear() : null
    const bucket = groups.get(year)
    if (bucket) bucket.push(post)
    else groups.set(year, [post])
  }

  return [...groups.entries()]
    .map(([year, items]) => ({ year, posts: items }))
    .sort((a, b) => {
      if (a.year === null) return 1
      if (b.year === null) return -1
      return b.year - a.year
    })
}

/**
 * Posts sharing a category or tag with the given post, most overlap first.
 * Excludes the post itself.
 */
export function relatedTo(posts: Post[], post: Post, limit = 3): Post[] {
  const tags = new Set(post.tags)

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      let score = 0
      if (post.category && candidate.category === post.category) score += 2
      for (const tag of candidate.tags) if (tags.has(tag)) score += 1
      return { candidate, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

/** Newer and older neighbours in feed order. */
export function neighbours(posts: Post[], id: string) {
  const index = posts.findIndex((post) => post.id === id)
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  }
}

export function formatDate(date: Date | null, locale = 'en'): string {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/** Threads-style compact relative time: 3h, 2d, 5w, then an absolute date. */
export function relativeTime(date: Date | null, now = new Date()): string {
  if (!date) return ''
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  if (seconds < 2629800) return `${Math.floor(seconds / 604800)}w`

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}
