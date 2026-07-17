'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { File as FileIcon, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'
import { QuillEditor, type QuillEditorHandle } from '@/components/QuillEditor'
import { ImageSelector } from '@/components/ImageSelector'
import { buildMediaUrl } from '@/lib/utils/media'
import { checkContentHttp } from '@/lib/utils/pageUtils'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { uploadFile } from '@/lib/utils/quillHelpers'
import { isRequired, max, validateField } from '@/hooks/useValidation'
import type { Blog } from '@/types/api'

// Nuxt AMAZONAWS_FILE_URL — where blog attachments are served from.
const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL ?? ''

/** A file on the blog: either an existing saved attachment or one the admin just picked. */
type BlogFile = File | { file_path: string }

const isNewFile = (f: BlogFile): f is File => f instanceof File

function getFileName(item: BlogFile): string {
  if (isNewFile(item)) return item.name
  return item?.file_path || 'Unknown file'
}

interface Props {
  popup: boolean
  toggleEditPopup: () => void
  /** null = "Add Blog", a blog = "Edit Blog". */
  blog: Blog | null
}

/**
 * Add/Edit Blog dialog — ports Nuxt components/blog/BlogAddEdit.vue.
 *
 * The outer component only handles mounting: the inner form seeds all of its state
 * from `blog` in useState initializers rather than a `watch`/useEffect, and is keyed
 * by blog id so switching blogs remounts it. That matters because QuillEditor reads
 * `content` once, inside an async init — populating it from an effect races the
 * dynamic `import('quill')` and loses (the editor would open blank on Edit).
 */
export function BlogAddEdit({ popup, toggleEditPopup, blog }: Props) {
  if (!popup) return null
  return <BlogAddEditForm key={blog?.id ?? 'new'} blog={blog} toggleEditPopup={toggleEditPopup} />
}

