/**
 * Maps the API's color keys (from /website/?domain=) to semantic CSS variable names.
 * Pure data — no browser APIs. Safe to import in Server Components.
 *
 * API key                            → CSS variable
 * ───────────────────────────────────────────────────
 * app-main-accent-color              → --org-primary
 * app-main-accent-dark               → --org-primary-dark
 * app-darker-background              → --org-bg
 * main-accent-text-underline         → --org-underline
 * app-main-accent-with-transparent   → --org-primary-light
 */
export const ORG_COLOR_MAP: Record<string, string> = {
  'app-main-accent-color': '--org-primary',
  'app-main-accent-dark': '--org-primary-dark',
  'app-darker-background': '--org-bg',
  'main-accent-text-underline': '--org-underline',
  'app-main-accent-with-transparent': '--org-primary-light',
}
