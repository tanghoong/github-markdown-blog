# Threads-style Markdown Blog

A statically generated personal blog with a [Threads](https://www.threads.com)-like reading experience. Write markdown, `git push`, done — the site is compiled to plain HTML at build time.

**Zero JavaScript frameworks ship to the browser.** A page load is HTML + 33 KB of CSS, plus about 1 KB of inline script for the theme toggle and search.

## Why this exists

This branch replaces the previous client-side SPA, which fetched markdown from the GitHub REST API at runtime. That approach had structural problems no amount of polish could fix: content was invisible to crawlers, every visitor burned GitHub API rate limit, personal access tokens had to live in `localStorage`, and unsanitized markdown was rendered straight into the DOM.

Building at compile time removes all four by construction — there is no API call, no token, no runtime rendering of untrusted input, and crawlers get finished HTML.

## Writing a post

Drop a markdown file into `contents/` and push. That is the whole workflow.

```
contents/
├── tech/
│   └── react-tips.md        → /posts/tech/react-tips/, category "tech"
├── personal/
│   └── career-journey.md    → /posts/personal/career-journey/
└── welcome.md               → /posts/welcome/, no category
```

Frontmatter is **entirely optional**. A bare markdown file is a valid post:

| Field | If omitted |
|---|---|
| `title` | first `# Heading`, else a readable form of the filename |
| `excerpt` | first paragraph, stripped of markdown, trimmed to 200 chars |
| `date` | the file's first commit date, from git history |
| `updated` | the file's last commit date |
| `tags` | empty |
| `draft` | `false` — drafts are visible in `dev`, excluded from the build |
| `pinned` | `false` — pinned posts sort to the top of the feed |

Add frontmatter only when you want to override something:

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

The first `# Heading` is removed from the rendered body, since it is promoted to the page title.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload. Drafts are visible. |
| `npm run build` | Static build into `dist/`, then the Pagefind search index. |
| `npm run preview` | Serve `dist/` locally. |
| `npm run check` | `astro check` — type checks `.astro`, `.ts` and content schemas. |

Site identity (name, handle, bio, repo, canonical URL) lives in one file: [`src/config.mjs`](src/config.mjs).

## How the build works

```
contents/*.md
   │
   ├─ scripts/git-dates.mjs ──► src/data/git-dates.json   (commit dates per file)
   │
   ├─ Content Collections (src/content.config.ts)
   │     └─ glob loader + Zod schema, all fields optional
   │
   ├─ src/lib/posts.ts ──► derives title / excerpt / category / date / reading time
   │
   ├─ Astro ──► static HTML  ├─ Shiki syntax highlighting (build time)
   │                          └─ remark strips the duplicate H1
   │
   └─ pagefind --site dist ──► static search index
```

Nothing in this pipeline runs in the visitor's browser.

## Deployment

The `dist/` output is fully static. **Cloudflare Pages or Vercel is the shortest path** — both build on push natively, so no CI configuration is needed:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |

One requirement: the build needs **full git history**, because `scripts/git-dates.mjs` reads commit dates for posts without a `date` in frontmatter. On Cloudflare Pages this is the default. On any platform that does a shallow clone, either disable that or put explicit `date:` fields in your frontmatter — the script degrades gracefully and simply omits dates it cannot resolve.

`.github/workflows/build.yml` runs the type check and build on every push and PR. It is a correctness gate, not the deploy path.

### About incremental builds

The original ask was to recompile only the articles that changed. Two notes on that:

**File size is the wrong change signal.** Fixing a typo that swaps one character leaves the byte count identical, and that post would never rebuild. Content hashing is the correct primitive — and git already provides it for free as the blob SHA.

**At this scale it is not needed yet.** The full build of 13 posts takes **1.7 seconds**; `npm ci` takes an order of magnitude longer. Dependency install, not compilation, is the thing worth caching — which the workflow already does.

If the archive grows past roughly a thousand posts and builds exceed a couple of minutes, Astro's Content Layer already caches parsed entries in `.astro/`. Persisting that directory between CI runs turns it into a genuine incremental build, keyed on content hash. The current structure does not block that; it just does not pay for it prematurely.

## Design

The layout follows Threads' patterns — a 640 px single column, hairline dividers instead of card borders, an avatar rail with connector lines, compact relative timestamps, a sticky translucent top bar, and a two-tone palette tuned for reading — warm cream (`#faf7f1`) in light, obsidian grey (`#17191c`) in dark. Only the layout language is borrowed; no Threads or Meta branding is used.

Theme resolution order: saved preference → system `prefers-color-scheme` → light. It is applied by an inline script before first paint, so there is no flash.

Colours are defined once as CSS custom properties in [`src/styles/global.css`](src/styles/global.css) and consumed everywhere, including by Tailwind Typography via its `--tw-prose-*` variables.

The palette deliberately avoids the `#fff`/`#000` extreme, which is fatiguing over a full article. Contrast is still comfortably above WCAG AA — body text measures 11.2:1 in light and 12.1:1 in dark, secondary text 4.5:1 and 5.1:1.

> One cascade note worth keeping: the `.article` colour bindings are deliberately **not** inside `@layer components`. Tailwind's `prose` utilities live in the utilities layer, which wins over `components`, so bindings placed there are silently ignored — and dark mode renders near-black text on a near-black background. Unlayered rules beat every cascade layer.

## Features

| Feature | Notes |
|---|---|
| Static HTML generation | 18 pages, 1.7 s build |
| Markdown + syntax highlighting | Shiki at build time, dual light/dark themes |
| Categories | folder name, with per-category pages |
| Full-text search | Pagefind, static index, loaded on first focus |
| Dark / light mode | no flash, no framework |
| RSS + sitemap | `/rss.xml`, `/sitemap-index.xml` |
| Prev / next navigation | in feed order |
| Reading time | CJK-aware character counting |
| SEO | real `<title>`, meta description, canonical, Open Graph, in the served HTML |
| Share / reply / source | native share sheet with clipboard fallback; reply opens a GitHub issue |

## Adding interactivity later

Both interactive elements are plain Astro components with hoisted scripts, so no UI framework runtime is shipped. If you later need a genuinely stateful island:

```bash
npx astro add react
```

Then use `client:load` on that one component. Only pages containing it pay the cost. React was deliberately removed from this branch after measurement — it added **186 KB to every page** to power a theme toggle.

## Project structure

```
├── contents/                        # your markdown posts
├── scripts/git-dates.mjs            # commit dates → src/data/git-dates.json
├── src/
│   ├── config.mjs                   # site identity — start here
│   ├── content.config.ts            # collection schema
│   ├── lib/posts.ts                 # metadata derivation, sorting, formatting
│   ├── plugins/                     # remark plugin: strip the duplicate H1
│   ├── layouts/Base.astro           # head, theme bootstrap, shell
│   ├── components/                  # TopBar, PostCard, ActionRow, Avatar,
│   │                                # ThemeToggle, Search
│   ├── pages/
│   │   ├── index.astro              # the feed
│   │   ├── posts/[...slug].astro    # a post
│   │   ├── tags/[tag].astro         # a category
│   │   ├── rss.xml.js
│   │   └── 404.astro
│   └── styles/global.css            # tokens + article typography
└── .github/workflows/build.yml
```

## License

MIT — see [LICENSE](LICENSE).
