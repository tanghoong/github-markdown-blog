/**
 * Fails if any theme preset drops below WCAG AA.
 *
 * Parses src/styles/themes.css directly rather than keeping a duplicate table,
 * so a preset cannot be edited without this check seeing the new values.
 *
 * Checked against each preset's own background:
 *   --color-text            >= 4.5:1   (body copy)
 *   --color-text-secondary  >= 4.5:1   (meta text renders at 13-14px)
 *   --color-text on --color-bg-elevated >= 4.5:1  (code blocks, inputs)
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(resolve(root, 'src/styles/themes.css'), 'utf8')

const AA = 4.5

function luminance(hex) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** Pulls every `[data-preset='name']...{ ... }` block out of the stylesheet. */
function parseBlocks(source) {
  const blocks = []
  const re = /\[data-preset='([\w-]+)'\]([^{]*)\{([^}]*)\}/g

  for (const [, name, modifier, body] of source.matchAll(re)) {
    const tokens = {}
    for (const [, key, value] of body.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
      tokens[key] = value
    }
    blocks.push({
      name,
      mode: modifier.includes("data-theme='dark'") ? 'dark' : 'light',
      tokens,
    })
  }
  return blocks
}

const blocks = parseBlocks(css)

if (blocks.length === 0) {
  console.error('[contrast] no presets found in src/styles/themes.css')
  process.exit(1)
}

const failures = []
const rows = []

for (const { name, mode, tokens } of blocks) {
  const bg = tokens['--color-bg']
  const elevated = tokens['--color-bg-elevated']
  const text = tokens['--color-text']
  const secondary = tokens['--color-text-secondary']

  if (!bg || !text || !secondary || !elevated) {
    failures.push(`${name}/${mode}: missing one of bg, bg-elevated, text, text-secondary`)
    continue
  }

  const checks = [
    ['text on bg', contrast(text, bg)],
    ['secondary on bg', contrast(secondary, bg)],
    ['text on elevated', contrast(text, elevated)],
  ]

  for (const [label, ratio] of checks) {
    if (ratio < AA) {
      failures.push(`${name}/${mode}: ${label} is ${ratio.toFixed(2)}:1, below AA (${AA}:1)`)
    }
  }

  rows.push(
    `  ${name.padEnd(8)} ${mode.padEnd(6)}` +
      checks.map(([, r]) => `${r.toFixed(2).padStart(6)}:1`).join('  ')
  )
}

console.log('[contrast] preset  mode      text  secondary  elevated')
console.log(rows.join('\n'))

if (failures.length > 0) {
  console.error('\n[contrast] FAILED')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(`\n[contrast] ${blocks.length} theme blocks pass WCAG AA`)
