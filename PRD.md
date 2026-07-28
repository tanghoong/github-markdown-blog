# PRD — Threads-style Markdown Blog

## Product

A personal blog where writing happens in markdown files and publishing happens with `git push`. Content lives in the repository; the site is compiled to static HTML at build time. Readers get a Threads-like feed.

**Complexity:** static content site. No backend, no database, no runtime API calls.

## Experience qualities

1. **Effortless to publish** — adding a file and pushing is the entire workflow. No admin UI, no CMS, no configuration per post.
2. **Effortless to read** — content loads instantly and is legible in both themes; nothing competes with the text.
3. **Familiar** — the feed behaves the way readers already expect a social timeline to behave.

## Essential features

**Zero-configuration authoring**
- Trigger: author adds `contents/**/*.md` and pushes.
- Behaviour: title, excerpt, category, date and reading time are all derived if not declared. Frontmatter overrides any of them.
- Success: a markdown file with no frontmatter renders as a complete, correctly dated post.

**Static compilation on push**
- Trigger: push to `main`.
- Progression: host clones → `npm ci` → git dates resolved → Astro builds → Pagefind indexes → deploy.
- Success: no GitHub API call, no token, and no markdown parsing in the visitor's browser.

**Threads-style feed**
- Single 640 px column, hairline dividers, avatar rail, relative timestamps, category chips, sticky translucent top bar.
- Success: recognisably the same interaction model, using none of Threads' branding.

**Reading view**
- Full article with build-time syntax highlighting, prev/next navigation, share, reply-via-GitHub-issue, and a link to the source file.

**Search**
- Static index built at compile time, queried client-side, loaded lazily on first focus.
- Success: works on any static host with no search backend.

**Theming**
- Light and dark, resolved from saved preference then system preference, applied before first paint.

## Non-goals

- Runtime content sources. The repo is the only source of truth; there is no facility to point the site at another repository at runtime.
- Reading local files through the browser.
- Any feature requiring a server: real like counts, follower graphs, authenticated drafts.
- Comment storage. Replies are delegated to GitHub.

## Edge cases

- **No frontmatter** — everything is derived; this is the expected default, not a fallback.
- **No H1 in the body** — the filename becomes the title.
- **Shallow clone in CI** — git dates cannot be resolved; the script degrades to an empty map and posts render without dates rather than failing the build.
- **No search index** (dev server, or the Pagefind step skipped) — the search field hides itself instead of erroring.
- **Empty `contents/`** — the feed renders an explicit empty state.
- **Non-ASCII content** — handled natively; markdown is read from disk as UTF-8, and reading time counts CJK characters individually.

## Design direction

Threads' layout language: dense but calm, generous vertical rhythm, hairlines over boxes, system font stack, warm off-white and obsidian grey rather than pure white and black. Type is sized for reading, not for chrome.

**Colour** — a token set defined once in CSS custom properties and consumed by both the UI and the article typography.

Tuned for long-form reading rather than maximum contrast. Light is a warm cream, dark an obsidian grey; both step back from the `#fff`/`#000` extreme, which is fatiguing across a full article.

| Token | Light (warm cream) | Dark (obsidian) |
|---|---|---|
| `--color-bg` | `#faf7f1` | `#17191c` |
| `--color-bg-elevated` | `#f3eee4` | `#1f2226` |
| `--color-text` | `#3a3630` | `#d8d6d1` |
| `--color-text-secondary` | `#787163` | `#8b8a85` |
| `--color-border` | `#e5ded1` | `#2c2f34` |

Softening the palette costs no accessibility — measured against their own background, body text is 11.2:1 (light) and 12.1:1 (dark), and secondary text 4.5:1 and 5.1:1. All clear WCAG AA for body copy.

**Motion** — near none. Colour transitions on hover only, and everything is disabled under `prefers-reduced-motion`.

## Performance budget

| Metric | Budget | Actual |
|---|---|---|
| JS shipped from a framework | 0 KB | 0 KB |
| CSS | < 50 KB | 33 KB |
| Inline script | < 5 KB | ~1 KB |
| Build time (13 posts) | < 30 s | 1.7 s |

Any change that puts a UI framework runtime on every page fails this budget. Islands are permitted where a page genuinely needs one.
