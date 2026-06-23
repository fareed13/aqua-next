'use client'

import Image from 'next/image'
import type { Staff } from '@/types/api'
import { buildMediaUrl } from '@/lib/utils/media'

interface InstructorDetailProps {
  instructor: Staff
}

export function InstructorDetail({ instructor }: InstructorDetailProps) {
  const imgUrl = instructor.media ? buildMediaUrl(instructor.media, 350) : ''

  return (
    <div className="bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-0">
          <div>
            <h2 className="uppercase block ml-5 my-12 text-4xl font-bold text-white">
              Bio
            </h2>
            <div
              className="mx-5 mb-10 text-white prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: instructor.bio || '' }}
            />
          </div>
          <div className="mt-6">
            {imgUrl && (
              <div className="mx-5 mt-12 mb-5 bg-black">
                <Image
                  src={imgUrl}
                  alt={instructor.name || 'Instructor photo'}
                  width={400}
                  height={533}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
