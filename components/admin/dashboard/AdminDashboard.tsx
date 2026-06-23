'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const DATE_RANGE_OPTIONS = [
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'Last Quarter', value: 'last_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Last 120 Days', value: 'last_120_days' },
]

export function AdminDashboard() {
  const searchParams = useSearchParams()
  const organization = useOrgStore(s => s.organization)
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, postSecure } = useSecureCalls()
  const currencySign = organization?.currency_sign ?? '$'

  const queryRange = searchParams?.get('date_range')
  const initialRange = DATE_RANGE_OPTIONS.some(o => o.value === queryRange) ? queryRange! : 'last_30_days'

  const [dateRangeFilter, setDateRangeFilter] = useState(initialRange)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailDialog, setEmailDialog] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  const [completionStats, setCompletionStats] = useState<any>(null)
  const [leadStats, setLeadStats] = useState<any>(null)
  const [analyticsStats, setAnalyticsStats] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [dateRangeFilter])

  const fetchDashboardData = async () => {
    try {
      const [completion, leads, analytics] = await Promise.all([
        getSecure(SECURE_ENDPOINTS.DASHBOARD_COMPLETION_PERCENTAGE, { date_range: dateRangeFilter }),
        getSecure(SECURE_ENDPOINTS.DASHBOARD_LEAD_REVENUE_STATS, { date_range: dateRangeFilter }),
        getSecure(SECURE_ENDPOINTS.DASHBOARD_ANALYTICS_STATS, { date_range: dateRangeFilter }),
      ])
      setCompletionStats(completion)
      setLeadStats(leads)
      setAnalyticsStats(analytics)
    } catch { /* handled */ }
  }

  const exportToPDF = async () => {
    try {
      setExportingPDF(true)
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.querySelector('.dashboard-container')
      if (!element) return
      const width = (element as HTMLElement).scrollWidth
      const height = (element as HTMLElement).scrollHeight
      await html2pdf().set({
        filename: `dashboard-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff', windowWidth: width, windowHeight: height },
        jsPDF: { unit: 'px', format: [width, height], orientation: width > height ? 'landscape' as const : 'portrait' as const },
      }).from(element).save()
    } catch (e) { console.error(e) }
    finally { setExportingPDF(false) }
  }

  const confirmSendEmail = async () => {
    if (!emailInput || !/.+@.+\..+/.test(emailInput)) return
    try {
      setSendingEmail(true)
      await postSecure(SECURE_ENDPOINTS.DASHBOARD_EMAIL_REPORT, {
        email: emailInput, date_range: dateRangeFilter,
      })
      setEmailDialog(false)
      setEmailInput('')
    } catch { /* handled */ }
    finally { setSendingEmail(false) }
  }

  return (
    <div style={{ marginTop: '80px' }}>
      <div className="dashboard-container">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={exportToPDF} disabled={exportingPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50">
                {exportingPDF ? 'Exporting...' : 'Export as PDF'}
              </button>
              <button onClick={() => setEmailDialog(true)} disabled={sendingEmail}
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50">
                Send PDF as Email
              </button>
            </div>
            <select value={dateRangeFilter} onChange={e => setDateRangeFilter(e.target.value)}
              className="border rounded px-3 py-2 max-w-[250px]">
              {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Site Setup */}
          <div className="mt-8 bg-white border rounded shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Site Setup</h3>
            <p className="text-gray-500">
              {completionStats ? `${(completionStats as any).completion_percentage ?? 0}% complete` : 'Loading...'}
            </p>
          </div>

          {/* Leads & Revenue */}
          <div className="mt-6 bg-white border rounded shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Leads & Revenue Overview</h3>
            {leadStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(leadStats as any).total_leads ?? 0}</div>
                  <div className="text-sm text-gray-500">Total Leads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{currencySign}{(leadStats as any).total_revenue ?? 0}</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(leadStats as any).total_trials ?? 0}</div>
                  <div className="text-sm text-gray-500">Trials</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(leadStats as any).total_purchases ?? 0}</div>
                  <div className="text-sm text-gray-500">Purchases</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading stats...</p>
            )}
          </div>

          {/* Analytics Overview */}
          <div className="mt-6 bg-white border rounded shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Analytics Overview</h3>
            {analyticsStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(analyticsStats as any).total_users ?? 0}</div>
                  <div className="text-sm text-gray-500">Users</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(analyticsStats as any).total_page_views ?? 0}</div>
                  <div className="text-sm text-gray-500">Page Views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{(analyticsStats as any).bounce_rate ?? '0%'}</div>
                  <div className="text-sm text-gray-500">Bounce Rate</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading analytics...</p>
            )}
          </div>

          {/* Conversion Charts placeholder */}
          <div className="mt-6 bg-white border rounded shadow-sm p-6">
            <h3 className="text-lg font-bold mb-1">Conversion Analytics</h3>
            <p className="text-sm text-gray-500 mb-4">Conversion insights by day and device</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded p-8 text-center text-gray-400 min-h-[200px] flex items-center justify-center">
                Conversion by Day chart
              </div>
              <div className="bg-gray-50 rounded p-8 text-center text-gray-400 min-h-[200px] flex items-center justify-center">
                Conversion by Device chart
              </div>
            </div>
          </div>

          {/* Page Speed placeholder */}
          <div className="mt-6 mb-8 bg-white border rounded shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Page Speed</h3>
            <p className="text-gray-400">Page speed results will be rendered here.</p>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      {emailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-[400px] w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Send PDF via Email</h3>
            <input type="email" className="w-full border rounded px-3 py-2 mb-4" placeholder="Email Address"
              value={emailInput} onChange={e => setEmailInput(e.target.value)} autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setEmailDialog(false); setEmailInput('') }}
                className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={confirmSendEmail}
                disabled={!emailInput || !/.+@.+\..+/.test(emailInput) || sendingEmail}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
                {sendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
