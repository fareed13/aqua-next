'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'

interface SettingsItem {
  id: number
  title: string
  description?: string
  component?: boolean
  nested?: SettingsItem[]
}

interface SettingsSection {
  id: number
  title: string
  description?: string
  items: SettingsItem[]
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 1, title: 'Business Essentials', description: 'Core business configuration',
    items: [
      { id: 101, title: 'Organization Setup', nested: [
        { id: 1011, title: 'Organization', component: true },
        { id: 1012, title: 'Location', component: true },
        { id: 1013, title: 'Services / Classes', component: true },
        { id: 1014, title: 'Staff / Instructors', component: true },
        { id: 1015, title: 'Organization PWA', component: true },
      ]},
      { id: 102, title: 'Customer Management', nested: [
        { id: 1021, title: 'Bulk Upload', component: true },
        { id: 1022, title: 'Belts', component: true },
        { id: 1023, title: 'Attendance', component: true },
        { id: 1024, title: 'Reserved Classes', component: true },
        { id: 1025, title: 'Agreements', component: true },
      ]},
    ],
  },
  {
    id: 2, title: 'Payments & Billing', description: 'Payment configuration and receipts',
    items: [
      { id: 201, title: 'Purchases', component: true },
      { id: 202, title: 'Trial Receipt', component: true },
      { id: 203, title: 'Payment Integrations', component: true },
      { id: 204, title: 'Refund Policy', component: true },
      { id: 205, title: 'Booking Receipt', component: true },
    ],
  },
  {
    id: 3, title: 'Marketing & Analytics', description: 'Reports, ads, and analytics',
    items: [
      { id: 301, title: 'Reports', nested: [
        { id: 3011, title: 'Keywords Ranking', component: true },
        { id: 3012, title: 'Last 15 Days', component: true },
        { id: 3013, title: 'No Show', component: true },
        { id: 3014, title: 'New Members', component: true },
        { id: 3015, title: 'Renewal Report', component: true },
        { id: 3016, title: 'Birthday', component: true },
        { id: 3017, title: 'ABBI Leads', component: true },
        { id: 3018, title: 'Analytics', component: true },
      ]},
      { id: 303, title: 'Google Business', nested: [
        { id: 3031, title: 'Media Manager', component: true },
        { id: 3032, title: 'GMB Locations', component: true },
        { id: 3033, title: 'Automations', component: true },
        { id: 3034, title: 'Monitoring', component: true },
      ]},
    ],
  },
  {
    id: 4, title: 'Website & Content', description: 'Website pages, media, and content',
    items: [
      { id: 401, title: 'Website Customization', nested: [
        { id: 4011, title: 'Service Intro', component: true },
        { id: 4012, title: 'Styles & Colors', component: true },
        { id: 4013, title: 'Pages', component: true },
        { id: 4014, title: 'Media Library', component: true },
        { id: 4015, title: 'Tags', component: true },
        { id: 4016, title: 'Social Media', component: true },
        { id: 4017, title: 'Misc', component: true },
        { id: 4018, title: 'PDF Builder', component: true },
        { id: 4019, title: 'Chatbot', component: true },
      ]},
      { id: 402, title: 'Content', nested: [
        { id: 4021, title: 'Blog', component: true },
        { id: 4022, title: 'Curriculum', component: true },
        { id: 4023, title: 'Curriculum Preview', component: true },
        { id: 4024, title: 'Custom Scripts', component: true },
        { id: 4025, title: 'FAQs', component: true },
      ]},
      { id: 403, title: 'Communication', nested: [
        { id: 4031, title: 'SMS Inbox', component: true },
        { id: 4032, title: 'Email Inbox', component: true },
        { id: 4033, title: 'Mass Communication', component: true },
        { id: 4034, title: 'Templates', component: true },
      ]},
    ],
  },
  {
    id: 5, title: 'System Settings', description: 'Users, integrations, and advanced config',
    items: [
      { id: 400, title: 'Feature Toggles', component: true },
      { id: 501, title: 'Users', component: true },
      { id: 502, title: 'Integrations', component: true },
      { id: 504, title: 'Automations', component: true },
      { id: 505, title: 'SEO Analytics', component: true },
      { id: 506, title: 'Redirects', component: true },
      { id: 507, title: 'SEO Page Meta', component: true },
    ],
  },
  {
    id: 6, title: 'Lead Generation', description: 'External lead integrations',
    items: [
      { id: 601, title: 'External Lead Integration', component: true },
      { id: 602, title: 'Google Leads', component: true },
    ],
  },
]

