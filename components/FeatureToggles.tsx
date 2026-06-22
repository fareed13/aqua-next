'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, SlidersHorizontal, ShieldCheck, Save } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import type { QuillEditorHandle } from './QuillEditor'

const QuillEditor = typeof window !== 'undefined'
  ? require('./QuillEditor').QuillEditor
  : null

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: React.ReactNode
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="p-5 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-gray-300 hover:-translate-y-px hover:shadow-md transition-all relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b from-green-400 to-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => onChange(!checked)}
          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>
      {description && <p className="text-xs text-gray-500 mt-2 ml-[52px]">{description}</p>}
    </div>
  )
}

export function FeatureToggles() {
  const { isAdminLoggedIn, isSuperAdminLoggedIn } = useAuth()
  const organization = useOrgStore((s) => s.organization)
  const { secureEndpoint, getSecure, putSecure } = useSecureCalls()

  const [overlay, setOverlay] = useState(false)
  const [isGiftCardEnabled, setIsGiftCardEnabled] = useState(false)
  const [enableLogin, setEnableLogin] = useState(false)
  const [isVideoSoundEnabled, setIsVideoSoundEnabled] = useState(false)
  const [enableAppointment, setEnableAppointment] = useState(false)
  const [enableBanner, setEnableBanner] = useState(true)
  const [bannerText, setBannerText] = useState('')
  const [isLandingPageBannerEnabled, setIsLandingPageBannerEnabled] = useState(true)
  const [enableAquilaBooking, setEnableAquilaBooking] = useState(false)
  const [underMaintenance, setUnderMaintenance] = useState(false)
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false)
  const [isThanksRedirectEnabled, setIsThanksRedirectEnabled] = useState(false)
  const [thanksPageText, setThanksPageText] = useState('')
  const [isEmailShowEnabled, setIsEmailShowEnabled] = useState(false)
  const [autoDeleteEvents, setAutoDeleteEvents] = useState(false)
  const [chatbotEnabled, setChatbotEnabled] = useState(false)
  const [isFreeNotifierEnabled, setIsFreeNotifierEnabled] = useState(false)
  const [allowSpam, setAllowSpam] = useState(false)
  const [aggressiveIpSpam, setAggressiveIpSpam] = useState(false)
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false)
  const [consentCheckboxEnabled, setConsentCheckboxEnabled] = useState(true)
  const [consentDisclosureText, setConsentDisclosureText] = useState('')
  const [showCustomField, setShowCustomField] = useState(false)
  const [customerCustomField, setCustomerCustomField] = useState('')
  const [showReasonForJoining, setShowReasonForJoining] = useState(false)

  const isUk = (organization as any)?.is_uk ?? false
  const dragableData = ['#currentMonth#']
  const [draggedTag, setDraggedTag] = useState<string | null>(null)

  const bannerQuillRef = useRef<QuillEditorHandle>(null)
  const thankyouQuillRef = useRef<QuillEditorHandle>(null)
  const consentQuillRef = useRef<QuillEditorHandle>(null)

  useEffect(() => {
    const load = async () => {
      setOverlay(true)
      try {
        const res = await getSecure(secureEndpoint.ORGANIZATION) as any[]
        const org = res[0]
        setIsGiftCardEnabled(org.is_gift_card_enabled)
        setEnableLogin(org.enable_login)
        setEnableAppointment(org.is_booking_enabled)
        setEnableBanner(org.is_banner_enabled)
        setBannerText(org.banner_text ?? '')
        setIsLandingPageBannerEnabled(org.is_landing_page_banner_enabled ?? true)
        setEnableAquilaBooking(org.is_aquila_booking_enabled)
        setAutoDeleteEvents(org.auto_delete_events)
        setAllowSpam(org.allow_spam)
        setAggressiveIpSpam(org.aggressive_ip_spam)
        setChatbotEnabled(org.chatbot_enabled)
        setIsFreeNotifierEnabled(org.is_free_notifier_enabled)
        setRecaptchaEnabled(org.recaptcha_enabled)
        setUnderMaintenance(org.under_maintenance)
        setConsentCheckboxEnabled(org.consent_checkbox_enabled)
        setConsentDisclosureText(org.consent_disclosure_text ?? '')
        setIsAnalyticsEnabled(org.is_analytics_enabled)
        setIsThanksRedirectEnabled(org.is_thanks_redirect_enabled)
        setThanksPageText(org.thanks_page_text ?? '')
        setIsEmailShowEnabled(org.is_email_show_enabled)
        setShowCustomField(org.show_custom_field)
        setCustomerCustomField(org.customer_custom_field ?? '')
        setShowReasonForJoining(org.show_reason_for_joining)
        setIsVideoSoundEnabled(org.is_video_sound_enabled ?? false)
      } finally {
        setOverlay(false)
      }
    }
    load()
  }, [])

  const handleDrop = (quillRef: React.RefObject<QuillEditorHandle | null>, e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedTag || !quillRef.current) return
    const quill = quillRef.current.getQuill()
    if (!quill) return
    const pos = quill.selection?.savedRange?.index ?? quill.getLength()
    quill.insertText(pos, draggedTag)
    quill.setSelection(pos + draggedTag.length)
  }

  const save = async () => {
    setOverlay(true)
    try {
      const cleanConsent = consentDisclosureText?.replace(/<(.|\n)*?>/g, '').trim()
      await putSecure(secureEndpoint.ORGANIZATION, {
        id: organization?.id,
        is_gift_card_enabled: isGiftCardEnabled,
        enable_login: enableLogin,
        is_booking_enabled: enableAppointment,
        is_banner_enabled: enableBanner,
        banner_text: bannerText,
        is_aquila_booking_enabled: enableAquilaBooking,
        auto_delete_events: autoDeleteEvents,
        allow_spam: allowSpam,
        aggressive_ip_spam: aggressiveIpSpam,
        chatbot_enabled: chatbotEnabled,
        is_free_notifier_enabled: isFreeNotifierEnabled,
        recaptcha_enabled: recaptchaEnabled,
        under_maintenance: underMaintenance,
        is_thanks_redirect_enabled: isThanksRedirectEnabled,
        thanks_page_text: thanksPageText,
        is_analytics_enabled: isAnalyticsEnabled,
        is_email_show_enabled: isEmailShowEnabled,
        show_custom_field: showCustomField,
        customer_custom_field: customerCustomField,
        show_reason_for_joining: showReasonForJoining,
        is_landing_page_banner_enabled: isLandingPageBannerEnabled,
        is_video_sound_enabled: isVideoSoundEnabled,
        ...(!isUk && { consent_checkbox_enabled: consentCheckboxEnabled }),
        ...(!isUk && { consent_disclosure_text: cleanConsent || null }),
      })
    } finally {
      setOverlay(false)
    }
  }

  const TooltipToggle = ({ checked, onChange, label, tooltip, description }: {
    checked: boolean; onChange: (v: boolean) => void; label: string; tooltip: string; description?: string
  }) => (
    <Toggle
      checked={checked}
      onChange={onChange}
      description={description}
      label={
        <span className="flex items-center gap-1">
          {label}
          <span className="relative group/tip cursor-help">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </span>
          </span>
        </span>
      }
    />
  )

  return (
    <div className="relative">
      {overlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded">
          <div className="w-12 h-12 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Features */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 space-y-4 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#124E66] rounded-t-xl" />
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Settings className="text-[#124E66]" size={22} />
            <h4 className="text-lg font-semibold text-[#124E66]">Core Features</h4>
          </div>

          <Toggle checked={isGiftCardEnabled} onChange={setIsGiftCardEnabled} label="Gift Card Enable?" description="Enable gift card functionality for customers" />
          <Toggle checked={enableLogin} onChange={setEnableLogin} label="Login Button Enable?" description="Show login button in navigation" />
          <Toggle checked={isVideoSoundEnabled} onChange={setIsVideoSoundEnabled} label="Video Sound Control Enable?" description="Adds mute/unmute control on all videos. Ensure browser sound permissions are enabled for audio playback." />
          <Toggle checked={enableAppointment} onChange={setEnableAppointment} label="Appointment Booking Enable?" description="Allow customers to book appointments online" />
          <Toggle checked={enableBanner} onChange={setEnableBanner} label="Banner Enable?" description="Display promotional banners on your site" />

          {enableBanner && (
            <div className="space-y-3 pl-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Draggable Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {dragableData.map((tag) => (
                    <span
                      key={tag}
                      draggable
                      onDragStart={() => setDraggedTag(tag)}
                      className="px-3 py-1 bg-white border-2 border-blue-500 text-blue-600 text-sm font-semibold rounded cursor-grab hover:-translate-y-0.5 hover:shadow-md transition-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Banner Text:</p>
                {QuillEditor && (
                  <QuillEditor
                    ref={bannerQuillRef}
                    content={bannerText}
                    onUpdate:content={setBannerText}
                    onDrop={(e: any) => handleDrop(bannerQuillRef, e)}
                    onDragover={(e: any) => e.preventDefault()}
                  />
                )}
              </div>
            </div>
          )}

          <Toggle checked={isLandingPageBannerEnabled} onChange={setIsLandingPageBannerEnabled} label="Classes Page Banner Enable?" description="Show banner on individual classes pages (e.g. /classes/kickboxing)" />
          <Toggle checked={enableAquilaBooking} onChange={setEnableAquilaBooking} label="Aquila Booking Enable?" description="Enable Aquila booking system integration" />
          <Toggle checked={underMaintenance} onChange={setUnderMaintenance} label="Site Under Maintenance?" description="Display maintenance page to all visitors" />

          {isAdminLoggedIn() && (
            <Toggle checked={isAnalyticsEnabled} onChange={setIsAnalyticsEnabled} label="Enable Abbi Analytics?" />
          )}

          <Toggle checked={isThanksRedirectEnabled} onChange={setIsThanksRedirectEnabled} label="Enable Thanks Page Redirect?" description="If enabled, users will be redirected to the Thank You page after last step of form submission." />

          {isThanksRedirectEnabled && (
            <div className="pl-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Thankyou page text:</p>
              {QuillEditor && (
                <QuillEditor
                  ref={thankyouQuillRef}
                  content={thanksPageText}
                  onUpdate:content={setThanksPageText}
                  onDrop={(e: any) => handleDrop(thankyouQuillRef, e)}
                  onDragover={(e: any) => e.preventDefault()}
                />
              )}
            </div>
          )}

          {isSuperAdminLoggedIn() && (
            <Toggle checked={isEmailShowEnabled} onChange={setIsEmailShowEnabled} label="Show Email on Contact Page?" />
          )}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 space-y-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#124E66] rounded-t-xl" />
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <SlidersHorizontal className="text-[#124E66]" size={22} />
              <h4 className="text-lg font-semibold text-[#124E66]">Advanced Settings</h4>
            </div>
            <Toggle checked={autoDeleteEvents} onChange={setAutoDeleteEvents} label="Auto Delete Past Events?" description="Automatically remove expired events" />
            <Toggle checked={chatbotEnabled} onChange={setChatbotEnabled} label="Chatbot Enable?" description="Enable AI chatbot for customer support" />
            <Toggle checked={isFreeNotifierEnabled} onChange={setIsFreeNotifierEnabled} label="Enable Free Event/Plan Notifications?" description="You can turn this off anytime to stop receiving purchase notifications." />
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 space-y-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-400 rounded-t-xl" />
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <ShieldCheck className="text-orange-400" size={22} />
              <h4 className="text-lg font-semibold text-orange-500">Security &amp; Spam Protection</h4>
            </div>
            <TooltipToggle checked={allowSpam} onChange={setAllowSpam} label="Turn off spam check?" tooltip="If disabled, suspected email spam leads will be detected and listed under 'Potential Spam.'" description="Disable email spam detection" />
            <TooltipToggle checked={aggressiveIpSpam} onChange={setAggressiveIpSpam} label="Enable Aggressive spam validation?" tooltip="If enabled, Aggressive spam checks will apply, limiting each IP address to 2 requests per hour." description="Strict IP-based spam prevention" />
            <TooltipToggle checked={recaptchaEnabled} onChange={setRecaptchaEnabled} label="Enable reCAPTCHA?" tooltip="If enabled, reCAPTCHA verification will be required for form submissions." description="Enable Google reCAPTCHA verification" />

            {!isUk && (
              <>
                <TooltipToggle checked={consentCheckboxEnabled} onChange={setConsentCheckboxEnabled} label="Enable Consent Checkbox?" tooltip="If enabled, Consent Checkbox will be shown in the form." description="Enable Consent Checkbox" />
                {consentCheckboxEnabled && (
                  <div className="pl-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Stepper Consent text:</p>
                    {QuillEditor && (
                      <QuillEditor
                        ref={consentQuillRef}
                        content={consentDisclosureText}
                        onUpdate:content={setConsentDisclosureText}
                        onDrop={(e: any) => handleDrop(consentQuillRef, e)}
                        onDragover={(e: any) => e.preventDefault()}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <TooltipToggle checked={showCustomField} onChange={setShowCustomField} label="Show Custom Field on Stepper form?" tooltip="Adding this extra field may reduce the number of leads." description="Show Custom Field on Stepper form" />
            {showCustomField && (
              <input
                className="border rounded px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Custom Field Title"
                value={customerCustomField}
                onChange={(e) => setCustomerCustomField(e.target.value)}
              />
            )}

            <TooltipToggle checked={showReasonForJoining} onChange={setShowReasonForJoining} label="Show Reason for Joining Field on Stepper form?" tooltip="Adding this extra field may reduce the number of leads." description="Show Reason for Joining Field on Stepper form" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end mt-8">
        <button
          onClick={save}
          disabled={overlay}
          className="flex items-center gap-2 px-8 py-3 bg-[#124E66] text-white rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  )
}
