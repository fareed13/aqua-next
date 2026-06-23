'use client'

import { useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { Page, ComponentContent } from '@/types/api'

interface DynamicPageProps {
  page: Page
  headlineFromMeta?: string
}

export function DynamicPage({ page, headlineFromMeta }: DynamicPageProps) {
  const organization = useOrgStore(s => s.organization)

  const sections: ComponentContent[] = useMemo(() => {
    return page.content ?? []
  }, [page.content])

  return (
    <div>
      {sections.map((section, i) => (
        <SectionRenderer key={`${section.component}-${i}`} section={section} />
      ))}
    </div>
  )
}
