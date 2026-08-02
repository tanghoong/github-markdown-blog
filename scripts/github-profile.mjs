/**
 * Generates src/data/github.json — the public profile figures shown beside the
 * bio on the feed page.
 *
 * Runs at build time, not in the browser. That is the whole point: the numbers
 * are compiled into the HTML, so GitHub sees two requests per deploy rather
 * than two per visitor. A site that called the API from the page would burn
 * through the unauthenticated 60-per-hour limit at a few dozen readers and
 * then start rendering blanks — and it would put a third-party request on the
 * critical path of a site whose entire premise is not having one.
 *
 * Unlike scripts/git-dates.mjs, the output is committed rather than ignored.
 * Git history is always present in a clone; the network is not. Committing the
 * last known figures means a rate-limited build, an offline build or a fork
 * with no token still renders the card, just with older numbers. On a failed
 * fetch this script leaves the existing file exactly as it is — it never
 * overwrites real data with an error state.
 *
 * Set GITHUB_TOKEN to raise the limit from 60/hr to 5000/hr. GitHub Actions
 * provides one automatically; on Cloudflare Pages add it as an environment
 * variable if deploys are frequent enough to bump the anonymous limit.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { site } from '../src/config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = resolve(root, 'src/data/github.json')

const owner = site.github.split('/')[0]

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': `${owner}-blog-build`,
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
}

async function getJson(url) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    // 403 with the limit exhausted is the common failure and deserves to be
    // named, so a maintainer reading build logs knows to add a token rather
    // than hunting for a bug.
    const remaining = response.headers.get('x-ratelimit-remaining')
    const detail = remaining === '0' ? ' (rate limit exhausted)' : ''
    throw new Error(`${response.status} ${response.statusText}${detail} for ${url}`)
  }
  return response.json()
}

/** Repo count per language, most-used first. Forks excluded — they are not work. */
function topLanguages(repos, limit = 5) {
  const counts = new Map()

  for (const repo of repos) {
    if (repo.fork || !repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function topRepos(repos, limit = 3) {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
    }))
}

try {
  const [user, repos] = await Promise.all([
    getJson(`https://api.github.com/users/${owner}`),
    // 100 is the page maximum. Someone with more public repos than that would
    // need pagination; the derived figures below would otherwise silently
    // describe only the most recently pushed 100.
    getJson(`https://api.github.com/users/${owner}/repos?per_page=100&sort=pushed`),
  ])

  if (repos.length === 100) {
    console.warn(
      '[github] hit the 100-repo page limit; stars and languages cover only the ' +
        'most recently pushed 100 repositories.'
    )
  }

  const owned = repos.filter((repo) => !repo.fork)

  const profile = {
    login: user.login,
    name: user.name,
    bio: user.bio,
    location: user.location,
    blog: user.blog || null,
    avatar: user.avatar_url,
    url: user.html_url,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    stars: owned.reduce((total, repo) => total + repo.stargazers_count, 0),
    joined: user.created_at,
    languages: topLanguages(repos),
    topRepos: topRepos(repos),
    fetchedAt: new Date().toISOString(),
  }

  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, JSON.stringify(profile, null, 2) + '\n')

  console.log(
    `[github] ${profile.login}: ${profile.publicRepos} repos, ` +
      `${profile.followers} followers, ${profile.stars} stars`
  )
} catch (error) {
  // Never fail the build over this. The card is decoration; the posts are not.
  let cached = null
  try {
    cached = JSON.parse(readFileSync(outFile, 'utf8'))
  } catch {
    // No cache and no network. The component imports this file unconditionally,
    // so it has to exist; an empty object is the "render nothing" signal.
    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, '{}\n')
  }

  console.warn(
    `[github] could not refresh profile (${error.message}). ` +
      (cached
        ? `Keeping the committed figures from ${cached.fetchedAt}.`
        : 'No cached figures; the profile card will be omitted.')
  )
}
