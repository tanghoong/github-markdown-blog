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
 * Fonts are read from installed @fontsource packages rather than files
 * committed to the repo, so there is no binary in version control and no
 * network access during the build. Satori accepts ttf/otf/woff (not woff2).
 *
 * The Latin subset covers most titles cheaply. A CJK face is ~1.3 MB per
 * weight, so it is loaded lazily and only for posts whose title actually needs
 * it — a Latin-only blog never pays for it, and a Chinese title renders
 * properly instead of a row of tofu. Both are build-time only; neither is ever
 * sent to a browser.
 */
const latinFont = (weight: 400 | 700) =>
  require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`)

const cjkFont = (weight: 400 | 700) =>
  require.resolve(
    `@fontsource/noto-sans-tc/files/noto-sans-tc-chinese-traditional-${weight}-normal.woff`
  )

/** CJK ideographs, kana, and Hangul — the ranges Inter does not cover. */
const NON_LATIN = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef\uac00-\ud7af]/

/** Cached across the build; every post would otherwise re-read the same files. */
const fontCache = new Map<string, Buffer>()

async function loadFont(path: string): Promise<Buffer> {
  const cached = fontCache.get(path)
  if (cached) return cached
  const data = await readFile(path)
  fontCache.set(path, data)
  return data
}

export const getStaticPaths = (async () => {
  if (!features.ogImages) return []
  const posts = await getPosts()
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post }

  // A non-English post needs the CJK face even when its title happens to be
  // Latin, because the card's date line is formatted in the post's own locale
  // and `2026年8月2日` would otherwise render as tofu.
  const needsCjk =
    post.lang !== site.locale ||
    NON_LATIN.test(post.title) ||
    NON_LATIN.test(post.category ?? '') ||
    NON_LATIN.test(site.handle)

  const [regular, bold] = await Promise.all([
    loadFont(latinFont(400)),
    loadFont(latinFont(700)),
  ])

  const cjk = needsCjk
    ? await Promise.all([loadFont(cjkFont(400)), loadFont(cjkFont(700))])
    : null

  // Cards follow the site's own theme preset, so a fork that picks a
  // different palette gets share images that match it.
  const palette = getPalette(theme, 'dark')

  const meta = [formatDate(post.date, post.lang), post.category]
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
          fontFamily: 'Inter, Noto Sans TC',
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
      // Satori falls through this list per glyph, so Latin keeps Inter's
      // shapes and only the characters Inter lacks come from Noto.
      fonts: [
        { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
        ...(cjk
          ? [
              { name: 'Noto Sans TC', data: cjk[0], weight: 400 as const, style: 'normal' as const },
              { name: 'Noto Sans TC', data: cjk[1], weight: 700 as const, style: 'normal' as const },
            ]
          : []),
      ],
    }
  )

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng()

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // Stable URL, mutable contents — see the note in
      // scripts/security-headers.mjs. Must revalidate rather than be pinned.
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  })
}
