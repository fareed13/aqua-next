// Single source of truth for "show the plain manual card-entry fields instead
// of a payment-SDK widget" — currently only the stripe-without-publishable-key
// case (Fat Zebra used to be a second manual-entry method; it's been removed
// from the reference app, so this condition collapsed to just stripe).
export function isStripeManualFallback(
  paymentMethod: string | null | undefined,
  stripeCredsResolved: boolean,
  stripeHasPublishableKey: boolean,
): boolean {
  return paymentMethod === 'stripe' && stripeCredsResolved && !stripeHasPublishableKey
}
