'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'

const programs = [
  { text: 'Krav Maga Self Defense', img: '/assets/img/galary-img1.png' },
  { text: 'Kickboxing Fitness',     img: '/assets/img/galary-img2.png' },
  { text: 'Kids Martial Arts',      img: '/assets/img/galary-img3.png' },
  { text: 'Krav Maga Self Defense', img: '/assets/img/galary-img1.png' },
  { text: 'Kickboxing Fitness',     img: '/assets/img/galary-img2.png' },
  { text: 'Kids Martial Arts',      img: '/assets/img/galary-img3.png' },
  { text: 'Krav Maga Self Defense', img: '/assets/img/galary-img1.png' },
  { text: 'Kickboxing Fitness',     img: '/assets/img/galary-img2.png' },
  { text: 'Kids Martial Arts',      img: '/assets/img/galary-img3.png' },
]

export function MovingTheirCompanies(_props: SectionProps) {
  const [dialog, setDialog] = useState(false)
  const [activeProgram, setActiveProgram] = useState<string | null>(null)

  const openDialog = (text: string) => {
    setActiveProgram(text)
    setDialog(true)
  }

  const closeDialog = () => {
    setDialog(false)
    setActiveProgram(null)
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-center text-3xl font-normal mb-1">
          Can You See Why So Many People Just Like You Are
        </h3>
        <h2 className="text-center text-5xl md:text-[70px] font-bold capitalize mb-8">
          Moving Their Companies<br /> Into ClickFunnels?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <div key={i} className="mb-7">
              <div className="relative overflow-hidden cursor-pointer" onClick={() => openDialog(program.text)}>
                <div className="relative w-full aspect-video">
                  <Image
                    src={program.img}
                    alt={program.text}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="relative w-20 h-20">
                    <Image
                      src="/assets/img/play-icon.png"
                      alt="Play video"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <h4 className="text-center mt-2 text-2xl font-medium">{program.text}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Video dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={closeDialog}
        >
          <div
            className="relative w-full max-w-[800px] mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeDialog}
              className="absolute -top-4 -right-4 z-10 w-8 h-8"
              aria-label="Close video dialog"
            >
              <Image
                src="/assets/img/close-white.png"
                alt="Close"
                width={31}
                height={31}
                className="object-contain cursor-pointer"
              />
            </button>

            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/2Eesbo_x544"
              frameBorder={0}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeProgram || 'Program video'}
              aria-label={activeProgram || 'Program video'}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
