/**
 * Component registry — maps DB-stored component name strings to React components.
 * KEY NAMES MUST MATCH the Nuxt useComponents.js keys exactly.
 * The Django DB stores component names as plain strings (e.g. "CarouselAbbi").
 * Adding a component here with the wrong key means it will never render.
 *
 * Migrate components one by one. Until a component is migrated,
 * SectionRenderer falls back to null (renders nothing, no crash).
 */

import type { ComponentType } from 'react'
import type { ComponentContent } from '@/types/api'

export type SectionProps = ComponentContent

// Placeholder until a component is migrated
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TODO = (_props: SectionProps) => null

// ── Carousels / Banners ───────────────────────────────────────────────
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { BigImageBackground } from '@/components/carousel/BigImageBackground'
import { CarouselDefault } from '@/components/carousel/CarouselDefault'
import { CarouselAbbi } from '@/components/carousel/CarouselAbbi'
import { CarouselSix } from '@/components/carousel/CarouselSix'
import { FitnessCarousel } from '@/components/carousel/FitnessCarousel'
import { GymBanner } from '@/components/carousel/GymBanner'
import { CarouselVideo } from '@/components/carousel/CarouselVideo'
import { VideoClean } from '@/components/carousel/VideoClean'
import { JHWavyBottomRightImage } from '@/components/carousel/JHWavyBottomRightImage'
import { SalonCarousel } from '@/components/carousel/SalonCarousel'
import { AccountCarousel } from '@/components/carousel/AccountCarousel'
import { DentalBannerCarousel } from '@/components/carousel/DentalBannerCarousel'
import { Carousel360 } from '@/components/carousel/Carousel360'
import { VideoIntro } from '@/components/carousel/VideoIntro'

// ── Offers ───────────────────────────────────────────────────────────
import { OfferDefault } from '@/components/offers/OfferDefault'
import { OfferGeneral } from '@/components/offers/OfferGeneral'
import { NewMemberOffer } from '@/components/offers/NewMemberOffer'
import { OfferJoinUs } from '@/components/offers/OfferJoinUs'

