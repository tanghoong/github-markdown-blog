import { site } from '../config.mjs'

/**
 * The chrome around a post — "Related", "Newer", "5 min read".
 *
 * Deliberately a table and a lookup rather than an i18n library or a locale
 * routing scheme. There are a dozen strings and they only appear on the post
 * page; anything with a message catalogue, plural rules and a runtime would
 * cost more to carry than the problem is worth.
 *
 * Only the post page consults this. The feed, archive and tag pages are mixed
 * language by nature — the feed lists English and Chinese posts side by side —
 * so their chrome stays in `site.locale` and does not flicker between the two
 * as you scroll.
 */
export interface UiStrings {
  onThisPage: string
  tableOfContents: string
  related: string
  morePosts: string
  newer: string
  older: string
  lastUpdated: string
  replyOnGitHub: string
  copyLink: string
  viewSource: string
  minRead: (minutes: number) => string
}

const en: UiStrings = {
  onThisPage: 'On this page',
  tableOfContents: 'Table of contents',
  related: 'Related',
  morePosts: 'More posts',
  newer: 'Newer',
  older: 'Older',
  lastUpdated: 'Last updated',
  replyOnGitHub: 'Reply on GitHub',
  copyLink: 'Copy link',
  viewSource: 'View source on GitHub',
  minRead: (minutes) => `${minutes} min read`,
}

/**
 * Traditional Chinese, matching the default `site.cjkLocale`. A fork writing
 * Simplified converts this block along with the two places named in the
 * `cjkLocale` comment in src/config.mjs.
 */
const zh: UiStrings = {
  onThisPage: '本頁目錄',
  tableOfContents: '本頁目錄',
  related: '相關文章',
  morePosts: '更多文章',
  newer: '較新',
  older: '較舊',
  lastUpdated: '最後更新',
  replyOnGitHub: '在 GitHub 上回覆',
  copyLink: '複製連結',
  viewSource: '在 GitHub 上檢視原始檔',
  minRead: (minutes) => `閱讀 ${minutes} 分鐘`,
}

/**
 * Matched on the primary subtag, so `zh`, `zh-Hant` and `zh-Hant-MY` all
 * resolve — a post may carry any of them from frontmatter. Anything unknown
 * falls back to English rather than rendering a missing-key placeholder.
 */
export function ui(lang: string = site.locale): UiStrings {
  return lang.split('-')[0] === 'zh' ? zh : en
}
