'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import type { Curriculum } from '@/types/api'

interface Props {
  curriculum: Curriculum
}

export function CurriculumDetail({ curriculum }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const requiresLogin = organization?.require_login_for_virtual_classes ?? false
  const accentDark = organization?.colors?.['app-main-accent-dark'] ?? '#333'
  const { isLoggedIn } = useAuth()

  // Gate the client-only auth read behind mount to avoid a hydration mismatch
  // on the enabled/disabled button (see CurriculumDefault for the same pattern).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const authed = mounted && isLoggedIn()

  const lessons = useMemo(() => {
    return (curriculum.lessons ?? []).map((lesson: any) => {
      // Nuxt: disabled only when login required AND the user is NOT logged in.
      let disabled = false
      if (requiresLogin && !authed) {
        disabled = curriculum.is_public ? !lesson.is_public : true
      }
      return { ...lesson, disabled }
    })
  }, [curriculum, requiresLogin, authed])

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={curriculum.name} />

      <div className="relative">
        <div className="h-2" style={{ backgroundColor: accentDark }} />
        <div className="h-1 bg-gray-200" />
      </div>

      <div className="bg-[#f3f3f3] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {lessons.map((lesson: any) => (
              <div
                key={lesson.id}
                className="bg-white p-10 shadow-md overflow-hidden"
                style={{ boxShadow: '5px 5px 5px rgba(0,0,0,0.3)' }}
              >
                <h2 className="text-[30px] font-bold capitalize mb-2 leading-tight">
                  {lesson.name}
                </h2>
                {lesson.content && (
                  <div
                    className="mb-4 text-base"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}
                {lesson.id && (
                  lesson.disabled ? (
                    <button
                      disabled
                      className="mx-auto block w-full max-w-[200px] py-2 text-white text-base rounded opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: '#d90000' }}
                    >
                      Members Only
                    </button>
                  ) : (
                    <Link
                      href={`/curriculum/lesson/${lesson.id}`}
                      className="mx-auto block w-full max-w-[200px] text-center py-2 text-white text-base rounded"
                      style={{ backgroundColor: '#d90000' }}
                    >
                      View Class
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
