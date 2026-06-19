'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Blog, Media } from '@/types/api'

interface BlogDetailProps {
  blog: Blog
}

export function BlogDetail({ blog }: BlogDetailProps) {
  const org = useOrgStore(s => s.organization)

  const logoUrl = org?.primary_logo
    ? buildMediaUrl(org.primary_logo, 350)
    : ''

  const blogMedia = blog.media as Media | null
  const files = blog.blog_files?.map(bf => bf.file_path) ?? []

  return (
    <div className="bg-[#f3f3f3]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div
          className="bg-white rounded shadow p-8 my-5"
          style={{ boxShadow: '3px 3px 5px rgba(0, 0, 0, 0.3)' }}
        >
          <h2 className="text-center text-3xl md:text-[40px] font-bold mb-5 break-words">
            {blog.title}
          </h2>

          {blogMedia && (
            <div className="float-left w-full max-w-[400px] mr-6 mb-3 max-md:float-none max-md:mx-auto max-md:mb-5 max-md:text-center">
              {blogMedia.media_type === 'video' ? (
                <video
                  className="w-full max-h-[200px] object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={blog.title || 'Blog video'}
                >
                  <source
                    src={buildMediaUrl(blogMedia, 'small')}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <div className="relative w-full h-[200px]">
                  <Image
                    src={buildMediaUrl(blogMedia) || logoUrl}
                    alt={blog.title || 'Blog image'}
                    fill
                    className="object-contain"
                    sizes="400px"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          />

          <div className="clear-both" />

          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-5">Blog Files</h2>
              <ul className="space-y-2">
                {files.map((filePath, i) => (
                  <li key={i} className="cursor-pointer mx-1">
                    <a
                      href={filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                      aria-label={`Open file ${filePath}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                      </svg>
                      {filePath}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
