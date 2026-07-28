import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Reads a theme preset's tokens out of src/styles/themes.css at build time.
 *
 * Parsing the stylesheet keeps it the single source of truth: the OG card, the
 * contrast checker and the browser all read the same values, so a preset can
 * never drift from the cards it generates.
 *
 * Build-time only — this touches the filesystem and must not be imported into
 * anything that ships to the browser.
 */
export type Mode = 'light' | 'dark'

export interface Palette {
  bg: string
  bgElevated: string
  text: string
  textSecondary: string
  border: string
}

const FALLBACK: Palette = {
  bg: '#17191c',
  bgElevated: '#1f2226',
  text: '#d8d6d1',
  textSecondary: '#8b8a85',
  border: '#2c2f34',
}

let cache: string | null = null

function stylesheet(): string {
  cache ??= readFileSync(resolve(process.cwd(), 'src/styles/themes.css'), 'utf8')
  return cache
}

export function getPalette(preset: string, mode: Mode): Palette {
  const escaped = preset.replace(/[^\w-]/g, '')
  const selector =
    mode === 'dark'
      ? `\\[data-preset='${escaped}'\\]\\[data-theme='dark'\\]`
      : `\\[data-preset='${escaped}'\\](?!\\[)`

  const match = stylesheet().match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))
  if (!match) return FALLBACK

  const tokens: Record<string, string> = {}
  for (const [, key, value] of match[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[key] = value
  }

  return {
    bg: tokens['--color-bg'] ?? FALLBACK.bg,
    bgElevated: tokens['--color-bg-elevated'] ?? FALLBACK.bgElevated,
    text: tokens['--color-text'] ?? FALLBACK.text,
    textSecondary: tokens['--color-text-secondary'] ?? FALLBACK.textSecondary,
    border: tokens['--color-border'] ?? FALLBACK.border,
  }
}
