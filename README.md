# Threads-style Markdown Blog

A statically generated personal blog with a [Threads](https://www.threads.com)-like reading experience. Write markdown, `git push`, done — the site compiles to plain HTML at build time.

**Fork it, change one file, and it's your blog.** Everything site-specific lives in [`src/config.mjs`](src/config.mjs); five theme presets ship in [`src/styles/themes.css`](src/styles/themes.css).

---

## Fork this in five minutes

1. **Fork** the repo and clone it.
2. **Edit [`src/config.mjs`](src/config.mjs)** — `url`, `title`, `handle`, `bio`, `github`. The `url` drives canonical tags, Open Graph, feeds and the sitemap, so set it before anything indexes you.
3. **Pick a theme** — `theme = 'cream' | 'mono' | 'slate' | 'sepia' | 'forest'`.
4. **Delete `contents/welcome.md`** and write your own posts.
5. **Deploy** — point Cloudflare Pages or Vercel at the repo: build `npm run build`, output `dist`, Node 22.

Nothing else hard-codes an identity. `npm run check` will tell you if you broke something.

## Writing a post

Drop a markdown file into `contents/` and push.

```
contents/
├── tech/
│   └── react-tips.md        → /posts/tech/react-tips/, category "tech"
├── notes/
│   └── career-journey.md    → /posts/notes/career-journey/
└── welcome.md               → /posts/welcome/, no category
```

Frontmatter is **entirely optional** — a bare markdown file is a valid post:

| Field | If omitted |
|---|---|
| `title` | first `# Heading`, else a readable form of the filename |
| `excerpt` | first paragraph, stripped of markdown, trimmed to 200 chars |
| `date` | the file's first commit date, from git history |
| `updated` | the file's last commit date |
| `tags` | empty |
| `draft` | `false` — drafts show in `dev`, are excluded from the build |
| `pinned` | `false` — pinned posts sort to the top of the feed |

```markdown
---
title: A title different from the H1
date: 2026-03-01
tags: [astro, static-site]
pinned: true
---

# Getting Started

The first paragraph becomes the excerpt in the feed.
```

**Categories vs tags:** a category is the folder a post lives in and there is exactly one. Tags come from frontmatter and a post can have many. Both get their own index pages.

## Features

| Feature | Notes |
|---|---|
| Static HTML | no runtime data fetching, no API calls, no tokens |
| Markdown + syntax highlighting | Shiki at build time, light/dark themes |
| Five theme presets | swap with one line; contrast-checked in CI |
| Dark / light mode | no flash, resolved before first paint |
| Categories and tags | separate taxonomies, each with index pages |
| Pagination | configurable page size |
| Archive | every post grouped by year |
| Table of contents | auto-generated, appears past a configurable heading count |
| Heading permalinks | hover-revealed anchors |
| Related posts | scored by shared category and tags |
| Prev / next navigation | in feed order |
| Full-text search | Pagefind, static index, loaded on first focus |
| Social share cards | 1200×630 PNG per post, generated at build, follows your theme |
| Comments | giscus / GitHub Discussions, off by default |
| Feeds | RSS, JSON Feed, sitemap, robots.txt |
| Copy-code buttons | on every code block |
| Reading time | CJK-aware character counting |
| Security headers | CSP with generated script hashes — see [Security](#security) |
| Prefetch + view transitions | optional, ~5 KB |

## Theming

All colour lives in [`src/styles/themes.css`](src/styles/themes.css) as six tokens per preset, defined twice — once light, once dark. No component hard-codes a colour, so retheming never means touching a component.

| Preset | Character |
|---|---|
| `cream` | warm paper and obsidian (default) |
| `mono` | neutral greys, closest to Threads |
| `slate` | cool blue-grey, editorial |
| `sepia` | book-like, warmest |
| `forest` | muted green, low saturation |

### Overriding without touching the presets

For one-off tweaks there is [`src/styles/custom.css`](src/styles/custom.css) — a
commented template covering every colour token (light and dark), the font stack
and the column width. Uncomment what you want; it ships as a no-op.

Every selector in it starts with `html`, which outranks the preset selectors on
specificity, so your values win regardless of which preset is active. Keep that
prefix on rules you add — without it a rule can tie with one in `global.css`
and silently lose.

Overrides are contrast-checked too, but only **warn**:

```
[contrast] custom.css overrides detected
  light  secondary  1.56:1  BELOW AA
  ⚠  Warning only — this file is yours.
```

Presets fail the build because they ship to everyone who forks; `custom.css` is
your escape hatch, so the call stays yours.

### Adding a preset

To add your own, copy a block, rename it, and run:

```bash
npm run check:contrast
```

That parses the stylesheet and **fails if body or secondary text drops below WCAG AA (4.5:1)** against its own background. It is wired into `npm run check`, so CI enforces it. It caught three of the five presets shipped here on first write — worth running before you trust a palette you picked by eye.

Layout knobs (`feedWidth`, `postsPerPage`) and feature toggles live in `src/config.mjs`.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload. Drafts visible. |
| `npm run build` | Static build → `dist/`, then Pagefind index, then security headers. |
| `npm run preview` | Serve `dist/` locally. |
| `npm run check` | `astro check` + contrast check. |
| `npm run check:contrast` | Theme contrast only. |

## How the build works

```
contents/*.md
   │
   ├─ scripts/git-dates.mjs ──► src/data/git-dates.json   (commit dates per file)
   │
   ├─ Content Collections (src/content.config.ts)
   │     └─ glob loader + Zod schema, every field optional
   │
   ├─ src/lib/posts.ts ──► title / excerpt / category / tags / date / reading time
   │
   ├─ Astro ──► static HTML   ├─ Shiki highlighting
   │                          ├─ heading slugs + permalinks
   │                          └─ remark strips the duplicate H1
   │
   ├─ satori + resvg ──► /og/<slug>.png share cards
   ├─ pagefind ──────────► static search index
   └─ scripts/security-headers.mjs ──► dist/_headers  (CSP with script hashes)
```

Nothing in this pipeline runs in the visitor's browser.

## Security

The threat model is small by construction: static files, no server, no database, no auth, no user input. What is worth attention is documented in [SECURITY.md](SECURITY.md). Two things are worth calling out here:

**The CSP is generated, not hand-written.** The site ships a few inline scripts — the pre-paint theme bootstrap, view-transition glue, the Pagefind loader. A static policy would need `'unsafe-inline'` to keep them working, which defeats most of the point. Instead `scripts/security-headers.mjs` hashes every inline script after the build and emits those hashes, so the policy stays strict and follows the code automatically.

`dist/_headers` is in Cloudflare Pages / Netlify format. On other hosts, translate it to their header mechanism — the file is the source of truth for what the site expects.

**Markdown is trusted input.** Astro renders raw HTML embedded in markdown, which is safe only while commit access to `contents/` is trusted. If you ever accept posts by pull request from outside collaborators, add `rehype-sanitize` before merging that capability.

## Deployment

The `dist/` output is fully static.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |

The build wants **full git history** so `scripts/git-dates.mjs` can date posts that have no `date` in frontmatter. On a shallow clone it degrades to the deploy commit's date rather than failing — if accurate dates matter, either ensure a full clone or set `date:` explicitly.

`.github/workflows/build.yml` runs type and contrast checks on every push and PR. It is a correctness gate, not the deploy path.

### About incremental builds

Full rebuild, deliberately. Two reasons:

**File size is the wrong change signal** — fixing a typo that swaps one character leaves the byte count identical, so that post would never rebuild. Content hashing is correct, and git already provides it as the blob SHA.

**At this scale compilation is not the bottleneck.** A full build is a few seconds; `npm ci` takes an order of magnitude longer. Caching the install is the real win, which the workflow already does. Past roughly a thousand posts, Astro's Content Layer already caches parsed entries in `.astro/` — persisting that between CI runs makes it genuinely incremental. Nothing here blocks that.

## Design

Threads' layout language: a single column at `feedWidth`, hairline dividers instead of card borders, an avatar rail with connector lines, compact relative timestamps, a sticky translucent top bar. Only the layout patterns are borrowed; no Threads or Meta branding is used.

Every palette avoids the `#fff`/`#000` extreme, which is fatiguing over a full article, while staying above WCAG AA — enforced by `npm run check:contrast`.

> One cascade note worth keeping: the `.article` colour bindings in `global.css` are deliberately **not** inside `@layer components`. Tailwind's `prose` utilities live in the utilities layer, which wins over `components`, so bindings placed there are silently ignored — and dark mode renders near-black text on a near-black background. Unlayered rules beat every cascade layer.

## Project structure

```
├── contents/                        # your markdown posts
├── scripts/
│   ├── git-dates.mjs                # commit dates → src/data/git-dates.json
│   ├── check-contrast.mjs           # fails the build on inaccessible themes
│   └── security-headers.mjs         # dist/_headers with hashed CSP
├── src/
│   ├── config.mjs                   # site identity, theme, layout, features
│   ├── content.config.ts            # collection schema
│   ├── lib/
│   │   ├── posts.ts                 # derivation, sorting, grouping, related
│   │   └── palette.ts               # reads themes.css at build time
│   ├── plugins/                     # remark: strip the duplicate H1
│   ├── layouts/Base.astro           # head, theme bootstrap, shell
│   ├── components/                  # TopBar, PostCard, Pagination, TOC,
│   │                                # Comments, ActionRow, Avatar, Search,
│   │                                # ThemeToggle
│   ├── pages/
│   │   ├── [...page].astro          # paginated feed
│   │   ├── posts/[...slug].astro    # a post
│   │   ├── categories/[category].astro
│   │   ├── tags/[tag].astro
│   │   ├── archive.astro
│   │   ├── og/[...slug].png.ts      # share cards
│   │   ├── feed.json.ts, robots.txt.ts, rss.xml.js
│   │   └── 404.astro
│   └── styles/
│       ├── themes.css               # every palette
│       └── global.css               # tokens + article typography
└── .github/workflows/build.yml
```

## License

MIT — see [LICENSE](LICENSE).
