import type { Fonts } from '@/types/api'

/**
 * Builds a Google Fonts URL for the org's font config.
 * Deduplicates fonts — multiple heading levels often use the same family.
 * Returns empty string if no fonts are configured.
 */
export function buildGoogleFontsUrl(fonts: Partial<Fonts>): string {
  const families = [...new Set(Object.values(fonts).filter(Boolean) as string[])]
  if (!families.length) return ''

  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
    .join('&')

  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

/**
 * Applies org fonts as CSS variables so components can reference
 * --org-font-body and --org-font-heading without hardcoding a family.
 */
export function applyOrgFonts(fonts: Partial<Fonts>): void {
  const root = document.documentElement

  if (fonts.p) root.style.setProperty('--org-font-body', `"${fonts.p}", sans-serif`)
  if (fonts.h1) root.style.setProperty('--org-font-heading', `"${fonts.h1}", sans-serif`)
}
