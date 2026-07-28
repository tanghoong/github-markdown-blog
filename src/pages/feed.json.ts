import type { APIRoute } from 'astro'
import { site } from '../config.mjs'
import { getPosts } from '../lib/posts'

/** JSON Feed 1.1 — https://jsonfeed.org/version/1.1 */
export const GET: APIRoute = async ({ site: origin }) => {
  const posts = await getPosts()
  const base = origin ?? new URL(site.url)

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: site.title,
    description: site.bio,
    home_page_url: base.href,
    feed_url: new URL('/feed.json', base).href,
    language: site.locale,
    authors: [{ name: site.title, url: `https://github.com/${site.github.split('/')[0]}` }],
    items: posts.map((post) => ({
      id: new URL(`/posts/${post.slug}/`, base).href,
      url: new URL(`/posts/${post.slug}/`, base).href,
      title: post.title,
      summary: post.excerpt,
      content_text: post.excerpt,
      ...(post.date ? { date_published: post.date.toISOString() } : {}),
      ...(post.updated ? { date_modified: post.updated.toISOString() } : {}),
      tags: [...(post.category ? [post.category] : []), ...post.tags],
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
