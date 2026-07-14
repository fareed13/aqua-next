'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { EditableSections } from '@/components/sections/EditableSections'
import { PageEdit } from './PageEdit'
import type { Page } from '@/types/api'

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
