'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { isGlobalPage, checkPageInMenu } from '@/lib/utils/pageUtils'
import type { Page, ComponentContent } from '@/types/api'

const OrderingDraggable = dynamic(
  () => import('@/components/OrderingDraggable').then(m => m.OrderingDraggable),
  { ssr: false },
)

interface Props {
  page: Page
  sections: ComponentContent[]
}

const TYPE_OPTIONS = [{ label: 'Landing Page', value: 'landing_page' }]

/**
 * Admin page controls shown at the top of dynamic pages.
 * Ported from Nuxt components/pages/PageEdit.vue (section editing excluded).
 */
export function PageEdit({ page, sections }: Props) {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const { putSecure, deleteSecure } = useSecureCalls()

  const globalPage = isGlobalPage(page)

  const [loading, setLoading] = useState(false)
  const [editPagePopup, setEditPagePopup] = useState(false)
  const [orderPopup, setOrderPopup] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [inMenu, setInMenu] = useState(false)
  const [isMemberOnly, setIsMemberOnly] = useState(false)

  useEffect(() => {
    setTitle(page.title ?? '')
    setDescription(page.description ?? '')
    setType(page.type)
    setIsMemberOnly(page.is_member_only ?? false)
    if (!globalPage && organization) {
      setInMenu(checkPageInMenu(organization, page))
    }
  }, [page, organization, globalPage])

  const deletePage = async () => {
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.PAGE, page.id)
      toast.success('Page Deleted Successfully', { duration: 5000 })
      setEditPagePopup(false)
      setOrderPopup(false)
      router.push('/')
    } catch {
      /* handled by client interceptor */
    } finally {
      setLoading(false)
    }
  }

  const updatePage = async (content?: ComponentContent[]) => {
    setLoading(true)
    try {
      let successMessage = 'Page Updated Successfully'
      const updateObject: Record<string, unknown> = { id: page.id }
      if (content) {
        updateObject.content = content
        successMessage = 'Sections Reordered Successfully'
      } else {
        updateObject.title = title
        updateObject.description = description
        updateObject.type = type
      }
      if (!globalPage) {
        updateObject.in_menu = inMenu
        updateObject.is_member_only = isMemberOnly
      }
      await putSecure(SECURE_ENDPOINTS.PAGE, updateObject)
      toast.success(successMessage, { duration: 5000 })
      setEditPagePopup(false)
      setOrderPopup(false)
      router.refresh()
    } catch {
      /* handled by client interceptor */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-[75px] max-[900px]:pt-[100px]">
      <div className="flex flex-wrap justify-center items-center gap-3">
        <button
          type="button"
          onClick={() => setEditPagePopup(true)}
          className="bg-gray-900 text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide"
        >
          Edit Page
        </button>
        {!globalPage && !page.is_external_page && (
          <button
            type="button"
            onClick={deletePage}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Page'}
          </button>
        )}
        {sections && sections.length > 1 && (
          <button
            type="button"
            onClick={() => setOrderPopup(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide"
          >
            Reorder/Delete Sections
          </button>
        )}
      </div>

      {editPagePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[1100px] max-h-[90vh] overflow-y-auto shadow-xl relative">
            {loading && (
              <div className="absolute inset-0 z-[99] bg-white/70 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold">Edit Page</h2>
              <button
                type="button"
                onClick={() => setEditPagePopup(false)}
                className="text-red-600 border border-red-600 rounded-full p-1.5 hover:bg-red-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              {!globalPage && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={type ?? ''}
                      onChange={e => setType(e.target.value || null)}
                    >
                      <option value="">—</option>
                      {TYPE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={inMenu}
                      onClick={() => {
                        setInMenu(v => {
                          const next = !v
                          if (!next) setIsMemberOnly(false)
                          return next
                        })
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inMenu ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inMenu ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-gray-700">Show In Menu?</span>
                  </label>
                  <label className={`flex items-center gap-3 select-none ${inMenu ? 'cursor-pointer' : 'opacity-50'}`}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isMemberOnly}
                      disabled={!inMenu}
                      onClick={() => setIsMemberOnly(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMemberOnly ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMemberOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-gray-700">Member Only?</span>
                  </label>
                </>
              )}
              <button
                type="button"
                onClick={() => updatePage()}
                disabled={loading}
                className="bg-gray-900 text-white px-8 py-3 rounded font-semibold text-sm uppercase tracking-wide disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {orderPopup && (
        <OrderingDraggable
          popup={orderPopup}
          updateData={updatePage}
          closePopup={() => setOrderPopup(false)}
          page_id={page.id}
          loading={loading}
        />
      )}
    </div>
  )
}
