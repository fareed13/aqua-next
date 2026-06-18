import { ORG_COLOR_MAP } from '@/lib/config/orgColorMap'

/**
 * Generates an inline CSS string to bake org colors into the static HTML <style> tag.
 * Called in the Server Component layout — no browser APIs.
 * This eliminates FOUC: colors are in the HTML before any JS runs.
 */
export function buildOrgColorStyle(colors: Record<string, string>): string {
  return Object.entries(colors)
    .map(([key, value]) => `${ORG_COLOR_MAP[key] ?? `--org-${key}`}:${value}`)
    .join(';')
}

/**
 * Applies org colors to document.documentElement at runtime.
 * Used by OrgThemeProvider for client-side location switches.
 * Not called during SSG — only runs in the browser.
 */
export function applyOrgColors(colors: Record<string, string>): void {
  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(ORG_COLOR_MAP[key] ?? `--org-${key}`, value)
  })
}
