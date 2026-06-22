'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Trash2, X, LayoutDashboard } from 'lucide-react'
import { DeleteWarning } from './warnings/DeleteWarning'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { useAdminService } from '@/hooks/admin/useAdminService'

interface Section {
  component: string
  headline?: string
  subtitle?: string
  content?: string
  media?: any[]
  bullets?: any
  backgroundImage?: string
  backgroundColor?: string
  customBullets?: any
  url?: string
  interactiveVideo?: any
  plan?: number
  countOfPrograms?: number
  countOfReviews?: number
}

interface Props {
  popup: boolean
  updateData: (sections: Section[]) => void
  closePopup: () => void
  loading?: boolean
  page_id?: string | number | null
  service_id?: string | number | null
  location_id?: string | number | null
}

export function OrderingDraggable({ popup, updateData, closePopup, loading = false, page_id, service_id, location_id }: Props) {
  const [sections, setSections] = useState<Section[]>([])
  const [deletePopup, setDeletePopup] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { getSecure, secureEndpoint } = useSecureCalls()
  const { fetchServiceById } = useAdminService()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!popup) return
    const load = async () => {
      try {
        if (service_id) {
          const res = await fetchServiceById(service_id as number) as any[]
          if (res?.length) setSections(res[0].content ?? [])
        } else if (location_id) {
          const res = await getSecure(secureEndpoint.LOCATION, { id: Number(location_id) }) as any[]
          if (res?.length) setSections(res[0].content ?? [])
        } else if (page_id) {
          const res = await getSecure(secureEndpoint.PAGE, { id: Number(page_id) }) as any[]
          if (res?.length) setSections(res[0].content ?? [])
        }
      } catch (e) {
        console.error(e)
        closePopup()
      }
    }
    load()
  }, [popup])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const next = Array.from(sections)
    const [moved] = next.splice(result.source.index, 1)
    next.splice(result.destination.index, 0, moved)
    setSections(next)
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const next = sections.filter((_, i) => i !== deleteIndex)
    setSections(next)
    setDeletePopup(false)
    setDeleteIndex(null)
  }

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closePopup} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#124e66] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-white" size={24} />
            <div>
              <h2 className="text-white font-semibold text-lg leading-none">Rearrange/Delete Sections</h2>
              <p className="text-white/70 text-xs mt-0.5">Drag the sections to rearrange order</p>
            </div>
          </div>
          <button onClick={closePopup} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {sections.map((section, index) => (
                    <Draggable key={index} draggableId={String(index)} index={index}>
                      {(draggable) => (
                        <div
                          ref={draggable.innerRef}
                          {...draggable.draggableProps}
                          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all"
                        >
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div {...draggable.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                              <GripVertical size={18} />
                            </div>
                            <div className="flex-1 text-sm font-medium text-gray-700 truncate">
                              {section.component}
                            </div>
                            <button
                              onClick={() => { setDeleteIndex(index); setDeletePopup(true) }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end flex-shrink-0">
          <button
            onClick={() => updateData(sections)}
            disabled={loading}
            className="px-8 py-2 bg-[#124e66] text-white rounded-full hover:bg-[#0e3d52] disabled:opacity-60 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>

      <DeleteWarning
        popup={deletePopup}
        onConfirm={confirmDelete}
        onCancel={() => { setDeletePopup(false); setDeleteIndex(null) }}
        loading={false}
        message="Do you really want to remove this section?"
      />
    </div>
  )
}
