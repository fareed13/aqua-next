import type { SectionProps } from '@/components/sections/registry'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function VideoIntro(_props: SectionProps) {
  const currentMonth = MONTHS[new Date().getMonth()]

  return (
    <div className="bg-[#f3f3f3] pt-12 pb-0">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h3 className="mb-1 text-[70px] leading-tight">
          Do Warm-ups until Class Begins!
        </h3>
        <p className="text-lg mb-6">
          The next class begins at <b>Jan 1, 2019 at </b>, make sure to start your warm-ups 10 minutes early.
        </p>

        <div className="w-full">
          <iframe
            width="100%"
            src="https://www.youtube.com/embed/2Eesbo_x544"
            frameBorder={0}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Warm-up video"
            aria-label="Warm-up video"
            className="w-full h-[650px] md:h-[450px] sm:h-[350px]"
            style={{ minHeight: 250 }}
          />
        </div>
      </div>
    </div>
  )
}
