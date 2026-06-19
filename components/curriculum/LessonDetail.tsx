'use client'

import { useMemo } from 'react'
import { VideoPlayer } from '@/components/media/VideoPlayer'

const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? process.env.NEXT_PUBLIC_MEDIA_URL ?? ''

interface LessonMedia {
  uuid: string
  name: string
  extension: string
  media_type: string
}

interface Lesson {
  id: number
  name: string
  content?: string
  lesson_media: Array<{ media: LessonMedia }>
  lesson_files: Array<{ file_path: string }>
}

interface LessonDetailProps {
  lesson: Lesson
}

export function LessonDetail({ lesson }: LessonDetailProps) {
  const files = lesson.lesson_files?.map(lf => lf.file_path) ?? []

  const mediasList = useMemo(() => {
    return (lesson.lesson_media ?? [])
      .filter(m => m.media.media_type === 'video')
      .map(m => ({
        ...m.media,
        prettyName: m.media.name,
        name: `${VIDEO_URL}/${m.media.uuid}_700.mp4`,
        autoPlay: false,
      }))
  }, [lesson.lesson_media])

  const isSingle = mediasList.length === 1

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="mb-5 text-center text-[50px] max-[1263px]:text-4xl font-bold">
          {lesson.name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {isSingle ? (
            <div className="col-span-1 sm:col-start-1 sm:col-end-2 sm:mx-auto w-full sm:max-w-[50%] mb-5">
              <div className="mb-2">
                <VideoPlayer component="VideoPlayer" media={mediasList[0] as any} />
              </div>
              <h3 className="text-center text-4xl">{mediasList[0].prettyName}</h3>
            </div>
          ) : (
            mediasList.map((media, j) => (
              <div key={j} className="mb-5">
                <div className="mb-2">
                  <VideoPlayer component="VideoPlayer" media={media as any} />
                </div>
                <h3 className="text-center text-4xl">{media.prettyName}</h3>
              </div>
            ))
          )}
        </div>

        {lesson.content && (
          <div
            className="mt-6 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )}

        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-5 text-center text-[50px] max-[1263px]:text-4xl font-bold">
              Lesson Files
            </h2>
            <ul className="space-y-2">
              {files.map((filePath, i) => (
                <li key={i}>
                  <a
                    href={filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer mx-1"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
  )
}
