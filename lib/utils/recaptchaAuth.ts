// Single source of truth for the public-endpoint auth rule (mirrors the Nuxt reference):
// recaptcha-enabled orgs send whatever token the solved widget left in sessionStorage;
// everyone else gets a blank Authorization header — no fallback token of any kind.
export function getRecaptchaAuthHeader(recaptchaEnabled: boolean | undefined): string {
  if (!recaptchaEnabled) return ''
  if (typeof sessionStorage === 'undefined') return ''
  return sessionStorage.getItem('recaptcha_token') ?? ''
}

// Widget solve callback: store the raw token immediately and unconditionally
// (mirrors Nuxt's handleSuccess writing to sessionStorage before it even calls
// the verify endpoint) — read back later by getRecaptchaAuthHeader.
export function storeRecaptchaToken(token: string) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem('recaptcha_token', token)
}

// Only call this once the backend /customer/verify/recaptcha/ call actually
// succeeds — it flips the shared uiStore authToken, which is the in-memory
// "ready" signal loadPaymentMethodFields gates and auto-retries on. Flipping
// it on mere widget-solve (before verification) would let payment fields load
// with a token the backend hasn't confirmed yet.
export function markRecaptchaVerified(token: string, setAuthToken: (token: string) => void) {
  setAuthToken(token)
}

export function clearRecaptchaToken(setAuthToken: (token: string) => void) {
  sessionStorage.removeItem('recaptcha_token')
  setAuthToken('')
}
