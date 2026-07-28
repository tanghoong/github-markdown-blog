/**
 * Generates src/data/git-dates.json — a map of content file path to its first
 * and last commit date, so posts get real dates without hand-written
 * frontmatter. Frontmatter `date` always wins; this is only the fallback.
 *
 * Degrades gracefully: on a shallow clone or a missing git binary it writes an
 * empty map and the site still builds (posts just render without a date).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = resolve(root, 'src/data/git-dates.json')

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

/** @type {Record<string, { created: string, updated: string }>} */
const dates = {}

try {
  const files = git(['ls-files', 'contents']).split('\n').filter(Boolean)

  for (const file of files) {
    // %aI = author date, strict ISO 8601. Newest commit first.
    const log = git(['log', '--follow', '--format=%aI', '--', file])
      .split('\n')
      .filter(Boolean)

    if (log.length === 0) continue
    dates[file] = { created: log[log.length - 1], updated: log[0] }
  }

  console.log(`[git-dates] resolved dates for ${Object.keys(dates).length} file(s)`)
} catch (error) {
  console.warn(
    `[git-dates] could not read git history (${error.message.split('\n')[0]}). ` +
      'Falling back to frontmatter dates only.'
  )
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(dates, null, 2) + '\n')