export function AllSettings() {
  const organization = useOrgStore(s => s.organization)
  const setSettingsVisibleSection = useUiStore(s => s.setSettingsVisibleSection)
  const { isSuperAdminLoggedIn, isAdminLoggedIn } = useAuth()

  const [openSection, setOpenSection] = useState<number | null>(101)
  const [openChild, setOpenChild] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const sections = useMemo(() => {
    let list = [...SETTINGS_SECTIONS]
    if (!isSuperAdminLoggedIn()) {
      list = list.map(section => {
        const s = { ...section, items: [...section.items] }
        if (s.title === 'Business Essentials') {
          s.items = s.items.map(item => ({
            ...item,
            nested: item.nested?.filter(n => n.title !== 'Organization PWA'),
          }))
        }
        if (s.title === 'System Settings') {
          s.items = s.items.filter(item => item.title !== 'Users')
        }
        return s
      })
    }
    if (!organization?.chatbot_enabled) {
      list = list.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          nested: item.nested?.filter(n => n.id !== 4019),
        })),
      }))
    }
    return list
  }, [isSuperAdminLoggedIn, organization?.chatbot_enabled])

  const searchableTitles = useMemo(() => {
    const titles: Array<{ id: number; nestedId?: number; title: string; description?: string }> = []
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.component) {
          titles.push({ id: item.id, title: item.title, description: item.description })
        }
        item.nested?.forEach(n => {
          if (n.component) {
            titles.push({ id: item.id, nestedId: n.id, title: n.title, description: n.description })
          }
        })
      })
    })
    return titles
  }, [sections])

  const filteredTitles = search
    ? searchableTitles.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : []

  const handleSearchSelect = (item: typeof searchableTitles[0]) => {
    setOpenSection(item.id)
    setOpenChild(item.nestedId ?? null)
    setSearch('')
    setTimeout(() => {
      const el = document.getElementById(String(item.nestedId ?? item.id))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.scrollBy(0, -120)
      }
    }, 300)
  }

  useEffect(() => {
    return () => {
      setSettingsVisibleSection(openSection ? { parent: openSection, child: openChild } as any : null)
    }
  }, [openSection, openChild])

  return (
    <div className="bg-[#f1f5f9] min-h-screen -mt-[42px]">
      {/* Sticky search */}
      <div className="sticky top-[80px] z-10 bg-white border-b shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            className="w-full border rounded-full px-4 py-2 pl-10"
            placeholder="Search settings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128269;</span>
          {filteredTitles.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-20">
              {filteredTitles.map(item => (
                <button key={`${item.id}-${item.nestedId}`}
                  onClick={() => handleSearchSelect(item)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-0">
                  <div className="font-medium">{item.title}</div>
                  {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings panels */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">{section.title}</h2>
              {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
            </div>

            <div className="divide-y">
              {section.items.map(item => (
                <div key={item.id} id={String(item.id)}>
                  <button
                    onClick={() => {
                      setOpenSection(openSection === item.id ? null : item.id)
                      setOpenChild(null)
                    }}
                    className="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50 text-left"
                  >
                    <div>
                      <span className="font-semibold">{item.title}</span>
                      {item.description && <span className="text-sm text-gray-500 ml-2">({item.description})</span>}
                    </div>
                    <span className="text-gray-400">{openSection === item.id ? '−' : '+'}</span>
                  </button>

                  {openSection === item.id && (
                    <div className="px-6 pb-4">
                      {item.component && (
                        <div className="bg-gray-50 rounded p-4 text-gray-500 text-sm">
                          {item.title} component placeholder
                        </div>
                      )}
                      {item.nested?.map(nested => (
                        <div key={nested.id} id={String(nested.id)} className="ml-4 border-l-2 border-gray-200">
                          <button
                            onClick={() => setOpenChild(openChild === nested.id ? null : nested.id)}
                            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 text-left"
                          >
                            <span className="text-sm font-medium">{nested.title}</span>
                            <span className="text-gray-400 text-xs">{openChild === nested.id ? '−' : '+'}</span>
                          </button>
                          {openChild === nested.id && (
                            <div className="px-4 pb-3">
                              <div className="bg-gray-50 rounded p-4 text-gray-500 text-sm">
                                {nested.title} component placeholder
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
