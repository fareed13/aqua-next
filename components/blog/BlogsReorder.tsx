'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import type { Blog } from '@/types/api'

interface Props {
  popup: boolean
  closePopup: () => void
}

/**
 * "Rearrange Blogs Orders" dialog — ports Nuxt components/blog/BlogsReorder.vue.
 *
 * Like the Nuxt original this reads the blogs straight out of the store rather than
 * re-fetching (unlike ReorderPrograms, which GETs the service list first), because the
 * blogs already arrive on the location payload.
 */
export function BlogsReorder({ popup, closePopup }: Props) {
  const storeBlogs = useOrgStore(s => s.location?.blogs)
  const { putSecure } = useSecureCalls()

  // Seeded once per mount — the caller unmounts this dialog when it closes, so
  // reopening always re-reads the current store order.
  const [rows, setRows] = useState<Blog[]>(() => [...(storeBlogs ?? [])])
  const [loading, setLoading] = useState(false)

  if (!popup) return null

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const next = [...rows]
    const [moved] = next.splice(result.source.index, 1)
    next.splice(result.destination.index, 0, moved)
    setRows(next)
  }

  const updateData = async () => {
    setLoading(true)
    try {
      // Nuxt sends [{ id, order }] with order starting at 1.
      await putSecure(
        SECURE_ENDPOINTS.BLOGS_REORDER,
        rows.map((blog, i) => ({ id: blog.id, order: i + 1 })),
      )
      toast.success('Blogs Reordered Successfully', { duration: 5000 })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong please try again',
        { duration: 10000 },
      )
    } finally {
      setLoading(false)
      closePopup()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-end px-2 pt-2">
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close dialog"
            className="text-2xl leading-none px-2 text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-2">
          <h2 className="text-xl font-bold text-black">Rearrange Blogs Orders</h2>
          <p className="text-gray-500 text-sm">Drag the blogs to rearrange order</p>
        </div>
        <div className="border-t border-gray-200 mb-4" />

        <div className="px-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="blogs">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {rows.map((blog, index) => (
                    <Draggable key={blog.id} draggableId={String(blog.id)} index={index}>
                      {dragProvided => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className="mb-2 bg-white border border-gray-200 shadow rounded px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <p className="text-black m-0 truncate">{blog.title}</p>
                          <span className="text-black text-xl leading-none shrink-0">☰</span>
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

        <div className="border-t border-gray-200 mt-4" />
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={updateData}
            disabled={loading}
            className="bg-gray-900 text-white px-8 py-2 rounded-full font-semibold text-sm uppercase disabled:opacity-50"
            aria-label="Save blog order"
          >
            {loading ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
