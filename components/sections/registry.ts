/**
 * Component registry — maps DB-stored component name strings to React components.
 * KEY NAMES MUST MATCH the Nuxt useComponents.js keys exactly.
 *
 * Each section is lazy-loaded via next/dynamic so a page only ships the JS
 * for the sections it actually renders (ssr stays on → HTML/SEO unaffected).
 * SectionRenderer (the only runtime consumer) is a Client Component, so this
 * code-splits correctly per Next.js docs.
 */

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { ComponentContent } from '@/types/api'

export type SectionProps = ComponentContent

// Placeholder until a component is migrated (renders nothing, no crash)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TODO = (_props: SectionProps) => null

export const SECTION_REGISTRY: Record<string, ComponentType<SectionProps>> = {
  // ── Carousels / Banners ───────────────────────────────────────────────
  LandingPageBanner: dynamic(() => import('@/components/carousel/LandingPageBanner').then(m => m.LandingPageBanner)),
  BigImageBackground: dynamic(() => import('@/components/carousel/BigImageBackground').then(m => m.BigImageBackground)),
  Carousel: dynamic(() => import('@/components/carousel/CarouselDefault').then(m => m.CarouselDefault)),
  CarouselAbbi: dynamic(() => import('@/components/carousel/CarouselAbbi').then(m => m.CarouselAbbi)),
  CarouselSix: dynamic(() => import('@/components/carousel/CarouselSix').then(m => m.CarouselSix)),
  FitnessCarousel: dynamic(() => import('@/components/carousel/FitnessCarousel').then(m => m.FitnessCarousel)),
  GymBanner: dynamic(() => import('@/components/carousel/GymBanner').then(m => m.GymBanner)),
  Video: dynamic(() => import('@/components/carousel/CarouselVideo').then(m => m.CarouselVideo)),
  VideoClean: dynamic(() => import('@/components/carousel/VideoClean').then(m => m.VideoClean)),
  JHWavyBottomRightImage: dynamic(() => import('@/components/carousel/JHWavyBottomRightImage').then(m => m.JHWavyBottomRightImage)),
  SalonCarousel: dynamic(() => import('@/components/carousel/SalonCarousel').then(m => m.SalonCarousel)),
  AccountCarousel: dynamic(() => import('@/components/carousel/AccountCarousel').then(m => m.AccountCarousel)),
  DentalBannerCarousel: dynamic(() => import('@/components/carousel/DentalBannerCarousel').then(m => m.DentalBannerCarousel)),
  Carousel360: dynamic(() => import('@/components/carousel/Carousel360').then(m => m.Carousel360)),
  VideoIntro: dynamic(() => import('@/components/carousel/VideoIntro').then(m => m.VideoIntro)),

  // ── Offers ───────────────────────────────────────────────────────────
  NewMemberOffer: dynamic(() => import('@/components/offers/NewMemberOffer').then(m => m.NewMemberOffer)),
  OfferDefault: dynamic(() => import('@/components/offers/OfferDefault').then(m => m.OfferDefault)),
  OfferGeneral: dynamic(() => import('@/components/offers/OfferGeneral').then(m => m.OfferGeneral)),
  OfferJoinUs: dynamic(() => import('@/components/offers/OfferJoinUs').then(m => m.OfferJoinUs)),

  // ── Sections / Content blocks ─────────────────────────────────────────
  AbbiLeftImage: dynamic(() => import('@/components/sections/AbbiLeftImage').then(m => m.AbbiLeftImage)),
  AbbiRightImage: dynamic(() => import('@/components/sections/AbbiRightImage').then(m => m.AbbiRightImage)),
  AboutMe: dynamic(() => import('@/components/sections/AboutMe').then(m => m.AboutMe)),
  AccountCallUs: dynamic(() => import('@/components/sections/AccountCallUs').then(m => m.AccountCallUs)),
  AccountCtaQuoteBanner: dynamic(() => import('@/components/sections/AccountCtaQuoteBanner').then(m => m.AccountCtaQuoteBanner)),
  AccountOurFeatures: dynamic(() => import('@/components/sections/AccountOurFeatures').then(m => m.AccountOurFeatures)),
  AccountWhatWeOffer: dynamic(() => import('@/components/sections/AccountWhatWeOffer').then(m => m.AccountWhatWeOffer)),
  AwardsDefault: dynamic(() => import('@/components/sections/AwardsDefault').then(m => m.AwardsDefault)),
  BlockedRightImage: dynamic(() => import('@/components/sections/BlockedRightImage').then(m => m.BlockedRightImage)),
  BookNow: dynamic(() => import('@/components/sections/BookNow').then(m => m.BookNow)),
  BuyNow: dynamic(() => import('@/components/sections/BuyNow').then(m => m.BuyNow)),
  Calender: dynamic(() => import('@/components/sections/Calender').then(m => m.Calender)),
  CTAChecks: dynamic(() => import('@/components/sections/CTAChecks').then(m => m.CTAChecks)),
  CTARightVideo: dynamic(() => import('@/components/sections/CTARightVideo').then(m => m.CTARightVideo)),
  ChangeProgram: dynamic(() => import('@/components/sections/ChangeProgram').then(m => m.ChangeProgram)),
  CounterCard: dynamic(() => import('@/components/sections/CounterCard').then(m => m.CounterCard)),
  DentalAboutUs: dynamic(() => import('@/components/sections/DentalAboutUs').then(m => m.DentalAboutUs)),
  DentalRequestAppointment: dynamic(() => import('@/components/sections/DentalRequestAppointment').then(m => m.DentalRequestAppointment)),
  DentalWeHelp: dynamic(() => import('@/components/sections/DentalWeHelp').then(m => m.DentalWeHelp)),
  DiscountSection: dynamic(() => import('@/components/sections/DiscountSection').then(m => m.DiscountSection)),
  Ebook: dynamic(() => import('@/components/sections/Ebook').then(m => m.Ebook)),
  FadedLeftImage: dynamic(() => import('@/components/sections/FadedLeftImage').then(m => m.FadedLeftImage)),
  FadedNoImage: dynamic(() => import('@/components/sections/FadedNoImage').then(m => m.FadedNoImage)),
  FadedRightImage: dynamic(() => import('@/components/sections/FadedRightImage').then(m => m.FadedRightImage)),
  FitnessGoals: dynamic(() => import('@/components/sections/FitnessGoals').then(m => m.FitnessGoals)),
  FreeDiscount: dynamic(() => import('@/components/sections/FreeDiscount').then(m => m.FreeDiscount)),
  FullWidthHeading: dynamic(() => import('@/components/sections/FullWidthHeading').then(m => m.FullWidthHeading)),
  GeneralLeftImage: dynamic(() => import('@/components/sections/GeneralLeftImage').then(m => m.GeneralLeftImage)),
  GeneralRightImage: dynamic(() => import('@/components/sections/GeneralRightImage').then(m => m.GeneralRightImage)),
  GetStarted: dynamic(() => import('@/components/sections/GetStarted').then(m => m.GetStarted)),
  GymCtaBanner: dynamic(() => import('@/components/sections/GymCtaBanner').then(m => m.GymCtaBanner)),
  GymInfoCard: dynamic(() => import('@/components/sections/GymInfoCard').then(m => m.GymInfoCard)),
  GymInstructors: dynamic(() => import('@/components/sections/GymInstructors').then(m => m.GymInstructors)),
  GymSuccessStories: dynamic(() => import('@/components/sections/GymSuccessStories').then(m => m.GymSuccessStories)),
  HomeContact: dynamic(() => import('@/components/sections/HomeContact').then(m => m.HomeContact)),
  HomeSlider: dynamic(() => import('@/components/sections/HomeSlider').then(m => m.HomeSlider)),
  ImproveWorkout: dynamic(() => import('@/components/sections/ImproveWorkout').then(m => m.ImproveWorkout)),
  JHAboutUs: dynamic(() => import('@/components/sections/JHAboutUs').then(m => m.JHAboutUs)),
  JHCtaBanner: dynamic(() => import('@/components/sections/JHCtaBanner').then(m => m.JHCtaBanner)),
  JHHowItWorks: dynamic(() => import('@/components/sections/JHHowItWorks').then(m => m.JHHowItWorks)),
  JHOurRecent: dynamic(() => import('@/components/sections/JHOurRecent').then(m => m.JHOurRecent)),
  JHRecoveredCaption: dynamic(() => import('@/components/sections/JHRecoveredCaption').then(m => m.JHRecoveredCaption)),
  JHRemovalServices: dynamic(() => import('@/components/sections/JHRemovalServices').then(m => m.JHRemovalServices)),
  JHTestimonialsNew: dynamic(() => import('@/components/sections/JHTestimonialsNew').then(m => m.JHTestimonialsNew)),
  JoinclassesCard: dynamic(() => import('@/components/sections/JoinclassesCard').then(m => m.JoinclassesCard)),
  LeftToRightArrow: dynamic(() => import('@/components/sections/LeftToRightArrow').then(m => m.LeftToRightArrow)),
  LetsGetStarted: dynamic(() => import('@/components/sections/LetsGetStarted').then(m => m.LetsGetStarted)),
  Morefacilities: dynamic(() => import('@/components/sections/Morefacilities').then(m => m.Morefacilities)),
  NoFadeRightImage: dynamic(() => import('@/components/sections/NoFadeRightImage').then(m => m.NoFadeRightImage)),
  OurClientServices: dynamic(() => import('@/components/sections/OurClientServices').then(m => m.OurClientServices)),
  OurStory: dynamic(() => import('@/components/sections/OurStory').then(m => m.OurStory)),
  OurUnique: dynamic(() => import('@/components/sections/OurUnique').then(m => m.OurUnique)),
  ProgramChildrenDefault: dynamic(() => import('@/components/sections/ProgramChildrenDefault').then(m => m.ProgramChildrenDefault)),
  ProvideServices: dynamic(() => import('@/components/sections/ProvideServices').then(m => m.ProvideServices)),
  QuicklyCreateBeautiful: dynamic(() => import('@/components/sections/QuicklyCreateBeautiful').then(m => m.QuicklyCreateBeautiful)),
  QuoteWithParallax: dynamic(() => import('@/components/sections/QuoteWithParallax').then(m => m.QuoteWithParallax)),
  ReferralHero: dynamic(() => import('@/components/sections/ReferralHero').then(m => m.ReferralHero)),
  RightToLeftArrow: dynamic(() => import('@/components/sections/RightToLeftArrow').then(m => m.RightToLeftArrow)),
  RowOfImages: dynamic(() => import('@/components/sections/RowOfImages').then(m => m.RowOfImages)),
  SalonAppointment: dynamic(() => import('@/components/sections/SalonAppointment').then(m => m.SalonAppointment)),
  SalonCareCenter: dynamic(() => import('@/components/sections/SalonCareCenter').then(m => m.SalonCareCenter)),
  SalonClients: dynamic(() => import('@/components/sections/SalonClients').then(m => m.SalonClients)),
  SalonGreySection: dynamic(() => import('@/components/sections/SalonGreySection').then(m => m.SalonGreySection)),
  SalonInfoCard: dynamic(() => import('@/components/sections/SalonInfoCard').then(m => m.SalonInfoCard)),
  SalonTestimonials: dynamic(() => import('@/components/sections/SalonTestimonials').then(m => m.SalonTestimonials)),
  ServicePlans: dynamic(() => import('@/components/sections/ServicePlans').then(m => m.ServicePlans)),
  StepsBoxed: dynamic(() => import('@/components/sections/StepsBoxed').then(m => m.StepsBoxed)),
  StepsIcons: dynamic(() => import('@/components/sections/StepsIcons').then(m => m.StepsIcons)),
  StudentVideo: dynamic(() => import('@/components/sections/StudentVideo').then(m => m.StudentVideo)),
  SuccessStories: dynamic(() => import('@/components/sections/SuccessStories').then(m => m.SuccessStories)),
  Testimonials: dynamic(() => import('@/components/sections/Testimonials').then(m => m.Testimonials)),
  ThreeLargeBulletsRight: dynamic(() => import('@/components/sections/ThreeLargeBulletsRight').then(m => m.ThreeLargeBulletsRight)),
  VirtualClass: dynamic(() => import('@/components/sections/VirtualClass').then(m => m.VirtualClass)),
  VirtualTour: dynamic(() => import('@/components/sections/VirtualTour').then(m => m.VirtualTour)),
  WhatWeOffer: dynamic(() => import('@/components/sections/WhatWeOffer').then(m => m.WhatWeOffer)),
  WhatWeOfferRightImage: dynamic(() => import('@/components/sections/WhatWeOfferRightImage').then(m => m.WhatWeOfferRightImage)),
  WhyChoiceUs: dynamic(() => import('@/components/sections/WhyChoiceUs').then(m => m.WhyChoiceUs)),

  // ── Reviews ───────────────────────────────────────────────────────────
  AccountTestimonials: dynamic(() => import('@/components/reviews/AccountTestimonials').then(m => m.AccountTestimonials)),
  DentalOurReview: dynamic(() => import('@/components/reviews/DentalOurReview').then(m => m.DentalOurReview)),
  MovingTheirCompanies: dynamic(() => import('@/components/reviews/MovingTheirCompanies').then(m => m.MovingTheirCompanies)),
  ReviewsClean: dynamic(() => import('@/components/reviews/ReviewsClean').then(m => m.ReviewsClean)),
  ReviewsDefault: dynamic(() => import('@/components/reviews/ReviewsDefault').then(m => m.ReviewsDefault)),
  ReviewsSplash: dynamic(() => import('@/components/reviews/ReviewsSplash').then(m => m.ReviewsSplash)),
  SingleReview: dynamic(() => import('@/components/reviews/SingleReview').then(m => m.SingleReview)),
  StudentReview: dynamic(() => import('@/components/reviews/StudentReview').then(m => m.StudentReview)),

  // ── Programs / Services ───────────────────────────────────────────────
  ProgramBlocksAbbi: dynamic(() => import('@/components/programBlocks/ProgramBlocksAbbi').then(m => m.ProgramBlocksAbbi)),
  ProgramBlocks360: dynamic(() => import('@/components/programBlocks/ProgramBlocks360').then(m => m.ProgramBlocks360)),
  ProgramDefault: dynamic(() => import('@/components/programBlocks/ProgramDefault').then(m => m.ProgramDefault)),
  SalonServices: dynamic(() => import('@/components/programBlocks/SalonServices').then(m => m.SalonServices)),
  TrainingProgram: dynamic(() => import('@/components/programBlocks/TrainingProgram').then(m => m.TrainingProgram)),

  // ── Instructors / Team ────────────────────────────────────────────────
  AccountOurTeam: dynamic(() => import('@/components/instructor/AccountOurTeam').then(m => m.AccountOurTeam)),
  InstructorDefault: dynamic(() => import('@/components/instructor/InstructorDefault').then(m => m.InstructorDefault)),
  LocationInstructors: dynamic(() => import('@/components/instructor/LocationInstructors').then(m => m.LocationInstructors)),
  OurTeam: dynamic(() => import('@/components/instructor/OurTeam').then(m => m.OurTeam)),
  Ourteam: dynamic(() => import('@/components/instructor/OurTeam').then(m => m.OurTeam)), // duplicate key in Nuxt — keep both
  SalonTeam: dynamic(() => import('@/components/instructor/SalonTeam').then(m => m.SalonTeam)),
  TeamCoaches: dynamic(() => import('@/components/instructor/TeamCoaches').then(m => m.TeamCoaches)),

  // ── Gallery ───────────────────────────────────────────────────────────
  GalleryDefault: dynamic(() => import('@/components/gallery/GalleryDefault').then(m => m.GalleryDefault)),
  LocationFacilityMedias: dynamic(() => import('@/components/facilities/LocationFacilityMedias').then(m => m.LocationFacilityMedias)),
  SalonGallery: dynamic(() => import('@/components/gallery/SalonGallery').then(m => m.SalonGallery)),
  SalonInstaGallery: dynamic(() => import('@/components/gallery/SalonInstaGallery').then(m => m.SalonInstaGallery)),

  // ── Policies ──────────────────────────────────────────────────────────
  PrivacyPolicy: dynamic(() => import('@/components/policies/privacy').then(m => m.PrivacyPolicy)),
  RefundPolicy: dynamic(() => import('@/components/policies/Refund').then(m => m.RefundPolicy)),
  TermsOfService: dynamic(() => import('@/components/policies/Terms').then(m => m.TermsOfService)),

  // ── Schedule ──────────────────────────────────────────────────────────
  Schedule360: dynamic(() => import('@/components/schedule/Schedule360').then(m => m.Schedule360)),
  ScheduleDefault: dynamic(() => import('@/components/schedule/ScheduleDefault').then(m => m.ScheduleDefault)),
  VirtualSchedule: dynamic(() => import('@/components/VirtualSchedule').then(m => m.VirtualSchedule)),
  VirtualScheduleDefault: dynamic(() => import('@/components/schedule/VirtualScheduleDefault').then(m => m.VirtualScheduleDefault)),

  // ── Contact / FAQ ─────────────────────────────────────────────────────
  ContactDefault: dynamic(() => import('@/components/contact/ContactDefault').then(m => m.ContactDefault)),
  FaqBushiban: dynamic(() => import('@/components/faqs/FaqBushiban').then(m => m.FaqBushiban)),
  FaqDefault: dynamic(() => import('@/components/faqs/FaqDefault').then(m => m.FaqDefault)),
  FaqTwo: dynamic(() => import('@/components/faqs/FaqTwo').then(m => m.FaqTwo)),

  // ── Locations ─────────────────────────────────────────────────────────
  LocationsDefault: dynamic(() => import('@/components/locations/LocationsDefault').then(m => m.LocationsDefault)),

  // ── Events ────────────────────────────────────────────────────────────
  EventDefault: dynamic(() => import('@/components/events/EventDefault').then(m => m.EventDefault)),

  // ── Media / Other ─────────────────────────────────────────────────────
  EmbedIframe: dynamic(() => import('@/components/EmbedIframe').then(m => m.EmbedIframe)),
  InstagramFeed: dynamic(() => import('@/components/instagram/InstagramFeed').then(m => m.InstagramFeed)),
  InteractiveVideo: dynamic(() => import('@/components/InteractiveVideo').then(m => m.InteractiveVideo)),
  PopupFormReview: dynamic(() => import('@/components/popupForm/PopupFormReview').then(m => m.PopupFormReview)),
  ReceiptDefault: dynamic(() => import('@/components/receipt/ReceiptDefault').then(m => m.ReceiptDefault)),
  VideoPlayer: dynamic(() => import('@/components/media/VideoPlayer').then(m => m.VideoPlayer)),
}
