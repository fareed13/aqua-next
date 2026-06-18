'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import type { Organization } from '@/types/api'

export const BANNER_HEIGHT = 57 // px — keep in sync with h-[57px] below

interface Props {
  initialOrganization: Organization
}

function getDealText(): { text: string; isSpecial: boolean } {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.toLocaleString('default', { month: 'long' })
  const after = (m: number, d: number) => today > new Date(year, m - 1, d)
  const before = (m: number, d: number) => today < new Date(year, m - 1, d)

  if (after(11, 24) && before(11, 29)) return { text: 'Black Friday', isSpecial: true }
  if (after(11, 29) && before(12, 4))  return { text: 'Cyber Monday', isSpecial: true }
  if (after(12, 4)  || before(1, 2))   return { text: 'Holiday', isSpecial: true }
  return { text: `Crazy ${month} Deal Alert.`, isSpecial: false }
}

function extractBannerHtml(html: string | null | undefined): string {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '').replace(/ /g, '').trim()
  return text ? html : ''
}

function hasUncoloredText(html: string): boolean {
  return html
    .replace(/<span[^>]*style="[^"]*color[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/ /g, '')
    .trim().length > 0
}

export function Banner({ initialOrganization }: Props) {
  const storeOrg  = useOrgStore((s) => s.organization)
  const organization = storeOrg ?? initialOrganization

  const banner    = useUiStore((s) => s.banner)
  const dialog    = useUiStore((s) => s.dialog)
  const setBanner = useUiStore((s) => s.setBanner)
  const setDialog = useUiStore((s) => s.setDialog)
  const router    = useRouter()

  if (!organization.is_banner_enabled || !banner || dialog) return null

  const bannerHtml  = extractBannerHtml(organization.banner_text)
  const uncolored   = bannerHtml ? hasUncoloredText(bannerHtml) : false
  const { text: dealText, isSpecial } = getDealText()

  return (
    <div
      id="top-banner"
      className="fixed left-0 right-0 top-0 z-[70] flex h-[57px] items-center justify-between gap-4 bg-white px-4 shadow-sm"
    >
      <div
        className="flex-1 text-xs font-semibold uppercase sm:text-sm md:text-lg lg:text-2xl"
        style={uncolored ? { color: 'black' } : undefined}
      >
          {bannerHtml ? (
            <span dangerouslySetInnerHTML={{ __html: bannerHtml }} />
          ) : (
            <>
              {dealText}{' '}
              <span
                className="cursor-pointer"
                style={{ color: 'var(--org-primary)' }}
                onClick={() => setDialog(true)}
                aria-label={isSpecial ? 'View specials' : 'View new member savings'}
              >
                {isSpecial ? 'Specials' : 'New Member Savings'}
              </span>
              {isSpecial ? '! ' : ': '}
              {organization.is_gift_card_enabled && (
                <span
                  className="cursor-pointer"
                  style={{ color: 'var(--org-primary)' }}
                  onClick={() => router.push('/gift-card')}
                  aria-label="View gift cards"
                >
                  Gift Cards{' '}
                </span>
              )}
              Available!
            </>
          )}
      </div>

      <button
        onClick={() => setBanner(false)}
        className="shrink-0 rounded p-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--org-primary)' }}
        aria-label="Close banner"
      >
        <X size={20} />
      </button>
    </div>
  )
}
