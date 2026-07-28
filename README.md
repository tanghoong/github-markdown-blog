# GitHub Markdown Blog

A 100% client-side blog reader. It renders markdown files that live either in a **GitHub repository** (fetched at runtime through the GitHub REST API) or in a **local folder on your machine** (read through the browser File System Access API).

There is no backend, no database, and no build step for your content — the app is a static SPA that fetches markdown in the browser and renders it.

> **Status: working prototype, not production-hardened.** The app builds and runs, but there are known correctness and security gaps listed in [Security](#security) and [Known Issues](#known-issues--limitations). Read those two sections before deploying it publicly or pointing it at a private repository.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Content Structure](#content-structure)
- [Features](#features)
- [Project Structure](#project-structure)
- [Security](#security)
- [Known Issues & Limitations](#known-issues--limitations)
- [Dependency Health](#dependency-health)
- [Before You Start Coding](#before-you-start-coding)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## How It Works

```
Browser (SPA)
  │
  ├─ RepoSetup ──────────► config saved to localStorage (key: "blog-repo-config")
  │
  ├─ getContentProvider(source)
  │     ├─ GitHubContentProvider ──► GitHub REST API (Octokit) ──► recursive walk of the
  │     │                                                          configured path, one
  │     │                                                          request per directory
  │     │                                                          and one per .md file
  │     └─ LocalFileSystemProvider ─► window.showDirectoryPicker() ──► recursive walk of
  │                                                                    the chosen folder
  │
  ├─ in-memory cache (5 min, GitHub mode only — cleared on Refresh / Change Repository)
  │
  └─ PostList / PostReader ──► marked() ──► dangerouslySetInnerHTML
```

Post metadata is derived from the file itself — there is **no front matter parsing**:

| Field | Derived from |
|---|---|
| `title` | first `# Heading`, falling back to the filename |
| `excerpt` | first paragraph after the title, truncated to 150 chars |
| `category` | name of the immediate parent folder |
| `date` | file `lastModified` — **local mode only**; GitHub mode has no date |
| `path` / `sha` | file path and blob SHA (local mode generates a synthetic id) |

## Tech Stack

| Area | Choice | Version |
|---|---|---|
| Framework | React | 19 |
| Build tool | Vite | 6.3.5 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS | 4.1 (`@tailwindcss/vite`) |
| Components | shadcn/ui (new-york) on Radix UI | — |
| Markdown | `marked` | 15 |
| GitHub API | `octokit` / `@octokit/core` | 4.x / 6.x |
| Icons | `@phosphor-icons/react`, `lucide-react`, `@heroicons/react` | — |
| Node | 18+ recommended (Vite 6 requires ≥18) | — |

`package.json` also carries `three`, `d3`, `recharts`, `framer-motion`, `react-hook-form`, `zod`, `@tanstack/react-query`, `next-themes`, `@github/spark` and the full shadcn/ui component set — **none of which the blog code imports**. They are leftovers from the GitHub Spark template this project was generated from. See [Known Issues](#known-issues--limitations).

## Getting Started

```bash
git clone https://github.com/tanghoong/github-markdown-blog.git
cd github-markdown-blog
npm install
npm run dev        # Vite dev server
```

| Script | What it does | Works today? |
|---|---|---|
| `npm run dev` | Start the Vite dev server | ✅ |
| `npm run build` | `tsc -b --noCheck && vite build` | ✅ (type errors are **skipped**, see below) |
| `npm run preview` | Serve the production build | ✅ |
| `npm run lint` | `eslint .` | ❌ **fails** — no `eslint.config.js` in the repo |
| `npm run kill` | `fuser -k 5000/tcp` | Linux only; the dev server actually uses Vite's default port |

There is **no test script and no test framework** installed.

## Configuration

All configuration is entered in the setup screen on first load and persisted to `localStorage` under `blog-repo-config`. There are **no environment variables and no config files** — nothing is read at build time.

### GitHub mode

| Field | Required | Default | Notes |
|---|---|---|---|
| Repository Owner | ✅ | — | user or org |
| Repository Name | ✅ | — | |
| Branch | | `main` | |
| Path to Posts | | `contents` | subfolders become categories |
| GitHub Token | | — | raises the rate limit from 60 → 5,000 req/h. **Read [Security](#security) first.** |
| Blog Title / Description / SEO Description | | derived | drive `<title>` and `<meta name="description">` |

### Local mode

Only the blog title/description fields apply; clicking **Select Folder** opens the browser directory picker.

To reset or switch sources, click **Change Repository** in the header (clears the config and the cache).

## Content Structure

```
contents/
├── tech/                      # category: "tech"
│   ├── react-tips.md
│   └── web-performance.md
├── personal/                  # category: "personal"
│   └── career-journey.md
└── welcome.md                 # no category → "Uncategorized"
```

Only `.md` and `.markdown` files are picked up. Nesting is walked recursively, but **only the immediate parent folder name is used as the category** — `contents/a/b/post.md` gets category `b`, not `a/b`.

A sample content set lives in [`contents/`](contents/) of this repository, so you can point the app at `tanghoong/github-markdown-blog` with path `contents` to see it work.

### Post format

```markdown
# Your Post Title

This first paragraph becomes the excerpt in the post list. Keep it under 150 characters.

## Section Heading

Body content. Standard markdown: lists, **bold**, *italic*, `code`, links, images, code fences.
```

## Features

Verified against the current code:

| Feature | Status | Notes |
|---|---|---|
| Markdown rendering | ✅ | `marked`, styled with Tailwind Typography classes |
| GitHub repository source | ✅ | public repos; private repos need a token |
| Local folder source | ⚠️ | works on first pick; **breaks on page reload** (see Known Issues) |
| Category grouping & filtering | ✅ | folder name = category; filter buttons in the post list |
| Search (title + excerpt + content) | ✅ | client-side, real-time, with match highlighting |
| Sidebar navigation | ✅ | posts grouped by category |
| Post caching | ⚠️ | 5-minute in-memory cache, **GitHub mode only**; lost on reload |
| Manual refresh | ✅ | clears the cache and refetches |
| Responsive layout | ✅ | mobile drawer sidebar + desktop static sidebar |
| SEO title / meta description | ⚠️ | set client-side after hydration — crawlers that don't run JS see nothing |
| Syntax highlighting | ❌ | not implemented; code blocks are plain `<pre>` |
| Dark mode | ❌ | dark palette variables exist, no toggle and no `prefers-color-scheme` wiring |
| Routing / deep links | ❌ | no router — every post lives at `/`, no shareable post URLs, browser Back exits the app |
| Pagination | ❌ | all posts render at once |
| Front matter (tags, dates, drafts) | ❌ | not parsed |
| Tests | ❌ | none |

## Project Structure

```
├── contents/                 # sample markdown content (also demo data for this app)
├── src/
│   ├── App.tsx               # state, routing-by-state, BlogPost/RepoConfig types
│   ├── main.tsx              # React root + ErrorBoundary
│   ├── lib/
│   │   ├── contentProviders.ts   # ContentProvider interface + GitHub/Local impls + cache
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useKV.ts          # localStorage-backed key/value hook
│   │   └── use-mobile.ts
│   ├── components/           # BlogHeader, BlogSidebar, BlogFooter, PostList,
│   │   │                     # PostReader, RepoSetup, SearchBar, LoadingSpinner
│   │   └── ui/               # shadcn/ui primitives (~48 files, mostly unused)
│   ├── styles/theme.css      # Radix color imports
│   ├── index.css, main.css   # Tailwind entry + theme tokens
│   └── prd.md
├── PRD.md                    # original product/design brief
├── USAGE_GUIDE.md            # end-user guide
├── IMPLEMENTATION_SUMMARY.md # notes from the local-files feature PR (partly out of date)
└── SECURITY.md
```

### Adding a content source

Implement `ContentProvider` in `src/lib/contentProviders.ts` and register it in `getContentProvider()`:

```ts
export interface ContentProvider {
  name: string
  description: string
  fetchPosts(config: RepoConfig): Promise<BlogPost[]>
}
```

## Security

This is a browser-only app, so every request and every secret lives in the user's browser. The items below are **current, unfixed** properties of the code.

### 1. Markdown is rendered without sanitization — XSS

`src/components/PostReader.tsx:84` passes raw `marked()` output into `dangerouslySetInnerHTML`. `marked` does **not** sanitize; its own `sanitize` option was removed in v5+. Any raw HTML in a markdown file — `<img src=x onerror=...>`, `<script>`, `javascript:` links — executes in the page origin.

This matters because the content source is **user-supplied at runtime**: anyone can point the app at any repository, and a hosted instance means an attacker only has to get a victim to load a link with a malicious repo configured.

**Fix before public deployment:** run the output through `DOMPurify` (`marked` → `DOMPurify.sanitize`), or configure a strict Content-Security-Policy, or both.

### 2. GitHub Personal Access Tokens are stored in plaintext `localStorage`

`src/hooks/useKV.ts` JSON-stringifies the whole config — token included — into `localStorage`. Combined with issue #1, a single malicious markdown file can read `localStorage` and exfiltrate the token.

**Guidance for users today:**
- Prefer **no token** (60 req/h) or a **fine-grained token with read-only "Contents" access to one public repo**.
- `USAGE_GUIDE.md` currently suggests a classic token with the `repo` scope for private repositories. **Do not do that on a shared or public deployment** — a `repo`-scoped classic PAT grants read/write to *every* repository the account can reach.
- Never enter a token into a hosted instance you do not control.

**Fix candidates:** session-only storage, a `sessionStorage` option, or moving auth behind a small proxy/serverless function so the token never reaches the browser.

### 3. No Content-Security-Policy

`index.html` ships no CSP meta tag and there are no hosting headers in the repo. Nothing constrains inline script execution, and Google Fonts is loaded from a third-party origin. A CSP would meaningfully blunt issue #1.

### 4. Local file access

The File System Access API is used read-only (`mode: 'read'`) and file contents never leave the browser — the privacy claim holds. The directory handle is **not** persisted, so access is not retained across sessions.

### 5. Outbound requests

The app talks to `api.github.com` (Octokit) and `fonts.googleapis.com` / `fonts.gstatic.com`. There is no telemetry and no other third-party endpoint.

### 6. `SECURITY.md` is upstream boilerplate

The current `SECURITY.md` is GitHub's template and directs reports to `opensource-security@github.com`, which is **not** the right contact for this project. Report vulnerabilities here via GitHub's private security advisory form on this repository instead.

## Known Issues & Limitations

Bugs and rough edges confirmed in the current code:

1. **Non-ASCII content is corrupted in GitHub mode.** `contentProviders.ts:129` decodes the API's base64 payload with `atob()`, which yields Latin-1 bytes, not UTF-8. Chinese/Japanese text, accented characters, and emoji come out as mojibake. Several files in this repo's own `contents/` folder contain emoji and are affected. Local mode is unaffected (it uses `File.text()`). *Fix: decode via `TextDecoder` over the raw bytes.*

2. **Local mode breaks on page reload.** The config is persisted but the directory handle is not, and `fetchPosts` runs from a `useEffect` on mount. `showDirectoryPicker()` requires transient user activation, so a reload throws instead of re-prompting cleanly. *Fix: persist the handle in IndexedDB with permission re-request, or gate the picker behind an explicit button.*

3. **One API request per file.** `GitHubContentProvider` issues a `getContent` call for every directory *and* every markdown file. A 50-post blog burns ~55 of the 60 unauthenticated requests per hour. *Fix: use the Git Trees API (`GET /repos/{o}/{r}/git/trees/{sha}?recursive=1`) plus per-blob fetches, or fetch raw files from `raw.githubusercontent.com`.*

4. **"View on GitHub" links are broken in local mode.** `PostReader` and `BlogFooter` build `github.com/{owner}/{repo}/...`, and local mode hardcodes `owner`/`repo` to `"local"`, producing dead links.

5. **A real type error is hidden by the build.** `npm run build` runs `tsc -b --noCheck`, which skips type checking entirely. Running `tsc --noEmit` surfaces `src/components/PostList.tsx:112` — `string | undefined` assigned to `SetStateAction<string | null>`. Also, `tsconfig.json` enables only `strictNullChecks`, not full `strict`.

6. **`npm run lint` cannot run** — the flat `eslint.config.js` that ESLint 9 requires is missing, even though ESLint and its plugins are installed.

7. **Dead template baggage.** `package.json` is still named `spark-template`, `version` is `0.0.0`, `@github/spark` is still a declared dependency although no source file imports it, `theme.json` is an empty `{}`, `.spark-initial-sha` is a leftover marker, and `BlogFooter` still renders "Powered by GitHub Spark". Roughly a dozen heavy unused dependencies (`three`, `d3`, `recharts`, …) inflate `npm install` and the dependency-vulnerability surface.

8. **Bundle size.** The production bundle is ~484 KB JS / ~347 KB CSS uncompressed (~137 KB / ~66 KB gzipped) with no code splitting.

9. **No CI.** `.github/` contains only `dependabot.yml` — no workflow runs build, lint, or type checks on PRs. `IMPLEMENTATION_SUMMARY.md` claims "CodeQL analysis: 0 vulnerabilities", but no CodeQL workflow exists in the repository.

10. **`IMPLEMENTATION_SUMMARY.md` is partly inaccurate** — it states `@github/spark` was removed (still in `package.json`) and that the build has "no TypeScript compilation issues" (true only because checking is disabled).

## Dependency Health

Snapshot from `npm audit` on the current lockfile:

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 10 |
| Moderate | 4 |
| Low | 2 |
| **Total** | **17** |

Nearly all of these are in the **build/dev toolchain** (`vite`, `rollup`, `postcss`, `tar`, `brace-expansion`, `minimatch`, `picomatch`, `js-yaml`, `lodash`, `serialize-javascript`, `flatted`, `ajv`, `@babel/core`, `eslint` plugins) rather than in code shipped to the browser. They are still worth clearing: `vite@6.3.5` is affected by several dev-server path-traversal / arbitrary-file-read advisories that matter to anyone running `npm run dev`, and `tar`'s critical advisory affects install-time extraction.

The only runtime dependency flagged is `uuid < 11.1.1` (moderate) — and `uuid` is not imported by any source file.

**There are 8 open Dependabot PRs** on this repository, including security bumps for `vite` (→ 6.3.6 and → 7.1.12) and `js-yaml` (→ 4.1.1). Triaging them is the cheapest available win:

```bash
npm audit                 # review
npm audit fix             # non-breaking fixes
npm audit fix --force     # ⚠️ pulls in majors (vite 7, plugin-react-swc 4) — verify the build after
```

## Before You Start Coding

A suggested order of work, highest value first:

**P0 — correctness and security**
1. Sanitize markdown output (DOMPurify) and add a CSP.
2. Fix UTF-8 decoding in `GitHubContentProvider` (`TextDecoder` instead of `atob`).
3. Stop persisting the PAT in `localStorage` by default; downgrade the `repo`-scope advice in `USAGE_GUIDE.md`.
4. Merge/verify the Dependabot security PRs (`vite`, `js-yaml`).

**P1 — make the toolchain trustworthy**
5. Add `eslint.config.js` so `npm run lint` runs.
6. Drop `--noCheck` from the build, fix the `PostList.tsx:112` type error, and turn on full `strict`.
7. Add a CI workflow running install → lint → typecheck → build on every PR.
8. Add a test runner (Vitest) and cover `extractTitle` / `extractExcerpt` / the providers.

**P2 — clean the template debris**
9. Rename the package, set a real version, remove `@github/spark` and the unused heavy deps, delete `theme.json` / `.spark-initial-sha`, drop the "Powered by GitHub Spark" footer.
10. Rewrite `SECURITY.md` for this project; reconcile or archive `IMPLEMENTATION_SUMMARY.md`.

**P3 — product features**
11. Client-side routing so posts have shareable URLs and Back works.
12. Batch the GitHub fetch via the Git Trees API to survive the rate limit.
13. Front matter support (`gray-matter`) for real dates, tags, drafts, and explicit titles.
14. Syntax highlighting, dark-mode toggle, pagination/lazy loading, persisted local-folder handle.

## Deployment

The build output in `dist/` is fully static and can go to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

```bash
npm run build     # → dist/
npm run preview   # verify locally
```

Two things to handle at deploy time:
- **CSP headers** — see [Security](#security). Add them at the host (`_headers`, `vercel.json`, etc.).
- **Base path** — GitHub Pages under a subpath needs `base` set in `vite.config.ts`.

Because everything runs client-side, deploying a public instance means strangers may enter their GitHub tokens into your page. Address the token-storage and sanitization issues first.

## Contributing

1. Search existing issues before opening a new one.
2. For changes, branch from `main`, keep the commit history readable, and open a PR describing the change.
3. Until CI exists, run `npm run build` and `npx tsc --noEmit` locally before pushing.

## License

MIT — see [LICENSE](LICENSE).