function BlogAddEditForm({ blog, toggleEditPopup }: Omit<Props, 'popup'>) {
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const { postSecure, putSecure } = useSecureCalls()
  const { adminAddMedia, fetchMediaByOrganization } = useAdminMediaCrud()

  const id = blog?.id ?? null
  const [title, setTitle] = useState(blog?.title ?? '')
  const [slug] = useState(blog?.slug ?? '')
  const [content, setContent] = useState(blog?.content ?? '')
  const [seoHeadline, setSeoHeadline] = useState(blog?.seo_headline ?? '')
  const [seoDescription, setSeoDescription] = useState(blog?.seo_description ?? '')
  const [media, setMedia] = useState<string | null>(blog?.media?.uuid ?? null)
  const [uploadedFiles, setUploadedFiles] = useState<BlogFile[]>(() => blog?.blog_files ?? [])

  const [medias, setMedias] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const quillRef = useRef<QuillEditorHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetchMediaByOrganization()
      setMedias((response as any[]) ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load media', {
        duration: 15000,
      })
    }
  }, [fetchMediaByOrganization])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  /**
   * Toolbar image button — ports the `quill-image-uploader` module Nuxt registers.
   * The image is uploaded to the media bucket and the returned URL is embedded, so
   * the saved content never carries base64 (which the save path rejects below).
   */
  const modules = useMemo(() => {
    const imageHandler = () => {
      const quill = quillRef.current?.getQuill()
      if (!quill || !organization?.id) return

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        const range = quill.getSelection(true)
        const index = range?.index ?? quill.getLength()
        try {
          const url = await uploadFile(file, organization.id)
          quill.insertEmbed(index, 'image', url)
          quill.setSelection(index + 1)
        } catch {
          toast.error('Image upload failed. Please try again.', { duration: 10000 })
        }
      }
      input.click()
    }

    return {
      // vue-quill's toolbar="full", which is what the Nuxt editor uses.
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ['clean'],
          ['link', 'image', 'video'],
        ],
        handlers: { image: imageHandler },
      },
    }
  }, [organization?.id])

  const selectedMedia = useMemo(
    () => medias.find(m => m.uuid === media) ?? null,
    [medias, media],
  )

  const validate = () => {
    const next = {
      title: validateField(title, [isRequired]),
      seo_headline: validateField(seoHeadline, [max(60)]),
      seo_description: validateField(seoDescription, [max(160)]),
    }
    setErrors(next)
    return Object.values(next).every(e => e === null)
  }

  /** Only newly picked Files get uploaded; already-saved ones keep their file_path. */
  const arrangeMutation = () => {
    const files = uploadedFiles.filter(isNewFile)
    const mediaDetails: Record<string, { name: string }> = {}
    files.forEach(file => { mediaDetails[file.name] = { name: file.name } })
    return { files, mediaDetails }
  }

  const uploadNewFiles = async (): Promise<Array<{ file_path: string }>> => {
    const mutation = arrangeMutation()
    if (!mutation.files.length) return []
    const mediaResp: any = await adminAddMedia(mutation)
    const uuidList: string[] = mediaResp?.uuid_list ?? []
    return uuidList.map(uid => ({ file_path: `${FILE_URL}/${uid}` }))
  }

  /** Shared guards — Nuxt runs these identically in create() and update(). */
  const contentIsSaveable = () => {
    if (checkContentHttp(content)) {
      toast.error('Content contains non secure http:// link')
      return false
    }
    if (content && checkBase64(content)) {
      // Marks the offending images in the editor and toasts; admin must re-upload them.
      setContent(highlightBase64Images(content))
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!contentIsSaveable()) return

    // Nuxt validates *after* uploading files in update() (but before in create()) —
    // validating first in both keeps a failed save from orphaning uploaded media.
    if (!validate()) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        content,
        title,
        media,
        seo_headline: seoHeadline,
        seo_description: seoDescription,
      }

      const newPaths = await uploadNewFiles()

      if (id) {
        payload.id = id
        // Keep the already-saved attachments, append the newly uploaded ones.
        payload.blog_files = [...newPaths, ...uploadedFiles.filter(f => !isNewFile(f))]
        await putSecure(SECURE_ENDPOINTS.BLOG, payload)
        toast.success('Blog updated successfully', { duration: 15000 })
      } else {
        payload.location = location?.id
        if (newPaths.length) payload.blog_files = newPaths
        await postSecure(SECURE_ENDPOINTS.BLOG, payload)
        toast.success('Blog created successfully', { duration: 15000 })
      }
      toggleEditPopup()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${id ? 'update' : 'create'} blog`,
        { duration: 15000 },
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) setUploadedFiles(prev => [...prev, ...files])
    // Reset so picking the same file twice still fires onChange (Nuxt bumps fileInputKey).
    e.target.value = ''
  }

  /**
   * Nuxt splices only the *display* list here, leaving the removed file in the payload,
   * so removal never actually saved. One list means remove means remove.
   */
  const removeFile: (index: number) => void = (index) => {
    setUploadedFiles(prev => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const fieldClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm'
  const labelClass = 'block text-sm font-medium mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded w-full max-w-[1000px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={toggleEditPopup}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-black"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Add'} Blog</h2>

          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={fieldClass}
                required
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Slug is backend-generated — shown read-only on edit, absent on create. */}
            {slug && (
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  value={slug}
                  disabled
                  className={`${fieldClass} bg-gray-100 text-gray-500`}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Seo Headline</label>
              <input
                type="text"
                name="seo_headline"
                value={seoHeadline}
                onChange={e => setSeoHeadline(e.target.value)}
                className={fieldClass}
              />
              {errors.seo_headline && (
                <p className="mt-1 text-xs text-red-600">{errors.seo_headline}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Seo Description</label>
              <input
                type="text"
                name="seo_description"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                className={fieldClass}
              />
              {errors.seo_description && (
                <p className="mt-1 text-xs text-red-600">{errors.seo_description}</p>
              )}
            </div>

            <div>
              <QuillEditor
                ref={quillRef}
                content={content}
                theme="snow"
                toolbar="full"
                contentType="html"
                modules={modules}
                {...{ 'onUpdate:content': (html: string) => setContent(html) }}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Upload Files</h3>
                <ul>
                  {uploadedFiles.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 py-1">
                      <FileIcon size={18} className="text-gray-500 shrink-0" />
                      {isNewFile(item) ? (
                        <span className="text-sm truncate">{getFileName(item)}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => window.open(item.file_path, '_blank')}
                          className="text-sm text-blue-600 hover:underline truncate text-left"
                        >
                          {getFileName(item)}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-auto text-red-600 shrink-0"
                        aria-label={`Remove file ${getFileName(item)}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className={labelClass}>upload File</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm`}
              />
            </div>

            {/* Read-only preview of the media chosen below — mirrors Nuxt's disabled v-select. */}
            {selectedMedia && (
              <div>
                <label className={labelClass}>Select media</label>
                {selectedMedia.extension === 'mp4' ? (
                  <video
                    src={`${buildMediaUrl(selectedMedia, 700)}#t=2`}
                    height={100}
                    width={100}
                    className="h-[100px] w-[100px] object-cover"
                    aria-label={selectedMedia.name || 'Selected media video'}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={buildMediaUrl(selectedMedia, 700)}
                    alt={selectedMedia.name || 'Selected media image'}
                    className="h-[100px] w-[100px] object-cover"
                  />
                )}
              </div>
            )}

            <ImageSelector
              medias={medias}
              preSelected={media ?? undefined}
              onImageSelected={(uuid: string) => setMedia(uuid)}
              refreshMedia={fetchMedia}
              isUploader
            />

            <div className="border-t border-gray-200 my-3" />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#0c3cac] text-white rounded text-sm disabled:opacity-60"
                aria-label={id ? 'Update blog' : 'Create blog'}
              >
                {loading ? 'Saving…' : id ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={toggleEditPopup}
                className="px-4 py-2 bg-[#d90000] text-white rounded text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
