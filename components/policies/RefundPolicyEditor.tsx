'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { checkContentHttp } from '@/lib/utils/pageUtils'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { QuillEditor } from '@/components/QuillEditor'

/**
 * Admin edit view of the refund policy (Nuxt Refund.vue admin branch). Kept in its own
 * file and lazy-loaded so QuillEditor never lands in the public refund-policy bundle.
 */
export function RefundPolicyEditor() {
  const organization = useOrgStore((s) => s.organization)
  const { putSecure } = useSecureCalls()
  const [refund, setRefund] = useState<string>((organization as any)?.refund_policy ?? '')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (checkContentHttp(refund)) { toast.error('Refund Policy contains non secure http:// link'); return }
    if (refund && checkBase64(refund)) { setRefund(highlightBase64Images(refund)); return }
    setLoading(true)
    try {
      await putSecure(SECURE_ENDPOINTS.ORGANIZATION, { id: organization?.id, refund_policy: refund })
      toast.success('Refund Policy Updated Successfully', { duration: 15000 })
    } catch {
      toast.error('Refund Policy could not be updated', { duration: 15000 })
    } finally { setLoading(false) }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded border border-[#e0e0e0] bg-white">
        <div className="border-b border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 font-semibold">Edit Refund Policy</div>
        <div className="p-4 md:p-6">
          <h4 className="mb-3 text-sm font-medium">Policy Content:</h4>
          <QuillEditor content={refund} contentType="html" {...{ 'onUpdate:content': (html: string) => setRefund(html) }} />
          <button onClick={save} disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">
            <Save size={16} /> {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