// ── Sections / Content blocks ─────────────────────────────────────────
import { AbbiLeftImage } from '@/components/sections/AbbiLeftImage'
import { AbbiRightImage } from '@/components/sections/AbbiRightImage'
import { AboutMe } from '@/components/sections/AboutMe'
import { AccountCallUs } from '@/components/sections/AccountCallUs'
import { AccountCtaQuoteBanner } from '@/components/sections/AccountCtaQuoteBanner'
import { AccountOurFeatures } from '@/components/sections/AccountOurFeatures'
import { AccountWhatWeOffer } from '@/components/sections/AccountWhatWeOffer'
import { AwardsDefault } from '@/components/sections/AwardsDefault'
import { BlockedRightImage } from '@/components/sections/BlockedRightImage'
import { BookNow } from '@/components/sections/BookNow'
import { BuyNow } from '@/components/sections/BuyNow'
import { Calender } from '@/components/sections/Calender'
import { ChangeProgram } from '@/components/sections/ChangeProgram'
import { CounterCard } from '@/components/sections/CounterCard'
import { CTAChecks } from '@/components/sections/CTAChecks'
import { CTARightVideo } from '@/components/sections/CTARightVideo'
import { DentalAboutUs } from '@/components/sections/DentalAboutUs'
import { DentalRequestAppointment } from '@/components/sections/DentalRequestAppointment'
import { DentalWeHelp } from '@/components/sections/DentalWeHelp'
import { DiscountSection } from '@/components/sections/DiscountSection'
import { Ebook } from '@/components/sections/Ebook'
import { FreeDiscount } from '@/components/sections/FreeDiscount'
import { FitnessGoals } from '@/components/sections/FitnessGoals'
import { FadedLeftImage } from '@/components/sections/FadedLeftImage'
import { FadedNoImage } from '@/components/sections/FadedNoImage'
import { FadedRightImage } from '@/components/sections/FadedRightImage'
import { FullWidthHeading } from '@/components/sections/FullWidthHeading'
import { GetStarted } from '@/components/sections/GetStarted'
import { GeneralLeftImage } from '@/components/sections/GeneralLeftImage'
import { GeneralRightImage } from '@/components/sections/GeneralRightImage'
import { GymInfoCard } from '@/components/sections/GymInfoCard'
import { GymInstructors } from '@/components/sections/GymInstructors'
import { GymCtaBanner } from '@/components/sections/GymCtaBanner'
import { GymSuccessStories } from '@/components/sections/GymSuccessStories'
import { HomeContact } from '@/components/sections/HomeContact'
import { HomeSlider } from '@/components/sections/HomeSlider'
import { ImproveWorkout } from '@/components/sections/ImproveWorkout'
import { JoinclassesCard } from '@/components/sections/JoinclassesCard'
import { LeftToRightArrow } from '@/components/sections/LeftToRightArrow'
import { JHAboutUs } from '@/components/sections/JHAboutUs'
import { JHCtaBanner } from '@/components/sections/JHCtaBanner'
import { JHHowItWorks } from '@/components/sections/JHHowItWorks'
import { JHOurRecent } from '@/components/sections/JHOurRecent'
import { JHRemovalServices } from '@/components/sections/JHRemovalServices'
import { JHTestimonialsNew } from '@/components/sections/JHTestimonialsNew'
import { JHRecoveredCaption } from '@/components/sections/JHRecoveredCaption'
import { LetsGetStarted } from '@/components/sections/LetsGetStarted'
import { Morefacilities } from '@/components/sections/Morefacilities'
import { NoFadeRightImage } from '@/components/sections/NoFadeRightImage'
import { OurUnique } from '@/components/sections/OurUnique'
import { OurStory } from '@/components/sections/OurStory'
import { OurClientServices } from '@/components/sections/OurClientServices'
import { ProgramChildrenDefault } from '@/components/sections/ProgramChildrenDefault'
import { ProvideServices } from '@/components/sections/ProvideServices'
import { QuicklyCreateBeautiful } from '@/components/sections/QuicklyCreateBeautiful'
import { QuoteWithParallax } from '@/components/sections/QuoteWithParallax'
import { ReferralHero } from '@/components/sections/ReferralHero'
import { RightToLeftArrow } from '@/components/sections/RightToLeftArrow'
import { RowOfImages } from '@/components/sections/RowOfImages'
import { SalonInfoCard } from '@/components/sections/SalonInfoCard'
import { SalonCareCenter } from '@/components/sections/SalonCareCenter'
import { SalonAppointment } from '@/components/sections/SalonAppointment'
import { SalonTestimonials } from '@/components/sections/SalonTestimonials'
import { SalonClients } from '@/components/sections/SalonClients'
import { SalonGreySection } from '@/components/sections/SalonGreySection'
import { ServicePlans } from '@/components/sections/ServicePlans'
import { StepsBoxed } from '@/components/sections/StepsBoxed'
import { StepsIcons } from '@/components/sections/StepsIcons'
import { StudentVideo } from '@/components/sections/StudentVideo'
import { SuccessStories } from '@/components/sections/SuccessStories'
import { Testimonials } from '@/components/sections/Testimonials'
import { ThreeLargeBulletsRight } from '@/components/sections/ThreeLargeBulletsRight'
import { VirtualClass } from '@/components/sections/VirtualClass'
import { VirtualTour } from '@/components/sections/VirtualTour'
import { WhatWeOffer } from '@/components/sections/WhatWeOffer'
import { WhatWeOfferRightImage } from '@/components/sections/WhatWeOfferRightImage'
import { WhyChoiceUs } from '@/components/sections/WhyChoiceUs'

// ── Reviews ───────────────────────────────────────────────────────────
import { ReviewsClean } from '@/components/reviews/ReviewsClean'
import { ReviewsDefault } from '@/components/reviews/ReviewsDefault'
import { ReviewsSplash } from '@/components/reviews/ReviewsSplash'
import { AccountTestimonials } from '@/components/reviews/AccountTestimonials'
import { DentalOurReview } from '@/components/reviews/DentalOurReview'
import { MovingTheirCompanies } from '@/components/reviews/MovingTheirCompanies'
import { SingleReview } from '@/components/reviews/SingleReview'
import { StudentReview } from '@/components/reviews/StudentReview'

