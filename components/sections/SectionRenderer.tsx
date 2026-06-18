'use client'

import { SECTION_REGISTRY } from './registry'
import type { ComponentContent } from '@/types/api'

interface Props {
  section: ComponentContent
}

/**
 * Renders a single page section by looking up section.component in the registry.
 * Returns null (renders nothing) for unregistered or not-yet-migrated components.
 * Component name must exactly match the key in registry.ts (same as Nuxt useComponents.js).
 */
export function SectionRenderer({ section }: Props) {
  const Component = SECTION_REGISTRY[section.component]

  if (!Component) {
    // In dev, log unmapped components so we know what needs migrating
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SectionRenderer] No component registered for: "${section.component}"`)
    }
    return null
  }

  return <Component {...section} />
}
