'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Blog, Media } from '@/types/api'

// Admin-only, and heavy (quill / @hello-pangea/dnd / ImageSelector). A runtime
// isAdminLoggedIn() gate would still ship these to every visitor of /blog, so they
// must be dynamic — same pattern as EditableSections/ServiceDetail.
const BlogAddEdit = dynamic(() => import('./BlogAddEdit').then(m => m.BlogAddEdit), { ssr: false })
const BlogsReorder = dynamic(() => import('./BlogsReorder').then(m => m.BlogsReorder), { ssr: false })
const DeleteWarning = dynamic(
  () => import('@/components/warnings/DeleteWarning').then(m => m.DeleteWarning),
  { ssr: false },
)

// Inline MDI paths — importing an icon library here would land in the public chunk.
const MDI_PLUS = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z'
const MDI_SORT = 'M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z'
const MDI_TABLE_EDIT =
  'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z'
const MDI_DELETE = 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'

function MdiIcon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function truncateContent(content: string, wordLimit = 50): string {
  if (typeof content !== 'string') return ''
  const words = content.split(' ')
  if (words.length <= wordLimit) return content
  return words.slice(0, wordLimit).join(' ') + '...'
}

function getSlugValue(blog: Blog): string {
  return `${blog.slug}-${blog.id}`
}

function BlogMedia({ blog }: { blog: Blog }) {
  const org = useOrgStore(s => s.organization)

  const blogMedia = blog.media as Media | null

  if (blogMedia?.media_type === 'video') {
    return (
      <video
        className="w-full max-h-[200px] object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-label={blog.title || 'Blog video'}
      >
        <source
          src={blogMedia ? buildMediaUrl(blogMedia, 'small') : ''}
          type="video/mp4"
        />
      </video>
    )
  }

  const logoUrl = org?.primary_logo
    ? buildMediaUrl(org.primary_logo, 350)
    : ''
  const imgSrc = blogMedia
    ? buildMediaUrl(blogMedia)
    : logoUrl

  if (!imgSrc) return null

  return (
    <div className="relative w-full h-[200px]">
      <Image
        src={imgSrc}
        alt={blog.title || 'Blog image'}
        fill
        className="object-contain"
        sizes="(max-width: 640px) 95vw, 400px"
        loading="lazy"
      />
    </div>
  )
}

export function BlogList() {
  const location = useOrgStore(s => s.location)
  const { isAdminLoggedIn } = useAuth()
  const { deleteSecure } = useSecureCalls()

  // isAdminLoggedIn() reads document.cookie, so it is client-only: the server always
  // renders the logged-out tree. Gate on `mounted` or hydration fails for admins.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isAdmin = mounted && isAdminLoggedIn()

  // Local copy so a delete drops the card immediately (Nuxt does the same). The blogs
  // arrive on the statically-built org payload, so the list can't be re-fetched.
  const [blogs, setBlogs] = useState<Blog[]>(location?.blogs ?? [])
  useEffect(() => { setBlogs(location?.blogs ?? []) }, [location?.blogs])

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [editPopup, setEditPopup] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const [orderPopup, setOrderPopup] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openAdd = () => {
    setSelectedBlog(null)
    setEditPopup(true)
  }

  const openEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setEditPopup(true)
  }

  const openDelete = (blog: Blog) => {
    setSelectedBlog(blog)
    setDeletePopup(true)
  }

  const deleteBlog = async () => {
    if (!selectedBlog) return
    setDeleteLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.BLOG, selectedBlog.id)
      toast.success('Blog deleted successfully', { duration: 15000 })
      setBlogs(prev => prev.filter(b => b.id !== selectedBlog.id))
      setDeletePopup(false)
      setSelectedBlog(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog', {
        duration: 15000,
      })
      setDeletePopup(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!blogs.length && !isAdmin) {
    return (
      <div className="bg-[#f3f3f3] py-10">
        <p className="text-center text-gray-500">No blog posts yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f3f3f3] px-4 py-6">
      {isAdmin && (
        <>
          <BlogAddEdit
            popup={editPopup}
            blog={selectedBlog}
            toggleEditPopup={() => setEditPopup(false)}
          />
          {/* Nuxt only offers reordering when there is more than one blog to reorder. */}
          {orderPopup && blogs.length > 1 && (
            <BlogsReorder popup={orderPopup} closePopup={() => setOrderPopup(false)} />
          )}
          <DeleteWarning
            popup={deletePopup}
            onConfirm={deleteBlog}
            onCancel={() => setDeletePopup(false)}
            loading={deleteLoading}
            message="Do You Really want to delete this blog?"
          />

          <div className="text-center mb-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-[#124e66] text-white rounded-md font-semibold tracking-wider px-6 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              <MdiIcon path={MDI_PLUS} size={18} />
              Add Blog (Admin)
            </button>
            <button
              type="button"
              onClick={() => setOrderPopup(true)}
              className="inline-flex items-center gap-2 bg-[#124e66] text-white rounded-md font-semibold tracking-wider px-6 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              <MdiIcon path={MDI_SORT} size={18} />
              Change Blogs Order
            </button>
          </div>
        </>
      )}

      {!blogs.length ? (
        <p className="text-center text-gray-500 py-10">No blog posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 mb-2 max-w-7xl mx-auto">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded shadow mx-auto max-w-[400px] w-full relative pb-[50px]"
              style={{ padding: '30px', margin: '20px 0' }}
            >
              <div className="overflow-hidden" style={{ maxHeight: '650px' }}>
                {isAdmin && (
                  <div className="text-center mb-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(blog)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-[#0c3cac] text-[#0c3cac] hover:bg-[#0c3cac]/10 transition-colors"
                      aria-label={`Edit ${blog.title || 'blog'}`}
                    >
                      <MdiIcon path={MDI_TABLE_EDIT} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(blog)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-[#d90000] text-[#d90000] hover:bg-[#d90000]/10 transition-colors"
                      aria-label={`Delete ${blog.title || 'blog'}`}
                    >
                      <MdiIcon path={MDI_DELETE} />
                    </button>
                  </div>
                )}

                <BlogMedia blog={blog} />

                <h3 className="pt-4 text-lg font-semibold">{blog.title}</h3>

                <div
                  className="mt-2 text-sm text-gray-700 [&_h1]:!text-black [&_h1]:!text-[30px] [&_h2]:!text-[30px] [&_img]:max-w-[300px] [&_img]:object-contain [&_img]:max-h-[530px]"
                  dangerouslySetInnerHTML={{ __html: truncateContent(blog.content) }}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white px-[30px] py-2">
                <div className="flex justify-end">
                  <Link
                    href={`/blog/${getSlugValue(blog)}`}
                    className="inline-flex items-center gap-1 text-[16px] px-5 py-1 border-2 border-[#d5242c] text-[#d5242c] rounded-full bg-transparent hover:bg-[#d5242c] hover:text-white transition-colors"
                    aria-label={`Read more about ${blog.title || 'blog'}`}
                  >
                    Read More
                    <span className="bg-[#d5242c] text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">
                      &raquo;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
