'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ReceiptText, Save } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { checkContentHttp } from '@/lib/utils/pageUtils'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { QuillEditor, type QuillEditorHandle } from '@/components/QuillEditor'

const COMMON_TAGS = ['#customerFirstName#', '#customerLastName#', '#organizationName#', '#domain#', '#street#', '#phone#', '#city#', '#currentDate#']
const TRIAL_TAGS = COMMON_TAGS
const BOOKING_TAGS = ['#className#', '#classDate#', '#classTime#', ...COMMON_TAGS]

interface ReceiptEditorProps {
  field: 'trial_receipt' | 'booking_receipt'
  title: string
  subtitle: string
  errorLabel: string // used in the non-secure-http toast
}

/**
 * Shared editor for Nuxt's OrganizationTrialReceiptAddEdit / OrganizationBookingReceiptAddEdit —
 * a Quill receipt editor with click-to-insert keyword chips, saving to ORGANIZATION[field].
 */
export function ReceiptEditor({ field, title, subtitle, errorLabel }: ReceiptEditorProps) {
  const organization = useOrgStore((s) => s.organization)
  const { getSecure, putSecure } = useSecureCalls()
  const quillRef = useRef<QuillEditorHandle>(null)

  const [orgName, setOrgName] = useState('')
  const [content, setContent] = useState('')
  const [overlay, setOverlay] = useState(false)
  const draggedTag = useRef<string | null>(null)

  const tags = field === 'booking_receipt' ? BOOKING_TAGS : TRIAL_TAGS

  useEffect(() => {
    ;(async () => {
      setOverlay(true)
      try {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.ORGANIZATION)
        const org = Array.isArray(res) ? res[0] : res
        if (org) { setOrgName(org.name ?? ''); setContent(org[field] ?? '') }
      } catch { /* handled */ } finally { setOverlay(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertAt = (tag: string, idx?: number) => {
    const q = quillRef.current?.getQuill()
    if (!q) { setContent((c) => c + tag); return }
    const pos = idx ?? (q.getSelection()?.index ?? q.selection?.savedRange?.index ?? q.getLength())
    q.insertText(pos, tag)
    q.setSelection(pos + tag.length)
  }
  const insertKeyword = (tag: string) => insertAt(tag)

  // Drop the dragged tag at the caret's last-known position (Nuxt onDrop).
  const onEditorDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const tag = draggedTag.current
    if (!tag) return
    const q = quillRef.current?.getQuill()
    insertAt(tag, q?.selection?.savedRange?.index)
    draggedTag.current = null
  }

  const update = async () => {
    if (checkContentHttp(content)) { toast.error(`${errorLabel} contains non secure http:// link`); return }
    if (content && checkBase64(content)) { setContent(highlightBase64Images(content)); return }
    setOverlay(true)
    try {
      await putSecure(SECURE_ENDPOINTS.ORGANIZATION, { id: organization?.id, [field]: content })
      toast.success('updated Successfully', { duration: 15000 })
    } catch {
      toast.error('receipt could not be update', { duration: 15000 })
    } finally { setOverlay(false) }
  }

  return (
    <div className="min-h-full bg-white">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="mb-4 bg-[#124e66] p-4">
        <div className="flex items-center gap-3">
          <ReceiptText size={30} className="text-white" />
          <div>
            <h1 className="text-xl text-white md:text-2xl">{title}</h1>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="rounded border border-[#e0e0e0] bg-white">
          <div className="hidden border-b border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 font-semibold md:block">Receipt Configuration</div>
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Organization Name</label>
              <input value={orgName} disabled className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3.5 py-2.5 text-base text-gray-600" />
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Draggable Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    draggable
                    onDragStart={(e) => { draggedTag.current = t; e.dataTransfer.setData('text/plain', t); e.dataTransfer.effectAllowed = 'copy' }}
                    onClick={() => insertKeyword(t)}
                    title="Drag into the editor, or click to insert"
                    className="cursor-grab rounded border-2 border-[#1976d2] bg-white px-3 py-1 text-sm font-semibold text-[#1976d2] hover:bg-[#e3f0fd] active:cursor-grabbing"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Receipt Content:</h4>
              <div onDrop={onEditorDrop} onDragOver={(e) => e.preventDefault()}>
                <QuillEditor ref={quillRef} content={content} contentType="html" {...{ 'onUpdate:content': (html: string) => setContent(html) }} />
              </div>
            </div>

            <button onClick={update} className="inline-flex items-center gap-2 rounded bg-[#124e66] px-6 py-2.5 font-medium text-white">
              <Save size={16} /> Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
