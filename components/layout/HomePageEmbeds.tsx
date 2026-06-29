'use client'

import { usePathname } from 'next/navigation'
import { CustomEmbeds } from '@/components/CustomEmbeds'

// Mirrors Nuxt's: <CustomEmbeds v-if="!shouldShowMaintenance && $route.path === '/'" />
// CustomEmbeds only renders on the home page.
export function HomePageEmbeds() {
  const pathname = usePathname()
  if (pathname !== '/') return null
  return <CustomEmbeds />
}
