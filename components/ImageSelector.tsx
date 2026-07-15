'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Tag, Image as ImageIcon, Video, X, ArrowLeft, ArrowRight, Upload, Cloud, Folder, ChevronDown, HardDrive } from 'lucide-react'
import { toast } from 'sonner'
import { buildMediaUrl } from '@/lib/utils/media'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'
import { useAdminService } from '@/hooks/admin/useAdminService'

// ABBI global stock org id (mirrors Nuxt's `organization === 3` check)
const GLOBAL_ORG_ID = Number(process.env.NEXT_PUBLIC_ABBI_DEFAULT_ORGANIZATION_ID ?? 3)

interface MediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
  // Backend returns topic names as plain strings; tolerate {name} objects too.
  topics?: Array<string | { name: string }>
  organization?: number
  is_global?: boolean
}

/** Topic values may arrive as strings or {name} objects — normalize to the name. */
function topicName(t: string | { name: string }): string {
  return typeof t === 'string' ? t : t?.name
}

interface BaseProps {
  medias: MediaItem[]
  buttonText?: string
  isUploader?: boolean
  refreshMedia?: () => Promise<void>
}

/** Single mode receives one uuid; multi mode (isMulti) receives a uuid array. */
type Props = BaseProps & (
  | { isMulti: true; onImageSelected: (uuids: string[]) => void; preSelected?: string[] }
  | { isMulti?: false; onImageSelected: (uuid: string) => void; preSelected?: string }
)

// Matches Nuxt stockFilterOptions labels + semantics.
const STOCK_OPTIONS: Array<{ text: string; value: 'all' | 'uploads' | 'stock' }> = [
  { text: 'All', value: 'all' },
  { text: 'Uploads', value: 'uploads' },
  { text: 'ABBI Stock Images', value: 'stock' },
]

/**
 * Multi-select tag filter — the dropdown lists tags with checkboxes and toggles
 * on click (no Done/Cancel), matching Nuxt's `v-select multiple chips`.
 */
