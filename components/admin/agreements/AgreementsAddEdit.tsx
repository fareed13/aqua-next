'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { checkContentHttp } from '@/lib/utils/pageUtils'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { QuillEditor, type QuillEditorHandle } from '@/components/QuillEditor'

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

const TYPE_OPTIONS = [
  { title: 'Waiver', value: 'waiver' },
  { title: 'Membership', value: 'membership' },
]
const KEYWORDS = [
  '#customerFirstName#', '#customerLastName#', '#organizationName#', '#locationDomain#',
  '#street#', '#membersSignature#', '#age#', '#currentDate#', '#membersSignatureOptional#',
]

// Unwrap a single attribute-less <div> wrapper so Quill hydrates (Nuxt normalizeAgreementContentForEditor).
function normalizeContent(html: string): string {
  const m = html?.match(/^<div>([\s\S]*)<\/div>$/)
  return m ? m[1] : html
}

export function AgreementsAddEdit({ agreementId }: { agreementId?: string }) {
  const router = useRouter()
  const organization = useOrgStore((s) => s.organization)
  const { getSecure, postSecure, putSecure } = useSecureCalls()
  const quillRef = useRef<QuillEditorHandle>(null)

  const editMode = !!agreementId
  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [content, setContent] = useState('')
  const [overlay, setOverlay] = useState(false)

  useEffect(() => {
    if (!agreementId) return
    ;(async () => {
      setOverlay(true)
      try {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.AGREEMENTS, { id: parseInt(agreementId) })
        const a = Array.isArray(res) ? res[0] : res
        if (a) { setId(a.id); setName(a.name ?? ''); setType(a.type ?? ''); setContent(normalizeContent(a.content ?? '')) }
      } catch { /* handled */ } finally { setOverlay(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreementId])

  const insertKeyword = (tag: string) => {
    const q = quillRef.current?.getQuill()
    if (!q) { setContent((c) => c + tag); return }
    const range = q.getSelection(true)
    const idx = range ? range.index : q.getLength()
    q.insertText(idx, tag)
    q.setSelection(idx + tag.length)
  }

  const guardsPass = () => {
    if (checkContentHttp(content)) { toast.error('content contains non secure http:// link'); return false }
    if (checkBase64(content)) { setContent(highlightBase64Images(content)); return false }
    return true
  }

  const submit = async () => {
    if (!name.trim() || !type) { toast.error('Please fill out the required fields', { duration: 15000 }); return }
    if (!guardsPass()) return
    setOverlay(true)
    try {
      if (editMode) {
        await putSecure(SECURE_ENDPOINTS.AGREEMENTS, { id, name, type, content })
        toast.success('updated Successfully', { duration: 15000 })
      } else {
        await postSecure(SECURE_ENDPOINTS.AGREEMENTS, { name, type, content, organization: organization?.id })
        toast.success('Added Successfully', { duration: 15000 })
      }
      router.push('/admin/all-settings')
    } catch {
      toast.error(editMode ? 'Agreement could not be update' : 'Agreement could not be added', { duration: 15000 })
    } finally { setOverlay(false) }
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold">{editMode ? 'Edit' : 'Add'} Agreement</h2>

        <div className="space-y-4">
          <div><label className={LABEL}>Name *</label><input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className={LABEL}>Type *</label>
            <select className={FIELD} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select Type</option>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Content</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {KEYWORDS.map((k) => (
                <button key={k} type="button" onClick={() => insertKeyword(k)} className="rounded-full bg-[#e6edfd] px-2.5 py-0.5 text-[13px] text-[#2a4d9b] hover:bg-[#d6e2fb]" title="Click to insert">
                  {k}
                </button>
              ))}
            </div>
            <QuillEditor ref={quillRef} content={content} contentType="html" {...{ 'onUpdate:content': (html: string) => setContent(html) }} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={submit} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white">{editMode ? 'Update' : 'Save'}</button>
          <button onClick={() => router.push('/admin/all-settings')} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
