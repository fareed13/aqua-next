'use client'

import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import type { SectionProps } from '@/components/sections/registry'

export function ServicePlans(_props: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)

  const currencySign = (org as any)?.currency_sign ?? '$'

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-8 block text-center text-xl font-semibold">
          Available Limited Time Packages
        </h2>
        <hr
          className="mx-auto mb-8 w-[120px] border-2 opacity-100"
          style={{ borderColor: 'var(--org-primary)' }}
        />
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-gray-500">
          <p className="text-lg">Service plans are loaded dynamically.</p>
          <button
            onClick={() => setDialog(true)}
            className="mt-4 rounded px-6 py-2.5 text-white"
            style={{ backgroundColor: 'var(--org-primary)' }}
            aria-label="View plans"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  )
}