function TagMultiSelect({
  topics,
  selected,
  onChange,
}: {
  topics: Array<{ name: string }>
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(t => t !== name) : [...selected, name])
  }

  return (
    <div className="relative flex-1" ref={ref}>
      <div
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[42px] border border-gray-300 rounded pl-9 pr-8 py-1.5 text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1"
      >
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        {selected.length === 0 && <span className="text-gray-400 py-1">Tag</span>}
        {selected.map(name => (
          <span key={name} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(name) }}
              className="text-gray-500 hover:text-gray-800"
              aria-label={`Remove ${name}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg py-1">
          {topics.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No tags</div>
          ) : (
            topics.map(t => {
              const checked = selected.includes(t.name)
              return (
                <label key={t.name} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(t.name)}
                    className="accent-[#124e66]"
                  />
                  <span className="truncate">{t.name}</span>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE_OPTIONS = [8, 12, 16]

export function ImageSelector({ medias, onImageSelected, preSelected, buttonText = 'Select Image', isUploader = false, isMulti = false, refreshMedia }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'list' | 'upload'>('list')
  const [searchKw, setSearchKw] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [stockFilter, setStockFilter] = useState<'all' | 'uploads' | 'stock'>('all')
  const [selectedMedia, setSelectedMedia] = useState<string | undefined>(
    Array.isArray(preSelected) ? undefined : preSelected,
  )
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>(
    Array.isArray(preSelected) ? preSelected : [],
  )
  const [overlay, setOverlay] = useState(false)
  // Upload wizard (mirrors Nuxt uploadPageNo): 1 = pick global/local,
  // 2 = drag-drop + Choose File dropdown, 3 = per-file name/tags/bg details.
  const [uploadPage, setUploadPage] = useState(1)
  const [uploadIsGlobal, setUploadIsGlobal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [fileDetails, setFileDetails] = useState<Array<{ name: string; topics: string[]; background_image: boolean }>>([])
  const [chooseMenuOpen, setChooseMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { adminAddMedia } = useAdminMediaCrud()
  const { topics: serviceTopics, fetchTopics } = useAdminService()

  // Load tag options from the service-topic API when the dialog opens (Nuxt does
  // this in onMounted). Media items only carry topic *names*, so deriving the
  // option list from them isn't reliable.
  useEffect(() => {
    if (open) fetchTopics()
  }, [open, fetchTopics])

  const topics = useMemo(
    () =>
      (serviceTopics as Array<{ name?: string } | string>)
        .map((t) => (typeof t === 'string' ? t : t?.name))
        .filter((n): n is string => !!n)
        .map((name) => ({ name })),
    [serviceTopics],
  )

  const showableMedia = useMemo(() => {
    return medias.filter((m) => {
      const matchesSearch = !searchKw || m.name.toLowerCase().includes(searchKw.toLowerCase())
      const matchesTopic =
        !selectedTopics.length ||
        selectedTopics.some((st) => m.topics?.some((mt) => topicName(mt) === st))
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'uploads' && m.organization !== GLOBAL_ORG_ID) ||
        (stockFilter === 'stock' && m.organization === GLOBAL_ORG_ID)
      return matchesSearch && matchesTopic && matchesStock
    })
  }, [medias, searchKw, selectedTopics, stockFilter])

  // Pagination — matches Nuxt ImageSelector (page size 8/12/16, editable page input)
  const [pageSize, setPageSize] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(showableMedia.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchKw, selectedTopics, stockFilter])

  const paginatedMedia = useMemo(
    () => showableMedia.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [showableMedia, currentPage, pageSize],
  )

  const prevPage = () => setCurrentPage(p => (p > 1 ? p - 1 : p))
  const nextPage = () => setCurrentPage(p => (p < totalPages ? p + 1 : 1))

  const handleSelect = (media: MediaItem) => {
    if (isMulti) {
      setSelectedMultiple(prev =>
        prev.includes(media.uuid) ? prev.filter(u => u !== media.uuid) : [...prev, media.uuid],
      )
      return
    }
    // Single mode: highlight only — apply on Done (matches Nuxt).
    setSelectedMedia(prev => (prev === media.uuid ? '' : media.uuid))
  }

  // Close the dialog and clear all filters/wizard state so it opens fresh.
  const closeDialog = () => {
    setOpen(false)
    setTab('list')
    setSearchKw('')
    setSelectedTopics([])
    setStockFilter('all')
    setCurrentPage(1)
    resetUpload()
  }

  // Done — apply the current selection and close.
  const confirmSelection = () => {
    if (isMulti) {
      ;(onImageSelected as (uuids: string[]) => void)(selectedMultiple)
    } else {
      if (!selectedMedia) return
      ;(onImageSelected as (uuid: string) => void)(selectedMedia)
    }
    closeDialog()
  }

  const isSelected = (uuid: string) =>
    isMulti ? selectedMultiple.includes(uuid) : selectedMedia === uuid

  // --- Upload wizard handlers (ported from Nuxt) ---

  const resetUpload = () => {
    setUploadPage(1)
    setUploadIsGlobal(false)
    setUploadFiles([])
    setFileDetails([])
    setChooseMenuOpen(false)
  }

  // Page 1 → 2: choose destination (global ABBI stock vs this website only)
  const goUpload = (isGlobal: boolean) => {
    setUploadIsGlobal(isGlobal)
    setUploadPage(2)
  }

  // Accept files (from device or drag/drop) → page 3
  const acceptFiles = (list: FileList | File[] | null) => {
    const arr = list ? Array.from(list) : []
    if (!arr.length) return
    const invalid = arr.some(f => ['svg', 'ico'].includes(f.name.toLowerCase().split('.').pop() ?? ''))
    if (invalid) {
      toast.error('SVG and icon files are not allowed. Please select other image formats.')
      return
    }
    setUploadFiles(arr)
    setFileDetails(arr.map(f => ({ name: f.name, topics: [], background_image: false })))
    setChooseMenuOpen(false)
    setUploadPage(3)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploadFiles.length) return
    acceptFiles(e.dataTransfer.files)
  }

  const backUpload = () => {
    if (uploadPage < 2) return
    setUploadPage(p => p - 1)
    setUploadFiles([])
    setFileDetails([])
    if (uploadPage === 2) setUploadIsGlobal(false)
  }

  const removeUploadFile = (index: number) => {
    const nextFiles = uploadFiles.filter((_, i) => i !== index)
    const nextDetails = fileDetails.filter((_, i) => i !== index)
    setUploadFiles(nextFiles)
    setFileDetails(nextDetails)
    if (!nextFiles.length) setUploadPage(2)
  }

  const setDetail = (index: number, patch: Partial<{ name: string; topics: string[]; background_image: boolean }>) => {
    setFileDetails(prev => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  const driveClickHandler = () => {
    setChooseMenuOpen(false)
    // Google Drive picker requires the gapi/Google Identity OAuth flow, which is
    // not yet wired in this app. Surface it instead of silently doing nothing.
    toast('Google Drive import is not available yet — please upload from your device.')
  }

  // Page 3 "Done": upload files with their per-file details, then select them.
  const saveMedia = async () => {
    if (!uploadFiles.length) return
    setOverlay(true)
    try {
      const mediaDetails: Record<string, unknown> = {}
      uploadFiles.forEach((f, i) => {
        const d = fileDetails[i]
        mediaDetails[f.name] = {
          name: d?.name || f.name,
          topics: d?.topics ?? [],
          background_image: d?.background_image ?? false,
        }
      })
      const data: any = await adminAddMedia({ files: uploadFiles, mediaDetails }, uploadIsGlobal)
      const newIds: string[] = data?.uuid_list ?? []
      await refreshMedia?.()

      if (isMulti && newIds.length) {
        setSelectedMultiple(prev => Array.from(new Set([...prev, ...newIds])))
      } else if (!isMulti && newIds[0]) {
        setSelectedMedia(newIds[0])
      }
      resetUpload()
      setTab('list')
    } catch (e) {
      console.error('Upload failed', e)
      toast.error('Upload failed. Please try again.')
    } finally {
      setOverlay(false)
    }
  }

  // Ported from Nuxt useMediaGallery.getImagePreviewUrl: uuid may already
  // contain the extension (e.g. "abc.jpg"), so strip it before adding _350.
  const getMediaUrl = (media: MediaItem) => {
    const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL
    const isPwaIconWithoutExtension = media.uuid.startsWith('pwa_icon')

    let name: string
    if (isPwaIconWithoutExtension) {
      name = media.uuid
    } else if (media.uuid.includes('.')) {
      name = `${media.uuid.split('.')[0]}_350`
    } else {
      name = `${media.uuid}_350`
    }

    if (media.extension === 'mp4') {
      return `${VIDEO_URL}/${name}.${media.extension}#t=2`
    }
    const imagePath = isPwaIconWithoutExtension ? name : `${name}.${media.extension}`
    return `${MEDIA_URL}/${imagePath}`
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#124e66] text-white rounded text-sm hover:bg-[#0e3d52] transition-colors mr-2"
      >
        {buttonText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
          <div className="absolute inset-0 bg-black/50" onClick={closeDialog} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            {overlay && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div className="w-12 h-12 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Tabs — Images / Upload each take 50% width (Nuxt v-tabs grow) */}
            <div className="border-b border-gray-200 flex items-stretch relative">
              <button
                onClick={() => setTab('list')}
                className={`relative flex-1 py-4 text-base font-medium uppercase tracking-wide transition-colors ${tab === 'list' ? 'text-[#124e66]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Images
                {tab === 'list' && (
                  <span className="absolute left-0 -bottom-px h-1 w-full bg-[#124e66]" />
                )}
              </button>
              {isUploader && (
                <button
                  onClick={() => setTab('upload')}
                  className={`relative flex-1 py-4 text-base font-medium uppercase tracking-wide transition-colors ${tab === 'upload' ? 'text-[#124e66]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Upload
                  {tab === 'upload' && (
                    <span className="absolute left-0 -bottom-px h-1 w-full bg-[#124e66]" />
                  )}
                </button>
              )}
              <button onClick={closeDialog} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* List tab */}
            {tab === 'list' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Search Name"
                        value={searchKw}
                        onChange={(e) => setSearchKw(e.target.value)}
                      />
                    </div>
                    <TagMultiSelect
                      topics={topics}
                      selected={selectedTopics}
                      onChange={setSelectedTopics}
                    />
                  </div>
                  {/* Stock filter chips — centered on their own row (Nuxt v-chip-group justify=center) */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {STOCK_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStockFilter(opt.value)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${stockFilter === opt.value ? 'bg-[#124e66] text-white border-[#124e66]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {paginatedMedia.map((media) => (
                      <div
                        key={media.uuid}
                        onClick={() => handleSelect(media)}
                        className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all aspect-square ${isSelected(media.uuid) ? 'border-red-600 ring-2 ring-red-500/40' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 z-10 px-2 py-1 flex items-center gap-1">
                          {media.extension === 'mp4' ? <Video size={12} className="text-white flex-shrink-0" /> : <ImageIcon size={12} className="text-white flex-shrink-0" />}
                          <span className="text-white text-xs truncate">{media.name}</span>
                        </div>
                        {media.extension === 'mp4' ? (
                          <video src={getMediaUrl(media)} className="w-full h-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getMediaUrl(media)} alt={media.name || 'Media preview'} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t p-3 flex flex-wrap items-center gap-3">
                  <select
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    aria-label="Page size"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size} per page</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={prevPage} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Previous page">
                      <ArrowLeft size={20} />
                    </button>
                    <input
                      type="text"
                      value={currentPage}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v)
                      }}
                      className="border border-gray-400 rounded w-10 text-center text-sm py-1 outline-none"
                      aria-label="Current page"
                    />
                    <span className="mx-1 text-sm text-gray-600">of</span>
                    <span className="text-sm text-gray-600">{totalPages}</span>
                    <button type="button" onClick={nextPage} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Next page">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    {isMulti && (
                      <span className="text-xs text-gray-500">{selectedMultiple.length} selected</span>
                    )}
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="px-5 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmSelection}
                      disabled={isMulti ? selectedMultiple.length === 0 : !selectedMedia}
                      className="px-5 py-2 bg-[#124e66] text-white rounded text-sm hover:bg-[#0e3d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload tab — 3-step wizard mirroring Nuxt */}
            {tab === 'upload' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 text-center">
                  {uploadPage > 1 && (
                    <div className="flex justify-start">
                      <button onClick={backUpload} className="p-1 text-gray-600 hover:text-gray-900 mb-4" aria-label="Go back">
                        <ArrowLeft size={26} />
                      </button>
                    </div>
                  )}

                  {/* Page 1: choose destination */}
                  {uploadPage === 1 && (
                    <div>
                      <div className="flex justify-center items-center mb-8 flex-wrap gap-10">
                        <button
                          type="button"
                          onClick={() => goUpload(true)}
                          className="flex flex-col items-center justify-around my-3 rounded-md shadow-[0_4px_8px_0_rgba(0,0,0,0.2),0_6px_20px_0_rgba(0,0,0,0.19)] hover:shadow-lg transition-shadow p-4"
                          style={{ height: '12rem', width: '12rem' }}
                        >
                          <Cloud size={30} className="text-gray-600" />
                          <span className="text-sm font-medium">Upload to Global ABBI Stock Images*</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => goUpload(false)}
                          className="flex flex-col items-center justify-around my-3 rounded-md shadow-[0_4px_8px_0_rgba(0,0,0,0.2),0_6px_20px_0_rgba(0,0,0,0.19)] hover:shadow-lg transition-shadow p-4"
                          style={{ height: '12rem', width: '12rem' }}
                        >
                          <Upload size={30} className="text-gray-600" />
                          <span className="text-sm font-medium">Upload for this website only</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">*These Images will be available across all ABBI platforms</span>
                    </div>
                  )}

                  {/* Page 2: drag-drop + Choose File dropdown */}
                  {uploadPage === 2 && (
                    <div
                      className={`flex flex-col items-center justify-center mb-10 rounded-lg py-16 transition-colors ${isDragging ? 'bg-blue-50 outline-dashed outline-2 outline-[#124e66]' : ''}`}
                      onDragOver={(e) => { e.preventDefault() }}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      <p className="mb-5 text-gray-700">{isDragging ? 'Drop the files here ...' : 'Drag and drop files here'}</p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setChooseMenuOpen(o => !o)}
                          className="inline-flex items-center gap-2 border border-gray-400 rounded px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                        >
                          Choose File
                          <ChevronDown size={18} className={`transition-transform ${chooseMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {chooseMenuOpen && (
                          <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg py-1 z-20">
                            <label className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer">
                              <Folder size={18} className="text-gray-600" />
                              From Device
                              <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => acceptFiles(e.target.files)}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={driveClickHandler}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
                            >
                              <HardDrive size={18} className="text-gray-600" />
                              From Google Drive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Page 3: per-file details */}
                  {uploadPage === 3 && (
                    <div className="space-y-6 text-left">
                      {uploadFiles.map((file, i) => {
                        const preview = URL.createObjectURL(file)
                        const isVideo = file.type.includes('video')
                        const detail = fileDetails[i]
                        return (
                          <div key={`${file.name}-${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start border-b border-gray-100 pb-6">
                            <div className="relative">
                              {isVideo ? (
                                <video src={preview} className="w-full h-auto object-cover rounded" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={preview} alt="Preview" className="w-full h-auto object-cover rounded" />
                              )}
                              <button
                                type="button"
                                onClick={() => removeUploadFile(i)}
                                className="absolute top-2 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-red-600 hover:text-red-700"
                                aria-label={`Remove ${detail?.name || 'image'}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                                  value={detail?.name ?? ''}
                                  onChange={(e) => setDetail(i, { name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <TagMultiSelect
                                  topics={topics}
                                  selected={detail?.topics ?? []}
                                  onChange={(next) => setDetail(i, { topics: next })}
                                />
                              </div>
                              <label className="flex items-center gap-3 cursor-pointer select-none">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={!!detail?.background_image}
                                  onClick={() => setDetail(i, { background_image: !detail?.background_image })}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${detail?.background_image ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${detail?.background_image ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-700">Background Image</span>
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Upload footer: Done (save) + Cancel */}
                <div className="border-t p-3 flex justify-end items-center gap-2">
                  {uploadPage === 3 && uploadFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={saveMedia}
                      disabled={overlay}
                      className="px-5 py-2 bg-[#124e66] text-white rounded text-sm hover:bg-[#0e3d52] disabled:opacity-60 transition-colors"
                    >
                      Done
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-5 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
