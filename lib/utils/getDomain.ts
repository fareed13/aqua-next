/**
 * Returns the active organization domain for this deployment.
 *
 * Each org gets its own Netlify site with NEXT_PUBLIC_DEFAULT_PAGE_DOMAIN
 * set to that org's domain. The same codebase deploys for every org —
 * only the env var changes between deployments.
 *
 * Do NOT call headers() here — that would make the root layout dynamic (SSR)
 * and break ISR across the entire app.
 */
export function getDomain(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_PAGE_DOMAIN ?? ''
}
