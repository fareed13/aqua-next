'use client'

// Central analytics event dispatch — mirrors the Nuxt fan-out. Each public event fires to
// up to three channels, each guarded so a missing/blocked script never breaks the caller:
//   - ABBI first-party   → window.leadAndPurchaseEvent(name, payload)   (installed by abbiEvents-nuxt3.js)
//   - Facebook Pixel     → window.fbq('track', name, params)
//   - Google Analytics 4 → window.gtag('event', name, params)
// Plus Google Ads conversion pings (reportConversion / reportPurchase), matching the Nuxt
// gtag plugin's $gtag_report_conversion / $gtag_report_purchase.

import { useOrgStore } from '@/store/orgStore'

type Params = Record<string, unknown>

// GA4. Falls back to dataLayer if gtag.js hasn't finished loading yet (matches Nuxt's $gtag wrapper).
export function gtagEvent(name: string, params: Params = {}) {
  try {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] }
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, params)
      console.log(`📊 [GA4 Success] window.gtag() triggered for event: "${name}"`, params);
    } else {
      console.log(`⏳ [GA4 Fallback] window.gtag not ready. Queueing "${name}" into dataLayer.`, params);
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push(['event', name, params])
    }
  } catch (e) {
    console.error(`❌ [GA4 Error] "${name}" failed entirely:`, e)
    console.error(`Gtag ${name} invalid:`, e)
  }
}

// Facebook Pixel
export function fbTrack(name: string, params?: Params) {
  try {
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
    if (typeof fbq === 'function') {
      params ? fbq('track', name, params) : fbq('track', name)
    }
  } catch (e) {
    console.error('Facebook Pixel invalid:', e)
  }
}

// ABBI first-party event (global installed by the external abbiEvents-nuxt3.js script)
export function abbiEvent(name: string, payload: Params = {}) {
  try {
    const fn = (window as unknown as { leadAndPurchaseEvent?: (n: string, p: Params) => void }).leadAndPurchaseEvent
    if (typeof fn === 'function') fn(name, payload)
  } catch (e) {
    console.error(`Analytics ${name} event failed:`, e)
  }
}

// Google Ads: generic lead conversion — mirrors gtag_report_conversion.
export function reportConversion(url?: string) {
  try {
    const m = useOrgStore.getState().organization?.measurement
    if (!m?.adwords_id || !m?.adwords_lead_id) return
    fireGoogleAdsConversion(`${m.adwords_id}/${m.adwords_lead_id}`, {}, url)
  } catch (e) {
    console.error('Gtag report_conversion invalid:', e)
  }
}

// Google Ads: trial/purchase conversion — mirrors gtag_report_purchase.
export function reportPurchase(price?: number, url?: string) {
  try {
    const m = useOrgStore.getState().organization?.measurement
    if (!m?.adwords_id || !m?.adwords_trial_id) return
    const value = price == null ? 0.01 : price
    fireGoogleAdsConversion(`${m.adwords_id}/${m.adwords_trial_id}`, { value, currency: 'USD', transaction_id: '' }, url)
  } catch (e) {
    console.error('Gtag report_purchase invalid:', e)
  }
}

function fireGoogleAdsConversion(send_to: string, extra: Params, url?: string) {
  const event_callback = () => {
    if (url) window.location.href = url
  }
  gtagEvent('conversion', { send_to, ...extra, event_callback })
}

// ── Per-event helpers (public site). Each fans out exactly like the Nuxt reference. ──

// call_click — useFooter.js / sections.js / ContactDefault.vue
export function fireCallClick() {
  abbiEvent('call_click', {})
  fbTrack('call_click')
  gtagEvent('call_click', {})
}

// chat_lead_captured — chatbot "Yes" confirmation (Nuxt ChatContainer.vue submitChatbotLead).
// Note the per-channel name differences, kept identical to Nuxt.
export function fireChatLeadCaptured(email: string) {
  abbiEvent('LEAD', { email })            // Nuxt: leadAndPurchaseEvent('LEAD', { email })
  fbTrack('Lead')                          // Nuxt: fbq('track', 'Lead')  — no params
  gtagEvent('chat_lead_captured', {})      // Nuxt: $gtag('event', 'chat_lead_captured', {})
  reportConversion()                       // Nuxt: $gtag_report_conversion()
}

// lead_submit — stepper Step 1 completion (Nuxt Checkout.vue) and the InteractiveVideo
// lead form (Nuxt InteractiveVideo.vue) — identical fan-out in both.
export function fireLeadSubmit(email: string) {
  abbiEvent('LEAD', { email })            // Nuxt: leadAndPurchaseEvent('LEAD', { email })
  fbTrack('Lead')                          // Nuxt: fbq('track', 'Lead')  — no params
  gtagEvent('lead_submit', {})             // Nuxt: $gtag('event', 'lead_submit', {})
  reportConversion()                       // Nuxt: $gtag_report_conversion()
}

// purchase — Step 2 payment confirm on the CUSTOMER_PURCHASE path (Nuxt useCheckoutDetails.js).
// fbq deliberately tracks 'Lead' (not 'Purchase'), matching Nuxt exactly.
export function firePurchase({ price, email, service }: { price: number; email: string; service: unknown }) {
  gtagEvent('purchase', { currency: 'USD', value: price })   // Nuxt: $gtag('event','purchase',{currency,value})
  reportPurchase(price)                                       // Nuxt: $gtag_report_purchase(pricePayed)
  abbiEvent('PURCHASE', { price, email, service })            // Nuxt: leadAndPurchaseEvent('PURCHASE', {...})
  fbTrack('Lead', { value: price, currency: 'USD' })          // Nuxt: fbq('track','Lead',{value,currency})
}

// enrollment — extra GA4-only event fired ONLY when active_payment_method === 'aquila'
// (in addition to purchase). Nuxt useCheckoutDetails.js.
export function fireEnrollment({ price, email, service }: { price: number; email: string; service: unknown }) {
  gtagEvent('enrollment', { currency: 'USD', value: price, service, email })
}

// trial_booked — appointment booking Step 3 completion (Nuxt AppointmentBooking.vue).
// Three channels only — Nuxt fires no Google Ads conversion here.
export function fireTrialBooked(customerId: number) {
  abbiEvent('trial_booked', { customer_id: customerId })   // Nuxt: leadAndPurchaseEvent('trial_booked', {customer_id})
  fbTrack('trial_booked')                                   // Nuxt: fbq('track', 'trial_booked')  — no params
  gtagEvent('trial_booked', {})                             // Nuxt: $gtag('event', 'trial_booked', {})
}
