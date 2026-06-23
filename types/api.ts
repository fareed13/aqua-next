export interface Media {
  name: string
  extension: string
  media_type?: string
  uuid?: string
  type?: string
}

export interface SocialMedia {
  platform: string
  url: string
}

export interface HoursOfOperation {
  day: string
  start: string
  end: string
}

export interface ServicePlan {
  service: number
  plan_id: number
  order: number
  plan: {
    id: number
    name: string
    price: string
    discounted_price: string | null
    amount_of_units: number
    unit_of_time: string
    is_trial: boolean
    is_upsell: boolean | null
    is_gift_card_only: boolean
    is_default: boolean
    free_items: string[]
  }
}

export interface ComponentContent {
  component: string
  headline?: string
  subtitle?: string
  content?: string
  media?: Media[]
  bullets?: string[] | string
  backgroundImage?: string
  url?: string
  plan?: number
  customBullets?: Array<{
    media?: Media
    content?: string
    headline?: string
  }>
  interactiveVideo?: Array<{
    media: Media
    service: number
  }>
  countOfReviews?: number
}

export interface Service {
  id: number
  name: string
  slug: string
  order: number
  type: string
  headline: string
  short_description: string
  service_intro: string | null
  urgency_headline: string | null
  seo_title: string | null
  seo_description: string | null
  min_age: number | null
  max_age: number | null
  parent_service: number | null
  topics: string[]
  large_media: Media | null
  small_media: Media | null
  content: ComponentContent[]
  service_plans: ServicePlan[]
  schedules: Array<{ id: number }>
}

export interface Review {
  id: number
  name: string | null
  content: string
  rating: number | null
  platform: string | null
  date_created: string | null
  created_at: string
  url: string | null
  topics: string[] | null
  services: number[]
  organization: number
  summary: string | null
  media: { extension: string; uuid: string } | null
  is_approved: boolean
  contact: number | null
}

export interface Schedule {
  id: number
  name: string
  day_of_week: string
  start_time: string
  end_time: string
  pretty_start_time: string
  pretty_end_time: string
  service: { id: number; name: string }
  location_id: number
  eligible_for_trial_class: boolean
  class_type: string
  link: string | null
  capacity: number
  media: Media | null
  virtual: boolean | null
  booking_active_from: string | null
  booking_active_to: string | null
  booking_close_dates: string[]
}

export interface Blog {
  id: number
  title: string
  slug: string
  content: string
  date: string
  order: number
  media: { uuid: string; extension: string; media_type: string } | null
  seo_headline: string | null
  seo_description: string | null
  blog_files: Array<{ file_path: string }>
}

export interface Staff {
  id: number
  name: string
  slug: string
  bio: string
  media: Media | null
  staff_services: Array<{ service_id: number }>
  staff_locations: number[]
}

export interface Page {
  id: number
  slug: string
  name: string
  display_name: string | null
  type: string | null
  content: ComponentContent[]
  title: string | null
  description: string | null
  location: number
  tracking_event_name: string | null
  show_header: boolean
  is_member_only: boolean
  is_external_page: boolean
}

export interface Fonts {
  p?: string
  h1?: string
  h2?: string
  h3?: string
  h4?: string
  h5?: string
  h6?: string
  body?: string
}

export interface Location {
  id: number
  slug: string
  city: string
  domain: string | null
  street: string
  zip_code: string
  phone: string
  pretty_phone: string
  secondary_phone: string | null
  pretty_secondary_phone: string | null
  email: string
  call_to_action: string | null
  latitude: string
  longitude: string
  google_place_id: string
  organization: number
  currency: string
  state_acronym: string
  abn: string | null
  seo_headline: string | null
  seo_description: string | null
  hours_of_operation: HoursOfOperation[]
  social_media: SocialMedia[]
  fonts: Fonts | null
  target_locations: string[]
  pages: Page[]
  blogs: Blog[]
  content: ComponentContent[]
  day_schedules: Record<string, Schedule[]>
  location_events: LocationEvent[]
  location_events_count: number
  locationmedias: Array<{ priority: number; location: number; media: Media }>
  locationmedias_count: number
  schedules_count: number
  active_payment_method: string | null
  enable_referrals: boolean | null
  welcome_message: string | null
  plan_override: string
  schedule_override: string | null
  instructor_text_override: string
  state: { id: number; name: string; parent_state: { id: number; name: string } | null }
  curriculums: Curriculum[]
  hyper_links: unknown[]
  staff: Staff[]
  reviews: Review[]
}

export interface LocationEvent {
  id: number
  name: string
  description: string
  content: unknown[]
  start_datetime: string
  end_datetime: string
  price: string
  member_price: string
  is_active: boolean
  capacity: number
  enrolled: number
  location: number
  created_at: string
  updated_at: string
}

export interface Curriculum {
  id: number
  name: string
  is_public: boolean
  service: { id: number; name: string }
  location: number
  lessons: unknown[]
}

export interface ChatbotConfig {
  id: number
  avatar: Media | null
  color: { bg: string }
  assistant_name: string
  greeting_variations: string[]
  organization: number
}

export interface Organization {
  id: number
  name: string
  primary_logo: Media | null
  timezone: string
  appointment_mode: boolean
  canonical_domain: string
  domain: string
  org_reviews_count: number
  services: Service[]
  org_reviews: Review[]
  locations: Location[]
  page: Page[]
  staffs: Staff[]
  shared: {
    footer: string
    header: string
    inner_page_media: { name: string; extension: string } | null
  }
  colors: Record<string, string>
  fonts: Fonts
  industry_type: string
  school_type: string
  website_status: string
  pwa_enabled: boolean
  gtag: string[]
  pixel: string[]
  gtm_container_id: string | null
  measurement: { adwords_id: string; adwords_lead_id: string; adwords_trial_id: string }
  is_gift_card_enabled: boolean
  is_setup_completed: boolean
  is_analytics_enabled: boolean
  country?: string
  is_booking_enabled: boolean
  is_aquila_booking_enabled: boolean
  is_banner_enabled: boolean
  banner_text: string
  is_email_show_enabled: boolean
  stepper_text: string
  refund_policy: string
  thanks_text: string
  event_thanks_text: string
  thanks_page_text: string
  is_thanks_redirect_enabled: boolean
  shows_all_locations_menu: boolean
  chatbot_config: ChatbotConfig[]
  chatbot_enabled: boolean
  under_maintenance: boolean
  recaptcha_enabled: boolean
  consent_disclosure_text: string
  consent_checkbox_enabled: boolean
  show_custom_field: boolean
  show_reason_for_joining: boolean
  customer_custom_field: string | null
  is_free_notifier_enabled: boolean
  is_landing_page_banner_enabled: boolean
  is_video_sound_enabled: boolean
  auto_delete_events: boolean
  gmb_ai_post: boolean
  review_h1_headline: string | null
  instructor_h1_headline: string | null
  contact_h1_headline: string | null
  additional_headers: Array<{ link: string; text: string; is_member_only: boolean }>
  scripts: Array<{
    id: number
    script_src: string
    script_id: string | null
    script_uuid: string | null
    script_async: boolean
    script_base_url: string
    extra_params: Record<string, unknown>
    organization: number
  }>
  class_reservation: boolean
  require_login_for_virtual_classes: boolean
  enable_login: boolean
  is_scraped: boolean
  currency_sign: string | null
}

export type ServerInitResponse = [Organization]
