import type { APIRoute, GetStaticPaths } from 'astro'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

import { site, features, theme } from '../../config.mjs'
import { getPosts, formatDate, type Post } from '../../lib/posts'
import { getPalette } from '../../lib/palette'

const require = createRequire(import.meta.url)

/**
 * Social share cards, rendered at build time — one 1200×630 PNG per post.
 *
 * Fonts are read from the installed @fontsource package rather than a file
 * committed to the repo, so there is no binary in version control and no
 * network access during the build. Satori accepts ttf/otf/woff (not woff2).
 */
const fontFile = (weight: 400 | 700) =>
  require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`)

export const getStaticPaths = (async () => {
  if (!features.ogImages) return []
  const posts = await getPosts()
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post }

  const [regular, bold] = await Promise.all([
    readFile(fontFile(400)),
    readFile(fontFile(700)),
  ])

  // Cards follow the site's own theme preset, so a fork that picks a
  // different palette gets share images that match it.
  const palette = getPalette(theme, 'dark')

  const meta = [formatDate(post.date, site.locale), post.category]
    .filter(Boolean)
    .join('  ·  ')

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: palette.bg,
          padding: '72px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 24,
                color: palette.textSecondary,
                letterSpacing: '0.02em',
              },
              children: site.handle,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: post.title.length > 60 ? 56 : 68,
                fontWeight: 700,
                color: palette.text,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                // Satori has no line clamp; the size step above keeps long
                // titles inside the card instead.
                maxHeight: 330,
                overflow: 'hidden',
              },
              children: post.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: 24,
                color: palette.textSecondary,
              },
              children: [
                { type: 'div', props: { style: { display: 'flex' }, children: meta } },
                {
                  type: 'div',
                  props: { style: { display: 'flex' }, children: `${post.readingMinutes} min read` },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    }
  )

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng()

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
