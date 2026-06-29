'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

const SOCIAL_COLORS: Record<string, string> = {
  linkedin: '#007bb6',
  yahoo: '#400090',
  facebook: '#4e71a8',
  instagram: '#444',
  twitter: '#1cb7eb',
  google: '#34A853',
  snapchat: '#FFFC00',
  pinterest: '#dc4e41',
  youtube: '#FF0000',
}

function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase()
  switch (key) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
      )
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.304 4.955l-.004.08c-.003.073-.007.146-.01.218.057.023.148.044.29.053.276-.022.64-.11 1.059-.31.16-.077.345-.108.514-.108.37 0 .724.135.955.384.298.327.39.773.258 1.259-.185.692-.819 1.226-1.807 1.528-.054.016-.113.031-.177.048-.219.058-.548.146-.620.390-.053.18.09.417.197.590.094.154.185.306.26.457.07.148.120.288.120.423 0 .567-.465 1.138-1.293 1.433-.136.049-.267.082-.396.094-.18.016-.349.085-.50.172-.243.138-.472.389-.67.71-.206.334-.432.64-.668.868-.65.626-1.489.96-2.506.99-.015 0-.03.001-.045.001-.524 0-1.03-.104-1.5-.31a4.052 4.052 0 00-1.618-.351h-.013c-.55 0-1.083.113-1.587.34a3.82 3.82 0 01-1.504.314 3.31 3.31 0 01-.044 0c-1.017-.03-1.856-.364-2.506-.99-.236-.228-.462-.534-.668-.868-.198-.321-.427-.572-.67-.71-.152-.087-.32-.156-.5-.172-.129-.012-.26-.045-.396-.094-.828-.295-1.293-.866-1.293-1.433 0-.135.05-.275.12-.423.075-.151.166-.303.26-.457.107-.173.25-.41.197-.59-.072-.244-.401-.332-.62-.39-.064-.017-.123-.032-.177-.048-.988-.302-1.622-.836-1.807-1.528-.132-.486-.04-.932.258-1.259.231-.249.585-.384.955-.384.169 0 .354.031.514.108.419.2.783.288 1.059.31.142-.009.233-.03.29-.053l-.01-.218-.004-.08c-.099-1.736-.225-3.762.304-4.955C7.859 1.07 11.216.793 12.206.793z"/>
        </svg>
      )
    case 'google':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
      )
    case 'yahoo':
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <path d="M0 0l6.6 15.625L0 24h2.804l4.154-6.328L11.204 24H24l-6.628-15.656L24 0h-2.807l-4.18 6.328L12.799 0z"/>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" width="38" height="38" fill="white">
          <circle cx="12" cy="12" r="10"/>
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white">{platform[0]?.toUpperCase()}</text>
        </svg>
      )
  }
}

export function HomeContact({ headline, content, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)

  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Image */}
        <div className="flex items-end justify-center md:w-1/2 md:justify-end">
          {imgUrl && (
            <Image
              src={imgUrl}
              alt={headline || 'Contact image'}
              width={600}
              height={400}
              className="object-contain"
              style={{ height: 400, objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2">
          <div className="mt-10 bg-[#f2f2f2] p-8 md:p-10" style={{ padding: '40px 40px', marginTop: 40 }}>
            <h3
              className="relative font-extrabold text-[#171d29]"
              style={{ fontSize: 36, lineHeight: '42px', paddingBottom: 20 }}
            >
              {headline}
              <span
                className="absolute left-0 rounded-full bg-[#d5242c]"
                style={{ bottom: -20, width: 70, height: 6, borderRadius: 14, content: "''" }}
              />
            </h3>
            {content && (
              <div
                className="text-base leading-[30px]"
                style={{ marginTop: 50 }}
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}

            <div className="mt-4" style={{ borderTop: '1px solid #fff' }}>
              {/* Address */}
              <div className="py-5" style={{ borderBottom: '1px solid #fff' }}>
                <p className="font-bold">Address:</p>
                <span className="block" style={{ marginTop: 6 }}>
                  {org?.name}
                  <br />
                  {loc?.street ? loc.street : ''}
                  <br />
                  {loc?.city ? `${loc.city},` : ''}{' '}
                  {(loc?.state as any)?.name ?? ''} {loc?.zip_code}
                </span>
              </div>

              {/* Phone */}
              {loc?.pretty_phone && (
                <div className="py-5" style={{ borderBottom: '1px solid #fff' }}>
                  <p className="font-bold">Contact phones:</p>
                  <a
                    href={`tel:${loc.pretty_phone}`}
                    className="block no-underline"
                    style={{ marginTop: 6, color: 'black', textDecoration: 'none' }}
                    aria-label={`Call ${loc.pretty_phone}`}
                  >
                    {loc.pretty_phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {loc?.email && (
                <div className="py-5">
                  <p className="font-bold">Email address:</p>
                  <a
                    href={`mailto:${loc.email}`}
                    className="block no-underline"
                    style={{ marginTop: 6, color: 'black', textDecoration: 'none' }}
                    aria-label={`Email ${loc.email}`}
                  >
                    {loc.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Social links */}
          {loc?.social_media && (loc.social_media as any[]).length > 0 && (
            <div className="flex flex-wrap gap-5" style={{ marginTop: 20 }}>
              {(loc.social_media as any[]).map((sm: any, i: number) => {
                const key = sm.platform?.toLowerCase() ?? ''
                const color = SOCIAL_COLORS[key] ?? '#333'
                return (
                  <a
                    key={i}
                    href={sm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${sm.platform} page`}
                    className="flex items-center justify-center text-white"
                    style={{
                      backgroundColor: color,
                      height: 90,
                      width: '17%',
                      minWidth: 60,
                      color: '#fff',
                    }}
                  >
                    <SocialIcon platform={sm.platform ?? ''} />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