// ── Programs / Services ───────────────────────────────────────────────
import { ProgramDefault } from '@/components/programBlocks/ProgramDefault'
import { TrainingProgram } from '@/components/programBlocks/TrainingProgram'
import { SalonServices } from '@/components/programBlocks/SalonServices'
import { ProgramBlocks360 } from '@/components/programBlocks/ProgramBlocks360'
import { ProgramBlocksAbbi } from '@/components/programBlocks/ProgramBlocksAbbi'

// ── Instructors / Team ────────────────────────────────────────────────
import { AccountOurTeam } from '@/components/instructor/AccountOurTeam'
import { OurTeam } from '@/components/instructor/OurTeam'
import { InstructorDefault } from '@/components/instructor/InstructorDefault'
import { TeamCoaches } from '@/components/instructor/TeamCoaches'
import { SalonTeam } from '@/components/instructor/SalonTeam'
import { LocationInstructors } from '@/components/instructor/LocationInstructors'

// ── Gallery ───────────────────────────────────────────────────────────
import { GalleryDefault } from '@/components/gallery/GalleryDefault'
import { SalonInstaGallery } from '@/components/gallery/SalonInstaGallery'
import { SalonGallery } from '@/components/gallery/SalonGallery'

// ── Policies ──────────────────────────────────────────────────────────
import { PrivacyPolicy } from '@/components/policies/privacy'
import { TermsOfService } from '@/components/policies/Terms'
import { RefundPolicy } from '@/components/policies/Refund'

// ── Schedule ──────────────────────────────────────────────────────────
import { ScheduleDefault } from '@/components/schedule/ScheduleDefault'
import { Schedule360 } from '@/components/schedule/Schedule360'
import { VirtualScheduleDefault } from '@/components/schedule/VirtualScheduleDefault'

// ── Events ────────────────────────────────────────────────────────────
import { EventDefault } from '@/components/events/EventDefault'

// ── FAQs ──────────────────────────────────────────────────────────────
import { FaqBushiban } from '@/components/faqs/FaqBushiban'
import { FaqTwo } from '@/components/faqs/FaqTwo'
import { FaqDefault } from '@/components/faqs/FaqDefault'

// ── Contact ───────────────────────────────────────────────────────────
import { ContactDefault } from '@/components/contact/ContactDefault'

// ── Receipt ───────────────────────────────────────────────────────────
import { ReceiptDefault } from '@/components/receipt/ReceiptDefault'

// ── Media ─────────────────────────────────────────────────────────────
import { VideoPlayer } from '@/components/media/VideoPlayer'

// ── Other ─────────────────────────────────────────────────────────────
import { EmbedIframe } from '@/components/EmbedIframe'
import { InteractiveVideo } from '@/components/InteractiveVideo'
import { InstagramFeed } from '@/components/instagram/InstagramFeed'
import { VirtualSchedule } from '@/components/VirtualSchedule'
import { LocationsDefault } from '@/components/locations/LocationsDefault'
import { PopupFormReview } from '@/components/popupForm/PopupFormReview'

