'use client'

import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'
import { toast } from 'sonner'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

// The two placeholder tokens the agreement content is split on (Nuxt SignAgreement.vue).
const SIGN_TOKEN_RE = /#membersSignature#|#membersSignatureOptional#/
const SIGN_TOKEN_RE_G = /#membersSignature#|#membersSignatureOptional#/g

interface SignaturePadHandle {
  clear: () => void
  undo: () => void
  isEmpty: () => boolean
  save: () => string
}

/**
 * Minimal canvas signature pad — replaces Nuxt's `vue3-signature` dependency with a
 * plain <canvas>, so nothing new lands in the bundle. Tracks per-stroke snapshots so
 * Undo can pop the last stroke; `isEmpty` reflects whether anything has been drawn.
 */
const SignaturePad = forwardRef<SignaturePadHandle, { width: number; height: number }>(
  function SignaturePad({ width, height }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawing = useRef(false)
    // Snapshot stack: each committed stroke pushes the prior canvas state for undo.
    const history = useRef<ImageData[]>([])
    const [dirty, setDirty] = useState(false)

    const ctx = () => canvasRef.current?.getContext('2d') ?? null

    useEffect(() => {
      const c = ctx()
      if (c) {
        c.fillStyle = 'rgb(255,255,255)'
        c.fillRect(0, 0, width, height)
        c.strokeStyle = 'rgb(0,0,0)'
        c.lineWidth = 2
        c.lineCap = 'round'
        c.lineJoin = 'round'
      }
    }, [width, height])

    const pos = (e: React.PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const start = (e: React.PointerEvent) => {
      const c = ctx()
      if (!c) return
      // Snapshot before the stroke so undo restores this exact state.
      history.current.push(c.getImageData(0, 0, width, height))
      drawing.current = true
      const { x, y } = pos(e)
      c.beginPath()
      c.moveTo(x, y)
      canvasRef.current!.setPointerCapture(e.pointerId)
    }

    const move = (e: React.PointerEvent) => {
      if (!drawing.current) return
      const c = ctx()
      if (!c) return
      const { x, y } = pos(e)
      c.lineTo(x, y)
      c.stroke()
      setDirty(true)
    }

    const end = () => { drawing.current = false }

    useImperativeHandle(ref, () => ({
      clear: () => {
        const c = ctx()
        if (!c) return
        c.fillStyle = 'rgb(255,255,255)'
        c.fillRect(0, 0, width, height)
        history.current = []
        setDirty(false)
      },
      undo: () => {
        const c = ctx()
        if (!c) return
        const prev = history.current.pop()
        if (prev) c.putImageData(prev, 0, 0)
        if (history.current.length === 0) setDirty(false)
      },
      isEmpty: () => !dirty,
      save: () => canvasRef.current?.toDataURL('image/png') ?? '',
    }))

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="touch-none block bg-white"
      />
    )
  }
)

export interface SignAgreementProps {
  agreementContent: string
  agreementId: number
  onClose: () => void
  onAgreementUpdated: (updated: unknown) => void
}

/** Ports Nuxt components/agreements/SignAgreement.vue — the customer agreement signing dialog. */
export function SignAgreement({ agreementContent, agreementId, onClose, onAgreementUpdated }: SignAgreementProps) {
  const { putSecure } = useSecureCalls()
  const [padWidth, setPadWidth] = useState(400)
  const [saving, setSaving] = useState(false)

  // The signature tokens in order; each gets its own pad, with the content
  // segment before it rendered above (Nuxt splits content the same way).
  const tokens = useMemo(() => agreementContent.match(SIGN_TOKEN_RE_G) ?? [], [agreementContent])
  const segments = useMemo(() => agreementContent.split(SIGN_TOKEN_RE), [agreementContent])
  const padRefs = useRef<Array<SignaturePadHandle | null>>([])

  useEffect(() => {
    const setW = () => setPadWidth(window.innerWidth >= 768 ? 400 : 200)
    setW()
    window.addEventListener('resize', setW)
    return () => window.removeEventListener('resize', setW)
  }, [])

  const saveContract = async () => {
    let notSigned = false
    let pdfContent = agreementContent
    for (let i = 0; i < tokens.length; i++) {
      const pad = padRefs.current[i]
      // Optional signatures may be left blank; required ones may not.
      if (tokens[i] !== '#membersSignatureOptional#' && (!pad || pad.isEmpty())) {
        notSigned = true
      } else if (pad && !pad.isEmpty()) {
        const png = pad.save()
        pdfContent = pdfContent.replace(
          SIGN_TOKEN_RE,
          `<div><img height="60px" width="80px" src="${png}"/></div>`,
        )
      } else {
        // Optional + empty: drop the token so it doesn't leak into the PDF.
        pdfContent = pdfContent.replace(SIGN_TOKEN_RE, '')
      }
    }

    if (notSigned) {
      toast.error('Document cannot be saved without signature!', { duration: 10000 })
      return
    }

    try {
      setSaving(true)
      const agreement = await putSecure(SECURE_ENDPOINTS.CUSTOMER_AGREEMENTS, {
        id: agreementId,
        content: pdfContent,
      })
      onAgreementUpdated(agreement)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to save agreement', { duration: 10000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b">
          <span className="text-xl font-semibold">Contact Agreement</span>
        </div>

        <div className="px-6 py-4">
          {tokens.map((token, i) => (
            <div key={i} className="mb-6">
              {/* Content segment that precedes this signature line */}
              <div dangerouslySetInnerHTML={{ __html: segments[i] ?? '' }} />
              <div className="flex justify-center">
                <div className="border-4 border-[#43464b] inline-block">
                  <SignaturePad
                    ref={el => { padRefs.current[i] = el }}
                    width={padWidth}
                    height={200}
                  />
                  <div className="flex gap-2 p-1">
                    <button
                      type="button"
                      onClick={() => padRefs.current[i]?.clear()}
                      className="text-xs px-2 py-1 border rounded"
                      aria-label={`Clear signature ${i + 1}`}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => padRefs.current[i]?.undo()}
                      className="text-xs px-2 py-1 border rounded"
                      aria-label={`Undo signature ${i + 1}`}
                    >
                      Undo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Any trailing content after the last signature token */}
          {segments.length > tokens.length && (
            <div dangerouslySetInnerHTML={{ __html: segments[segments.length - 1] ?? '' }} />
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-blue-700" aria-label="Close agreement dialog">
            Close
          </button>
          <button type="button" onClick={saveContract} disabled={saving} className="px-4 py-2 text-blue-700 font-semibold disabled:opacity-50" aria-label="Save agreement">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
