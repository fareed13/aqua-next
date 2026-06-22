'use client'

import { useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'

interface CheckoutBannerProps {
  image?: string
}

export function CheckoutBanner({ image }: CheckoutBannerProps) {
  const organization = useOrgStore((s) => s.organization)

  const backgroundSrc = useMemo(() => {
    if (image) return image

    const services = organization?.services
    if (!services || services.length === 0) return ''

    const service = services[Math.floor(Math.random() * services.length)]
    const media = service?.large_media
    if (!media?.uuid || !media?.extension) return ''

    return `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}${media.uuid}_1200.${media.extension}`
  }, [image, organization])

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full"
      style={{
        maxHeight: 250,
        marginTop: 80,
        minHeight: 200,
        backgroundImage: backgroundSrc
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundSrc})`
          : 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="text-white uppercase text-4xl md:text-6xl text-center font-bold">
        New Member Discount Ends Dec 2!
      </h1>
      <p className="text-white text-2xl text-center mt-2">Special pricing below!</p>
    </div>
  )
}