export const SECTION_REGISTRY: Record<string, ComponentType<SectionProps>> = {
  // ── Carousels / Banners ───────────────────────────────────────────────
  LandingPageBanner,
  BigImageBackground,
  Carousel: CarouselDefault,
  CarouselAbbi,
  CarouselSix,
  FitnessCarousel,
  GymBanner,
  Video: CarouselVideo,
  VideoClean,
  JHWavyBottomRightImage,
  SalonCarousel,
  AccountCarousel,
  DentalBannerCarousel,
  Carousel360,
  VideoIntro,

  // ── Offers ───────────────────────────────────────────────────────────
  NewMemberOffer,
  OfferDefault,
  OfferGeneral,
  OfferJoinUs,

  // ── Sections / Content blocks ─────────────────────────────────────────
  AbbiLeftImage,
  AbbiRightImage,
  AboutMe,
  AccountCallUs,
  AccountCtaQuoteBanner,
  AccountOurFeatures,
  AccountWhatWeOffer,
  AwardsDefault,
  BlockedRightImage,
  BookNow,
  BuyNow,
  Calender,
  CTAChecks,
  CTARightVideo,
  ChangeProgram,
  CounterCard,
  DentalAboutUs,
  DentalRequestAppointment,
  DentalWeHelp,
  DiscountSection,
  Ebook,
  FadedLeftImage,
  FadedNoImage,
  FadedRightImage,
  FitnessGoals,
  FreeDiscount,
  FullWidthHeading,
  GeneralLeftImage,
  GeneralRightImage,
  GetStarted,
  GymCtaBanner,
  GymInfoCard,
  GymInstructors,
  GymSuccessStories,
  HomeContact,
  HomeSlider,
  ImproveWorkout,
  JHAboutUs,
  JHCtaBanner,
  JHHowItWorks,
  JHOurRecent,
  JHRecoveredCaption,
  JHRemovalServices,
  JHTestimonialsNew,
  JoinclassesCard,
  LeftToRightArrow,
  LetsGetStarted,
  Morefacilities,
  NoFadeRightImage,
  OurClientServices,
  OurStory,
  OurUnique,
  ProgramChildrenDefault,
  ProvideServices,
  QuicklyCreateBeautiful,
  QuoteWithParallax,
  ReferralHero,
  RightToLeftArrow,
  RowOfImages,
  SalonAppointment,
  SalonCareCenter,
  SalonClients,
  SalonGreySection,
  SalonInfoCard,
  SalonTestimonials,
  ServicePlans,
  StepsBoxed,
  StepsIcons,
  StudentVideo,
  SuccessStories,
  Testimonials,
  ThreeLargeBulletsRight,
  VirtualClass,
  VirtualTour,
  WhatWeOffer,
  WhatWeOfferRightImage,
  WhyChoiceUs,

  // ── Reviews ───────────────────────────────────────────────────────────
  AccountTestimonials,
  DentalOurReview,
  MovingTheirCompanies,
  ReviewsClean,
  ReviewsDefault,
  ReviewsSplash,
  SingleReview,
  StudentReview,

  // ── Programs / Services ───────────────────────────────────────────────
  ProgramBlocksAbbi,
  ProgramBlocks360,
  ProgramDefault,
  SalonServices,
  TrainingProgram,

  // ── Instructors / Team ────────────────────────────────────────────────
  AccountOurTeam,
  InstructorDefault,
  LocationInstructors,
  OurTeam,
  Ourteam: OurTeam,        // duplicate key in Nuxt — keep both
  SalonTeam,
  TeamCoaches,

  // ── Gallery ───────────────────────────────────────────────────────────
  GalleryDefault,
  LocationFacilityMedias: TODO,  // not yet migrated
  SalonGallery,
  SalonInstaGallery,

  // ── Policies ──────────────────────────────────────────────────────────
  PrivacyPolicy: PrivacyPolicy,
  RefundPolicy: RefundPolicy,
  TermsOfService: TermsOfService,

  // ── Schedule ──────────────────────────────────────────────────────────
  Schedule360,
  ScheduleDefault,
  VirtualSchedule,
  VirtualScheduleDefault,

  // ── Contact / FAQ ─────────────────────────────────────────────────────
  ContactDefault,
  FaqBushiban,
  FaqDefault,
  FaqTwo,

  // ── Locations ─────────────────────────────────────────────────────────
  LocationsDefault,

  // ── Events ────────────────────────────────────────────────────────────
  EventDefault,

  // ── Media / Other ─────────────────────────────────────────────────────
  EmbedIframe,
  InstagramFeed,
  InteractiveVideo,
  PopupFormReview,
  ReceiptDefault,
  VideoPlayer,
}
