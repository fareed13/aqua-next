'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Tag, Image as ImageIcon, Video, X, ArrowLeft, Upload, Cloud } from 'lucide-react'
import { buildMediaUrl } from '@/lib/utils/media'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'

interface MediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
  topics?: Array<{ name: string }>
  is_global?: boolean
}

interface Props {
  medias: MediaItem[]
  onImageSelected: (uuid: string) => void
  preSelected?: string
  buttonText?: string
  isUploader?: boolean
  refreshMedia?: () => Promise<void>
}

const STOCK_OPTIONS = [
  { text: 'All', value: null },
  { text: 'My Images', value: false },
  { text: 'Stock Images', value: true },
]

export function ImageSelector({ medias, onImageSelected, preSelected, buttonText = 'Select Image', isUploader = false, refreshMedia }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'list' | 'upload'>('list')
  const [searchKw, setSearchKw] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [stockFilter, setStockFilter] = useState<boolean | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<string | undefined>(preSelected)
  const [overlay, setOverlay] = useState(false)
  const [uploadPage, setUploadPage] = useState(1)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadName, setUploadName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const { adminAddMedia } = useAdminMediaCrud()

  const topics = useMemo(() => {
    const names = new Set<string>()
    medias.forEach((m) => m.topics?.forEach((t) => names.add(t.name)))
    return Array.from(names).map((n) => ({ name: n }))
  }, [medias])

  const showableMedia = useMemo(() => {
    return medias.filter((m) => {
      const matchesSearch = !searchKw || m.name.toLowerCase().includes(searchKw.toLowerCase())
      const matchesTopic = !selectedTopics.length || selectedTopics.some((t) => m.topics?.some((mt) => mt.name === t))
      const matchesStock = stockFilter === null || m.is_global === stockFilter
      return matchesSearch && matchesTopic && matchesStock
    })
  }, [medias, searchKw, selectedTopics, stockFilter])

  const handleSelect = (media: MediaItem) => {
    setSelectedMedia(media.uuid)
    onImageSelected(media.uuid)
    setOpen(false)
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files) return
    setUploadFiles(Array.from(files))
    if (!uploadName) setUploadName(files[0]?.name ?? '')
    setUploadPage(2)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files)
  }

  const handleUpload = async (isGlobal: boolean) => {
    if (!uploadFiles.length) return
    setOverlay(true)
    try {
      const mediaDetails: Record<string, { name: string }> = {}
      uploadFiles.forEach((f) => { mediaDetails[f.name] = { name: uploadName || f.name } })
      await adminAddMedia({ files: uploadFiles, mediaDetails }, isGlobal)
      await refreshMedia?.()
      setUploadPage(1)
      setUploadFiles([])
      setUploadName('')
      setTab('list')
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setOverlay(false)
    }
  }

  const getMediaUrl = (media: MediaItem) => {
    const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    return `${MEDIA_URL}/${media.uuid}_350.${media.extension}`
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            {overlay && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div className="w-12 h-12 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Tabs */}
            <div className="border-b flex">
              <button
                onClick={() => setTab('list')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'list' ? 'border-[#124e66] text-[#124e66]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Images
              </button>
              {isUploader && (
                <button
                  onClick={() => setTab('upload')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'upload' ? 'border-[#124e66] text-[#124e66]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Upload
                </button>
              )}
              <button onClick={() => setOpen(false)} className="ml-auto px-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* List tab */}
            {tab === 'list' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b space-y-3">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        className="w-full border rounded pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Search Name"
                        value={searchKw}
                        onChange={(e) => setSearchKw(e.target.value)}
                      />
                    </div>
                    <select
                      className="border rounded px-3 py-2 text-sm outline-none"
                      value={selectedTopics[0] ?? ''}
                      onChange={(e) => setSelectedTopics(e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">All Tags</option>
                      {topics.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    {STOCK_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setStockFilter(opt.value)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${stockFilter === opt.value ? 'bg-[#124e66] text-white border-[#124e66]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {showableMedia.map((media) => (
                      <div
                        key={media.uuid}
                        onClick={() => handleSelect(media)}
                        className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all aspect-square ${selectedMedia === media.uuid ? 'border-[#124e66] ring-2 ring-[#124e66]/30' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 z-10 px-2 py-1 flex items-center gap-1">
                          {media.extension === 'mp4' ? <Video size={12} className="text-white flex-shrink-0" /> : <ImageIcon size={12} className="text-white flex-shrink-0" />}
                          <span className="text-white text-xs truncate">{media.name}</span>
                        </div>
                        {media.extension === 'mp4' ? (
                          <video src={getMediaUrl(media)} className="w-full h-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getMediaUrl(media)} alt={media.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload tab */}
            {tab === 'upload' && (
              <div className="flex-1 overflow-y-auto p-8 text-center">
                {uploadPage > 1 && (
                  <button onClick={() => setUploadPage(1)} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
                    <ArrowLeft size={18} />
                  </button>
                )}

                {uploadPage === 1 && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 transition-colors ${isDragging ? 'border-[#124e66] bg-blue-50' : 'border-gray-300'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto mb-4 text-gray-400" size={40} />
                    <p className="text-gray-600 mb-4">Drag and drop files here or choose an option</p>
                    <div className="flex justify-center gap-6 flex-wrap">
                      <label className="cursor-pointer flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 border-gray-200 hover:border-[#124e66] hover:shadow-md transition-all">
                        <Cloud size={28} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Upload to Global Stock</span>
                        <input type="file" className="hidden" accept="image/*,video/mp4" multiple onChange={(e) => { setUploadPage(3); handleFileChange(e.target.files) }} />
                      </label>
                      <label className="cursor-pointer flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 border-gray-200 hover:border-[#124e66] hover:shadow-md transition-all">
                        <Upload size={28} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Upload to My Images</span>
                        <input type="file" className="hidden" accept="image/*,video/mp4" multiple onChange={(e) => { setUploadPage(2); handleFileChange(e.target.files) }} />
                      </label>
                    </div>
                  </div>
                )}

                {uploadPage === 2 && (
                  <div className="space-y-4">
                    <p className="text-gray-700 font-medium">{uploadFiles.length} file(s) selected</p>
                    <input
                      className="border rounded px-3 py-2 text-sm w-full max-w-sm outline-none focus:ring-2 focus:ring-sky-300"
                      placeholder="Media name"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                    />
                    <button
                      onClick={() => handleUpload(false)}
                      disabled={overlay}
                      className="px-6 py-2 bg-[#124e66] text-white rounded hover:bg-[#0e3d52] disabled:opacity-60 transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                )}

                {uploadPage === 3 && (
                  <div className="space-y-4">
                    <p className="text-gray-700 font-medium">{uploadFiles.length} file(s) selected (Global Stock)</p>
                    <input
                      className="border rounded px-3 py-2 text-sm w-full max-w-sm outline-none focus:ring-2 focus:ring-sky-300"
                      placeholder="Media name"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                    />
                    <button
                      onClick={() => handleUpload(true)}
                      disabled={overlay}
                      className="px-6 py-2 bg-[#124e66] text-white rounded hover:bg-[#0e3d52] disabled:opacity-60 transition-colors"
                    >
                      Upload to Global Stock
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
