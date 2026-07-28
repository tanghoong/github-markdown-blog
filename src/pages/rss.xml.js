import rss from '@astrojs/rss'
import { site } from '../config.mjs'
import { getPosts } from '../lib/posts'

export async function GET(context) {
  const posts = await getPosts()

  return rss({
    title: site.title,
    description: site.bio,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      link: `/posts/${post.slug}/`,
      ...(post.date ? { pubDate: post.date } : {}),
      categories: post.category ? [post.category] : [],
    })),
  })
}
