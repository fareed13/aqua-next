'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { EditableSections } from '@/components/sections/EditableSections'
import type { Page } from '@/types/api'

const PageEdit = dynamic(() => import('./PageEdit').then(m => m.PageEdit), { ssr: false })

/**
 * Home page sections with admin controls — mirrors Nuxt pages/index.vue,
 * which shows PageEdit and section editing to any logged-in admin
 * (the homepage is a global page, so PageEdit hides Delete/type/menu there).
 */
export function HomePageSections({ page }: { page: Page }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { isAdminLoggedIn } = useAuth()

  const sections = page.content ?? []

  return (
    <>
      {mounted && isAdminLoggedIn() && <PageEdit page={page} sections={sections} />}
      <EditableSections target="page" targetId={page.id} sections={sections} />
    </>
  )
}
