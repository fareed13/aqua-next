/**
 * Shared form-field styles for the customer detail tabs.
 *
 * Mirrors Nuxt's Vuetify look: `variant="outlined"` + `density="comfortable"`
 * text fields on a `#f5f5f8` background (~48px tall, roomy padding, base font).
 * Keeps every tab visually consistent instead of each re-deriving Tailwind classes,
 * which is what produced the "compressed fields / small font" drift vs Nuxt.
 */
export const FIELD =
  'rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base ' +
  'focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66] ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

/** Full-width comfortable field (most tab forms stack fields vertically). */
export const FIELD_FULL = `w-full ${FIELD}`

/** Field label — matches CustomerDetails. */
export const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
