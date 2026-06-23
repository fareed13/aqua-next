'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Blog, Media } from '@/types/api'

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
  const blogs = location?.blogs ?? []

  if (!blogs.length) {
    return (
      <div className="bg-[#f3f3f3] py-10">
        <p className="text-center text-gray-500">No blog posts yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f3f3f3] px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 mb-2 max-w-7xl mx-auto">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded shadow mx-auto max-w-[400px] w-full relative pb-[50px]"
            style={{ padding: '30px', margin: '20px 0' }}
          >
            <div className="overflow-hidden" style={{ maxHeight: '650px' }}>
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
    </div>
  )
}
