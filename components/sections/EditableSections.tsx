'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { SectionRenderer } from './SectionRenderer'
import type { SectionEditTarget } from './SectionEdit'
import type { ComponentContent } from '@/types/api'

const SectionEdit = dynamic(() => import('./SectionEdit').then(m => m.SectionEdit), { ssr: false })
const OrderingDraggable = dynamic(
  () => import('@/components/OrderingDraggable').then(m => m.OrderingDraggable),
  { ssr: false },
)

const TARGET_ENDPOINTS: Record<SectionEditTarget, string> = {
  page: SECURE_ENDPOINTS.PAGE,
  location: SECURE_ENDPOINTS.LOCATION,
  service: SECURE_ENDPOINTS.GET_SERVICES,
}

interface Props {
  target: SectionEditTarget
  targetId: number | string
  sections: ComponentContent[]
  /** Show the Reorder/Delete Sections button (Nuxt shows it on location & classes pages). */
  showReorder?: boolean
  /** Extra gate on top of the admin check (e.g. global pages are not editable). */
  canEdit?: boolean
}

/**
 * Renders a content-section list; for logged-in admins it adds the Nuxt admin
 * controls: a per-section edit button, an "Add Section" button, optional
 * reorder popup, and the unified SectionEdit dialog. Non-admins get exactly
 * the same output as mapping SectionRenderer directly.
 */
export function EditableSections({ target, targetId, sections: initialSections, showReorder = false, canEdit = true }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isAdminLoggedIn } = useAuth()
  const { putSecure } = useSecureCalls()

  const [sections, setSections] = useState<ComponentContent[]>(initialSections)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [orderPopup, setOrderPopup] = useState(false)
  const [orderSaving, setOrderSaving] = useState(false)

  useEffect(() => setSections(initialSections), [initialSections])

  const isAdmin = mounted && canEdit && isAdminLoggedIn()

  const editSections = (index: number | null) => {
    setSelectedIndex(index)
    setEditorOpen(true)
  }

  // Intentionally do NOT update the rendered `sections` after a save/reorder.
  // The public pages are statically built (serverInit uses `force-cache`, no
  // revalidation), so content only goes live on the next deployment. Reflecting
  // an edit optimistically here would show the admin a section that isn't yet on
  // the live site — the confusing "it appeared before deploy" behaviour. The PUT
  // still persists to the backend; the change surfaces after the site is rebuilt.

  const reorderSave = async (content: any[]) => {
    setOrderSaving(true)
    try {
      await putSecure(TARGET_ENDPOINTS[target], { id: targetId, content })
      toast.success('Sections reordered. It will appear on the site after the next deployment.', { duration: 6000 })
      setOrderPopup(false)
    } catch {
      toast.error('Failed to reorder sections. Please try again.', { duration: 5000 })
    } finally {
      setOrderSaving(false)
    }
  }

  return (
    <div>
      {isAdmin && showReorder && sections.length > 1 && (
        <div className="flex justify-center pt-20">
          <button
            type="button"
            onClick={() => setOrderPopup(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide"
          >
            Reorder/Delete Sections
          </button>
        </div>
      )}

      {sections.map((section, i) => (
        <div key={`${section.component}-${i}`}>
          {isAdmin && (
            <div className="flex justify-end my-4">
              <button
                type="button"
                onClick={() => editSections(i)}
                className="mt-5 mr-5 z-10 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-gray-50 text-gray-700"
                aria-label={`Edit section ${section.component}`}
                title={`Edit ${section.component}`}
              >
                {/* mdi:table-edit, same glyph as Nuxt */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C19.86,11.09 20.21,11.09 20.42,11.3L21.7,12.58C21.91,12.79 21.91,13.14 21.7,13.35M12,18.94L18.06,12.88L20.11,14.93L14.06,21H12V18.94M4,2H18A2,2 0 0,1 20,4V8.17L16.17,12H12V16.17L10.17,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,6V10H10V6H4M12,6V10H18V6H12M4,12V16H10V12H4Z" />
                </svg>
              </button>
            </div>
          )}
          <SectionRenderer section={section} />
        </div>
      ))}

      {isAdmin && (
        <div className="flex justify-center py-10 my-10">
          <button
            type="button"
            onClick={() => editSections(null)}
            className="mt-5 mr-5 bg-[#ff5252] text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide shadow"
          >
            Add Section
          </button>
        </div>
      )}

      {isAdmin && editorOpen && (
        <SectionEdit
          target={target}
          targetId={targetId}
          sectionIndex={selectedIndex}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {isAdmin && orderPopup && (
        <OrderingDraggable
          popup={orderPopup}
          updateData={reorderSave}
          closePopup={() => setOrderPopup(false)}
          loading={orderSaving}
          page_id={target === 'page' ? targetId : undefined}
          location_id={target === 'location' ? targetId : undefined}
          service_id={target === 'service' ? targetId : undefined}
        />
      )}
    </div>
  )
}
