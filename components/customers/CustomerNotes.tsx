'use client'

import { useState, useEffect, useRef } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  [key: string]: unknown
}

interface Note {
  id: number
  content: string
  created_at: string
  [key: string]: unknown
}

interface CustomerNotesProps {
  contact: Contact
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = d.getHours()
    const mins = pad(d.getMinutes())
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h12 = pad(hours % 12 || 12)
    return `${year}-${month}-${day} ${h12}:${mins} ${ampm}`
  } catch {
    return dateStr
  }
}

export function CustomerNotes({ contact }: CustomerNotesProps) {
  const { getSecure, postSecure, putSecure, deleteSecure } = useSecureCalls()

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [content, setContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    const load = async () => {
      setOverlay(true)
      try {
        const res = await getSecure<any>(SECURE_ENDPOINTS.NOTES, { contact: contact.id })
        setNotes(Array.isArray(res) ? res : res?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setOverlay(false)
      }
    }
    load()
  }, [contact.id])

  const handleKeydown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await saveNote()
    }
  }

  const saveNote = async () => {
    if (!content.trim()) return
    setOverlay(true)
    const c = content
    setContent('')
    if (editMode && editId) {
      await updateNote(c)
      setEditMode(false)
      setEditId(null)
    } else {
      await createNote(c)
    }
    setOverlay(false)
  }

  const createNote = async (c: string) => {
    try {
      const response = await postSecure(SECURE_ENDPOINTS.NOTES, {
        content: c,
        created_at: new Date().toISOString(),
        customer: contact.id,
      }) as Note
      setNotes(prev => [response, ...prev])
    } catch (error) {
      console.error(error)
    }
  }

  const updateNote = async (c: string) => {
    if (!editId) return
    try {
      await putSecure(SECURE_ENDPOINTS.NOTES, {
        id: editId,
        content: c,
        customer: contact.id,
      })
      const res = await getSecure<any>(SECURE_ENDPOINTS.NOTES, { contact: contact.id })
      setNotes(Array.isArray(res) ? res : res?.results ?? [])
    } catch (error) {
      console.error(error)
    }
  }

  const editNote = (note: Note) => {
    window.scrollTo(0, 0)
    setEditId(note.id)
    setContent(note.content)
    setEditMode(true)
  }

  const delNote = async () => {
    if (!selectedNote) return
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.NOTES, selectedNote.id)
      setNotes(prev => prev.filter(n => n.id !== selectedNote.id))
      setDeletePopup(false)
      setSelectedNote(null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-6">
      {deletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <p className="mb-4 font-medium">Are you sure you want to delete this note?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeletePopup(false); setSelectedNote(null) }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={delNote} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="add-note">
        <h1 className="text-lg font-bold mb-5">Notes</h1>
        <textarea
          className="w-full border rounded px-3 py-2 bg-gray-50 resize-none"
          rows={3}
          placeholder="Text goes here..."
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeydown}
        />
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={saveNote}
            disabled={overlay}
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
          >
            {overlay ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update' : 'Add')}
          </button>
          <span className="text-sm text-gray-500">
            HINT: You can {editMode ? 'update' : 'save'} the note by pressing &quot;ENTER&quot;
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {notes.map(note => (
          <div key={note.id} className={`border rounded shadow-sm bg-white ${overlay ? 'opacity-50' : ''}`}>
            <div className="p-4 text-sm">{note.content}</div>
            <div className="flex items-center flex-wrap gap-2 px-4 pb-3 border-t pt-2">
              <button onClick={() => { setSelectedNote(note); setDeletePopup(true) }} className="bg-red-500 text-white text-xs px-3 py-1 rounded">Remove</button>
              <button onClick={() => editNote(note)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Edit</button>
              <span className="ml-auto text-xs text-gray-500">Added on: {formatDate(note.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
