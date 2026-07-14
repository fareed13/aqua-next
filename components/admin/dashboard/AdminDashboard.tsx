'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Mail, PieChart } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { SiteSetupComplete, type Integration } from './SiteSetupComplete'
import { LeadsRevenueOverview } from './LeadsRevenueOverview'
import { AnalyticsOverview } from './AnalyticsOverview'
import { PageSpeedWidget } from './PageSpeedWidget'
import { ConversionDayChart } from '@/components/reports/abbiLeads/ConversionDayChart'
import { ConversionDeviceChart } from '@/components/reports/abbiLeads/ConversionDeviceChart'
import './dashboard.css'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const organization = useOrgStore(s => s.organization)
  const { isAdminLoggedIn } = useAuth()
  const { postSecure } = useSecureCalls()
  const currencySign = organization?.currency_sign ?? '$'

  const queryRange = searchParams?.get('date_range')
  const initialRange = DATE_RANGE_OPTIONS.some(o => o.value === queryRange) ? queryRange! : 'last_30_days'

  const [dateRangeFilter, setDateRangeFilter] = useState(initialRange)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailDialog, setEmailDialog] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [integrationsLoaded, setIntegrationsLoaded] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) router.push('/login')
  }, [])

  const handleIntegrationsUpdated = useCallback((updated: Integration[]) => {
    setIntegrations(updated || [])
    setIntegrationsLoaded(true)
  }, [])

  const handleRefetch = useCallback(() => {
    // Child components handle their own data refetching
  }, [])

  const gtagPropertyIntegration = integrations.find(i => i.name === 'GTag Property')
  const isGtagPropertyConfigured = !!gtagPropertyIntegration && gtagPropertyIntegration.property?.status === 'completed'

  const exportToPDF = async () => {
    try {
      setExportingPDF(true)
      // html2canvas-pro instead of html2pdf.js: the bundled html2canvas 1.x
      // can't parse the lab()/color-mix() colors Tailwind v4 emits.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ])
      const element = document.querySelector('.dashboard-container') as HTMLElement | null
      if (!element) {
        toast.error('Dashboard not found')
        return
      }
      const width = element.scrollWidth
      const height = element.scrollHeight
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: width,
        windowHeight: height,
        ignoreElements: el => el.hasAttribute('data-html2canvas-ignore'),
        onclone: (doc: Document) => {
          // Hide the interactive controls row and show the PDF-only
          // "Date Range: ..." line on its own row above the charts.
          doc.querySelectorAll<HTMLElement>('[data-pdf-hide]').forEach(el => {
            el.style.display = 'none'
          })
          const pdfText = doc.getElementById('pdfOnlyText')
          if (pdfText) {
            pdfText.classList.remove('hidden')
            pdfText.style.display = 'flex'
          }
        },
      })
      // Size the page from the rendered canvas — the clone's height differs
      // slightly from the live DOM once the controls row is swapped.
      const pdfWidth = canvas.width / 3
      const pdfHeight = canvas.height / 3
      const pdf = new jsPDF({
        unit: 'px',
        format: [pdfWidth, pdfHeight],
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        hotfixes: ['px_scaling'],
      })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`dashboard-${Date.now()}.pdf`)
      toast.success('PDF exported successfully')
    } catch (e) {
      console.error(e)
      toast.error('PDF export failed')
    } finally {
      setExportingPDF(false)
    }
  }

  const sendPDFAsEmail = () => {
    setEmailDialog(true)
    setEmailInput('')
  }

  const confirmSendEmail = async () => {
    if (!emailInput || !/.+@.+\..+/.test(emailInput)) {
      toast.error('Please enter a valid email address')
      return
    }
    try {
      setSendingEmail(true)
      await postSecure(SECURE_ENDPOINTS.DASHBOARD_EMAIL_REPORT, {
        email: emailInput,
        organization_id: organization?.id,
        date_range: dateRangeFilter,
      })
      toast.success('PDF sent via email successfully')
      setEmailDialog(false)
      setEmailInput('')
    } catch (e) {
      console.error(e)
      toast.error('Failed to send PDF via email')
    } finally {
      setSendingEmail(false)
    }
  }

  const selectedRangeLabel = DATE_RANGE_OPTIONS.find(o => o.value === dateRangeFilter)?.label ?? ''

  return (
    <div>
      <div className="dashboard-container">
        <div className="w-full px-6 md:px-10 pb-8">
          {/* Export and Date Range Filter */}
          <div data-pdf-hide className="flex flex-col md:flex-row justify-between items-center pt-4 gap-4">
            <div className="flex gap-2.5 flex-col md:flex-row w-full md:w-auto">
              <button
                type="button"
                onClick={exportToPDF}
                disabled={exportingPDF}
                data-html2canvas-ignore="true"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
              >
                <FileText size={20} />
                {exportingPDF ? 'Exporting...' : 'Export as PDF'}
              </button>
              <button
                type="button"
                onClick={sendPDFAsEmail}
                disabled={sendingEmail}
                data-html2canvas-ignore="true"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
              >
                <Mail size={20} />
                Send PDF as Email
              </button>
            </div>
            <div className="flex justify-end mb-2 w-full md:w-auto">
              <select
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value)}
                className="date-range-filter border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-auto"
                style={{ maxWidth: 250 }}
                aria-label="Date Range"
              >
                {DATE_RANGE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PDF-only date range line: hidden on screen, revealed in the
              export clone (see exportToPDF onclone) on its own row. */}
          <div id="pdfOnlyText" className="hidden justify-end pt-4 pb-2">
            <div className="bg-white rounded px-4 py-2 text-center" style={{ color: '#6b7280' }}>
              <div className="date-range-filter-label">Date Range:</div>
              <span>{selectedRangeLabel}</span>
            </div>
          </div>

          {/* Site Setup Complete */}
          <SiteSetupComplete
            dateRangeFilter={dateRangeFilter}
            currencySign={currencySign}
            onRefetch={handleRefetch}
            onIntegrationsUpdated={handleIntegrationsUpdated}
          />

          {/* Leads & Revenue Overview */}
          <LeadsRevenueOverview dateRangeFilter={dateRangeFilter} currencySign={currencySign} />

          {/* Analytics Overview */}
          <AnalyticsOverview dateRangeFilter={dateRangeFilter} />

          {/* Conversion Charts Section (Gtag) */}
          <div>
            <div className="pb-2">
              <div className="flex justify-between items-center w-full">
                <div>
                  <div className="section-title mb-1">Conversion Analytics</div>
                  <div className="section-subtitle">Conversion insights by day and device</div>
                </div>
              </div>
            </div>
            <div className="py-4">
              {!integrationsLoaded ? (
                <div className="no-data-container" style={{ height: 400 }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="no-data-text mt-4">Loading conversion analytics...</p>
                  </div>
                </div>
              ) : !isGtagPropertyConfigured ? (
                <div className="no-data-container" style={{ height: 400 }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="no-data-icon-wrapper"><PieChart size={64} /></div>
                    <p className="no-data-text mt-4">Configure Gtag to see conversion analytics</p>
                    <p className="no-data-subtext">Set up your Gtag property to view conversion insights by day and device</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ConversionDayChart />
                  <ConversionDeviceChart />
                </div>
              )}
            </div>
          </div>

          {/* Page Speed Widget */}
          <PageSpeedWidget />
        </div>
      </div>

      {/* Email Dialog */}
      {emailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-[400px] w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Send PDF via Email</h3>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
              placeholder="Email Address"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEmailDialog(false); setEmailInput('') }}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSendEmail}
                disabled={!emailInput || !/.+@.+\..+/.test(emailInput) || sendingEmail}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
              >
                {sendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
