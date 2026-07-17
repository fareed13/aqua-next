'use client'

import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface ServiceRow {
  id: number
  name: string
  order?: number
}

interface Props {
  popup: boolean
  closePopup: () => void
}

/**
 * "Change Programs Order" dialog — ports Nuxt components/programBlocks/ReorderPrograms.vue.
 *
 * Note this is NOT the same job as OrderingDraggable: that one reorders the
 * *sections inside* a page/service/location and PUTs `{id, content}`. This one
 * reorders the *services themselves* and PUTs a bulk `[{id, order}]` array to
 * SERVICE_BULK, so the two can't share a save path.
 */
export function ReorderPrograms({ popup, closePopup }: Props) {
  const router = useRouter()
  const { getSecure, putSecure } = useSecureCalls()

  const [rows, setRows] = useState<ServiceRow[]>([])
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!popup) return
    let cancelled = false

    ;(async () => {
      setFetching(true)
      try {
        const data = await getSecure<ServiceRow[]>(SECURE_ENDPOINTS.GET_SERVICES)
        if (cancelled) return
        // Nuxt sorts by `order` when both sides have one.
        const sorted = [...(data ?? [])].sort((a, b) =>
          a.order && b.order ? a.order - b.order : 0,
        )
        setRows(sorted)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()

    return () => { cancelled = true }
  }, [popup, getSecure])

  if (!popup) return null

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const next = [...rows]
    const [moved] = next.splice(result.source.index, 1)
    next.splice(result.destination.index, 0, moved)
    setRows(next)
  }

  const updateDataReorder = async () => {
    setLoading(true)
    try {
      // Nuxt sends [{ id, order }] with order starting at 1.
      await putSecure(
        SECURE_ENDPOINTS.SERVICE_BULK,
        rows.map((s, i) => ({ id: s.id, order: i + 1 })),
      )
      toast.success('Programs Reordered Successfully', { duration: 5000 })
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      closePopup()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-end px-2 pt-2">
          <button type="button" onClick={closePopup} aria-label="Close" className="text-2xl leading-none px-2 text-gray-500">
            ×
          </button>
        </div>

        <div className="px-6 pb-2">
          <h2 className="text-xl font-bold">Rearrange Service Orders</h2>
          <p className="text-gray-500 text-sm">Drag the service to rearrange order</p>
        </div>
        <div className="border-t border-gray-200 mb-4" />

        {fetching ? (
          <div className="py-10 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="programs">
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {rows.map((service, index) => (
                      <Draggable key={service.id} draggableId={String(service.id)} index={index}>
                        {dragProvided => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="mb-2 bg-white border border-gray-200 shadow rounded px-4 py-3 flex items-center justify-between"
                          >
                            <p className="text-black m-0">{service.name}</p>
                            <span className="text-black text-xl leading-none">☰</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        <div className="border-t border-gray-200 mt-4" />
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={updateDataReorder}
            disabled={loading}
            className="bg-gray-900 text-white px-8 py-2 rounded-full font-semibold text-sm uppercase disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
