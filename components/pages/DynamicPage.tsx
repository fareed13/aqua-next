'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isGlobalPage } from '@/lib/utils/pageUtils'
import { EditableSections } from '@/components/sections/EditableSections'
import { PageEdit } from './PageEdit'
import type { Page, ComponentContent } from '@/types/api'

interface DynamicPageProps {
  page: Page
  headlineFromMeta?: string
}

export function DynamicPage({ page }: DynamicPageProps) {
  // Defer auth-dependent UI to the client to avoid SSR mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { isAdminLoggedIn } = useAuth()

  const sections: ComponentContent[] = useMemo(() => {
    return page.content ?? []
  }, [page.content])

  // Same gating as Nuxt [page].vue: admins can manage non-global pages,
  // plus the location-specific reviews page.
  const editablePage = !isGlobalPage(page) || page.slug === 'reviews'
  const showAdminControls = mounted && isAdminLoggedIn() && editablePage

  return (
    <div>
      {showAdminControls && <PageEdit page={page} sections={sections} />}
      <EditableSections
        target="page"
        targetId={page.id}
        sections={sections}
        canEdit={editablePage}
      />
    </div>
  )
}
