'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAnalytics } from '@/hooks/admin/useAnalytics'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { UsersChart } from './UsersChart'
import { LeadsChart } from './LeadsChart'
import { TrialChart } from './TrialChart'
import { LeadAndPurchaseChart } from './LeadAndPurchaseChart'
import { UserPageChart } from './UserPageChart'
import { UserAreaChart } from './UserAreaChart'
import { ProgramChart } from './ProgramChart'

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 pl-3 text-sm font-semibold uppercase text-[#8a8a8a] sm:pl-0">{children}</p>
)

/** Nuxt Analytics (components/reports/analytics/Analytics.vue) — date-range dialog filter + all analytics charts. */
export function Analytics() {
  const {
    domain, items, custom, dialog, setDialog,
    selectedDateRange, currentSetOption, selectedOption, dateRange,
    startDate, endDate, setStartDate, setEndDate,
    rangeProp, dateMeasurement, changProps, cleanUp,
  } = useAnalytics()
  const { getSecure } = useSecureCalls()

  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null)
  const [overlay, setOverlay] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const getUsersData = useCallback(async () => {
    if (!rangeProp.start_date || !rangeProp.end_date) return
    try {
      setOverlay(true)
      const res = await getSecure<Record<string, any>>(SECURE_ENDPOINTS.ANALYTICS_ALL, {
        domain, from: rangeProp.start_date, to: rangeProp.end_date,
      })
      setAnalytics(res ?? {})
    } catch { /* ignore */ } finally { setOverlay(false) }
  }, [getSecure, domain, rangeProp.start_date, rangeProp.end_date])

  // Nuxt: watch(range_prop, () => get_users_data())
  useEffect(() => { getUsersData() }, [getUsersData])

  const chipLabel = currentSetOption || selectedOption

  return (
    <div className="relative">
      {overlay && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* Date-range filter row */}
      <div className="flex flex-col items-stretch gap-2 px-2 md:flex-row md:items-center md:justify-between">
        <h4 className="text-lg font-semibold">Dashboard:</h4>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end">
          <span className="mx-2 inline-flex items-center self-start rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 md:self-auto">
            {chipLabel}
          </span>
          <input
            type="text"
            readOnly
            value={selectedDateRange}
            onClick={() => setDialog(true)}
            placeholder="Date range"
            className="w-full cursor-pointer border-b border-gray-400 bg-transparent px-1 py-2 text-sm outline-none md:w-56"
          />
        </div>
      </div>

      {/* Date-range dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 p-4 pt-20" onClick={cleanUp}>
          <div className="flex max-h-[80vh] w-full max-w-[300px] flex-col rounded bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-4 py-2 text-center text-[1.1rem] font-semibold">{dateRange}</div>

            <div className="flex-1 overflow-y-auto px-1 py-1">
              {!custom ? (
                <ul className="text-sm">
                  {items.map((item) => (
                    <li key={item.title}>
                      {!item.subList ? (
                        <button
                          type="button"
                          onClick={() => dateMeasurement(item.title)}
                          className="block w-full min-h-[35px] px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {item.title}
                        </button>
                      ) : (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenGroup((g) => (g === item.title ? null : item.title))
                              dateMeasurement(item.title)
                            }}
                            className="flex w-full min-h-[35px] items-center justify-between px-4 py-2 text-left hover:bg-gray-100"
                          >
                            <span>{item.title}</span>
                            <span className="text-gray-500">{openGroup === item.title ? '▲' : '▼'}</span>
                          </button>
                          {openGroup === item.title && (
                            <ul>
                              {item.subList.map((child) => (
                                <li key={child.title}>
                                  <button
                                    type="button"
                                    onClick={() => dateMeasurement(child.title)}
                                    className="block w-full min-h-[35px] px-8 py-2 text-left hover:bg-gray-100"
                                  >
                                    {child.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3 px-3 py-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-3 py-2 text-sm">
              {custom && (
                <button type="button" onClick={() => dateMeasurement('Custom')} className="px-3 py-1 font-medium uppercase text-[#1565C0] hover:bg-blue-50 rounded">
                  Back
                </button>
              )}
              <button type="button" onClick={cleanUp} className="px-3 py-1 font-medium uppercase text-[#1565C0] hover:bg-blue-50 rounded">
                Cancel
              </button>
              <button type="button" onClick={changProps} className="px-3 py-1 font-medium uppercase text-[#1565C0] hover:bg-blue-50 rounded">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="relative z-[1] mx-auto max-w-[1400px] px-4 py-2">
        <div className="mb-2">
          <UsersChart analytics={analytics ?? undefined} date_range={selectedDateRange} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label>Total leads by date:</Label><LeadsChart analytics={analytics ?? undefined} date_range={selectedDateRange} /></div>
          <div><Label>Total Trials by date:</Label><TrialChart analytics={analytics ?? undefined} date_range={selectedDateRange} /></div>
        </div>

        <div className="mt-4">
          <Label>Leads And Purchases by Source:</Label>
          <LeadAndPurchaseChart analytics={analytics ?? undefined} date_range={selectedDateRange} />
        </div>
      </div>

      <div className="relative z-[1] mx-auto max-w-[1400px] px-4 py-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div><Label>Which pages are visited most often?</Label><UserPageChart analytics={analytics ?? undefined} date_range={selectedDateRange} /></div>
          <div><Label>Which area have the most users?</Label><UserAreaChart analytics={analytics ?? undefined} date_range={selectedDateRange} /></div>
          <div><Label>Which programs are visited most often?</Label><ProgramChart analytics={analytics ?? undefined} date_range={selectedDateRange} /></div>
        </div>
      </div>
    </div>
  )
}
