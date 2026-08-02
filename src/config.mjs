/**
 * Everything a fork needs to change lives in this file.
 *
 * After forking: set `url`, `title`, `handle`, `bio` and `github`, pick a
 * `theme`, and you have your own blog. Nothing else in the codebase hard-codes
 * your identity.
 */
export const site = {
  /**
   * Canonical origin, no trailing slash. Drives canonical tags, Open Graph
   * URLs, RSS/JSON feeds and the sitemap — set this before search engines
   * index the site or they will index the wrong host.
   */
  url: 'https://github-markdown-blog.pages.dev',

  title: 'Alaias Charlie',
  handle: '@alaias',
  bio: 'Continuous learning, solo leveling.',

  /**
   * Path to an avatar image in public/, e.g. '/avatar.jpg'. When null, the
   * first letter of `title` is drawn in a circle instead.
   */
  avatar: null,

  /** owner/repo — powers "view source", "reply", and the footer link. */
  github: 'tanghoong/github-markdown-blog',

  /** BCP-47 tag used for date formatting and <html lang>. */
  locale: 'en',
}

/**
 * Theme preset. One of the names defined in src/styles/themes.css:
 * 'cream' | 'mono' | 'slate' | 'sepia' | 'forest'
 *
 * Light and dark are both defined per preset; the toggle switches between
 * them. Add your own by copying a block in that file — `npm run check:contrast`
 * will verify it stays readable.
 */
export const theme = 'cream'

/** Layout knobs. */
export const layout = {
  /** Width of the feed column. Threads sits around 640px. */
  feedWidth: '40rem',
  /** Posts per page in the feed. */
  postsPerPage: 10,
}

/**
 * Optional features. Everything here is off-by-default-safe: a fork that
 * changes nothing still builds and deploys.
 */
export const features = {
  /**
   * Comments via GitHub Discussions (giscus.app).
   *
   * To enable: turn on Discussions in your repo settings, visit
   * https://giscus.app, enter your repo, and paste the two IDs it gives you.
   * Leaving `enabled: false` ships no third-party code and no extra CSP origins.
   */
  giscus: {
    enabled: false,
    repo: '', // e.g. 'tanghoong/github-markdown-blog'
    repoId: '', // from giscus.app
    category: 'Announcements',
    categoryId: '', // from giscus.app
    mapping: 'pathname',
    reactionsEnabled: true,
  },

  /**
   * Contact form, relayed through a MailRelay worker.
   *
   * This site is statically generated, so there is no server here to hide
   * a credential in — the browser talks to the worker directly. That is
   * safe only because the worker checks the request Origin against a
   * per-site whitelist and requires a Turnstile token; the endpoint id
   * below is public by design and is not a secret.
   *
   * Enabling this widens the Content-Security-Policy to allow the worker
   * origin and Turnstile — see scripts/security-headers.mjs. Leaving it
   * off ships no extra CSP origins and no contact page at all.
   *
   * After changing anything here, run `npm run build` and then, from the
   * clone-resend checkout:
   *
   *   npm run verify:pair -- --blog <path-to-this-repo> --admin-token <token>
   *
   * The worker lives in a separate repository, so this repo's own checks
   * cannot tell whether the two still agree — a wrong endpoint id, an
   * unwhitelisted origin or a stale build all fail silently, because the
   * worker answers those rejections with a fake success.
   */
  mailrelay: {
    enabled: false,
    /** Deployed worker origin, no trailing slash. */
    workerOrigin: '', // e.g. 'https://mailrelay-v2.<subdomain>.workers.dev'
    /** Endpoint id from POST /v1/admin/endpoints. Public, not a secret. */
    endpointId: '', // e.g. 'ep_...'
    /**
     * Turnstile *site* key (the public half). Required, not optional —
     * worker endpoints demand a Turnstile token by default and refuse
     * submissions without one as a fake success, so a form rendered
     * without the widget would silently discard every message.
     */
    turnstileSiteKey: '',
  },

  /**
   * Generate a social share card per post at build time (/og/<slug>.png).
   * Costs a couple of seconds of build; nothing at runtime.
   */
  ogImages: true,

  /**
   * Prefetch links on hover and animate between pages. Costs a few KB of JS —
   * the only JavaScript this site ships beyond the theme toggle and search.
   * Set false to return to a strict zero-framework-JS build.
   */
  prefetch: true,
  viewTransitions: true,

  /** Show a table of contents on posts with at least this many headings. */
  tocMinHeadings: 3,
}
