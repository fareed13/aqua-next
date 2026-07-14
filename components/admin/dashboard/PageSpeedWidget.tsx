'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gauge, AlertCircle, AlertTriangle, CheckCircle, Smartphone, Monitor, X } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DashPagination } from './DashPagination'

const METRICS: Record<string, { label: string; thresholds: [number, number] }> = {
  'largest-contentful-paint': { label: 'LCP', thresholds: [2500, 4000] },
  'interaction-to-next-paint': { label: 'INP', thresholds: [200, 500] },
  'total-blocking-time': { label: 'TBT', thresholds: [200, 600] },
  'speed-index': { label: 'SI', thresholds: [3400, 5800] },
  'server-response-time': { label: 'TTFB', thresholds: [800, 1800] },
  'cumulative-layout-shift': { label: 'CLS', thresholds: [0.1, 0.25] },
}

const PSI_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const IMPROVEMENTS_PER_PAGE = 10
const HISTORY_PER_PAGE = 10

interface PsiMetric {
  id: string
  label: string
  value: number | null
  display: string
}

interface Improvement {
  id: string
  title: string
  description: string
  displayValue: string
  score: number
  savings: string | null
  metricSavings: { key: string; ms: number }[]
  isOpportunity: boolean
}

interface StrategyResult {
  score: number
  metrics: PsiMetric[]
  improvements: Improvement[]
}

interface TestResult {
  id?: number | string
  url: string
  created_at?: string
  mobile: StrategyResult
  desktop: StrategyResult
}

function stripLinks(text: string) {
  return (text || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

function formatSavings(ms?: number, bytes?: number) {
  const parts: string[] = []
  if (ms !== undefined && ms >= 100) parts.push(ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`)
  if (bytes !== undefined && bytes >= 1024) parts.push(`${Math.round(bytes / 1024)} KiB`)
  return parts.length ? parts.join(' · ') : null
}

function scoreColor(score: number) {
  if (score >= 90) return '#4caf50'
  if (score >= 50) return '#ff9800'
  return '#f44336'
}

function scoreChipStyle(score: number) {
  const color = scoreColor(score)
  return { color: '#fff', background: color }
}

function metricColor(id: string, value: number | null) {
  if (value === null) return '#9ca3af'
  const [good, poor] = METRICS[id]?.thresholds ?? [0, 0]
  if (value <= good) return '#4caf50'
  if (value <= poor) return '#ff9800'
  return '#f44336'
}

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatImpact(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

async function fetchStrategy(url: string, strategy: 'mobile' | 'desktop', apiKey: string): Promise<StrategyResult> {
  const params = new URLSearchParams({ url, strategy })
  if (apiKey) params.set('key', apiKey)
  const res = await fetch(`${PSI_API}?${params}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const reason = body?.error?.errors?.[0]?.reason || body?.error?.status || ''
    if (res.status === 429 || reason === 'rateLimitExceeded' || reason === 'RATE_LIMIT_EXCEEDED') {
      const err: any = new Error('PageSpeed API quota exceeded. This usually means the API key is missing or invalid. Check that NEXT_PUBLIC_DEVELOPER_KEY is set correctly.')
      err.isQuotaError = true
      throw err
    }
    throw new Error(body?.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  const audits = data.lighthouseResult?.audits || {}
  const auditRefs = data.lighthouseResult?.categories?.performance?.auditRefs || []

  const score = Math.round((data.lighthouseResult?.categories?.performance?.score ?? 0) * 100)

  const metrics: PsiMetric[] = Object.entries(METRICS).map(([id, cfg]) => ({
    id,
    label: cfg.label,
    value: audits[id]?.numericValue ?? null,
    display: audits[id]?.displayValue ?? '—',
  }))

  const seen = new Set<string>()
  const improvements: Improvement[] = []
  for (const ref of auditRefs) {
    const audit = audits[ref.id]
    if (!audit || seen.has(ref.id)) continue
    seen.add(ref.id)
    if (audit.score === null || audit.score >= 0.9) continue
    if (['not_applicable', 'informative', 'manual'].includes(audit.scoreDisplayMode)) continue
    if (!audit.title) continue

    const metricSavings = Object.entries(audit.metricSavings || {})
      .filter(([, v]) => (v as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([key, ms]) => ({ key, ms: ms as number }))

    improvements.push({
      id: audit.id,
      title: audit.title,
      description: stripLinks(audit.description),
      displayValue: audit.displayValue || '',
      score: audit.score ?? 0,
      savings: formatSavings(audit.details?.overallSavingsMs, audit.details?.overallSavingsBytes),
      metricSavings,
      isOpportunity: audit.details?.type === 'opportunity',
    })
  }

  improvements.sort((a, b) => {
    const aCrit = a.score < 0.5 ? 0 : 1
    const bCrit = b.score < 0.5 ? 0 : 1
    if (aCrit !== bCrit) return aCrit - bCrit
    if (a.isOpportunity !== b.isOpportunity) return a.isOpportunity ? -1 : 1
    return (a.score ?? 0) - (b.score ?? 0)
  })
  return { score, metrics, improvements }
}

function ScoreCircle({ score }: { score: number }) {
  return (
    <svg width="96" height="96" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="50" cy="50" r="40" fill="none"
        stroke={scoreColor(score)} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${score * 2.513} 251.3`}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="700" fill={scoreColor(score)}>{score}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#9ca3af">/ 100</text>
    </svg>
  )
}

function MetricRows({ metrics }: { metrics: PsiMetric[] }) {
  return (
    <div className="psi-metrics-list">
      {metrics.map(metric => (
        <div key={metric.id} className="psi-metric-row">
          <span className="psi-metric-label">{metric.label}</span>
          <span className="psi-metric-value" style={{ color: metricColor(metric.id, metric.value) }}>
            {metric.display}
          </span>
        </div>
      ))}
    </div>
  )
}

function ImprovementPanel({ item }: { item: Improvement }) {
  const critical = item.score < 0.5
  return (
    <details className={critical ? 'psi-panel-error' : 'psi-panel-warning'}>
      <summary className="psi-panel-title">
        {critical
          ? <AlertCircle size={18} color="#f44336" className="flex-shrink-0" />
          : <AlertTriangle size={18} color="#ff9800" className="flex-shrink-0" />}
        <span className="psi-panel-label">{item.title}</span>
        {item.savings && <span className="psi-savings-badge">Save {item.savings}</span>}
        <span className="psi-affects-chips">
          {item.metricSavings.map(m => (
            <span key={m.key} className="psi-affects-chip">{m.key}</span>
          ))}
        </span>
      </summary>
      <div className="psi-panel-description">
        {item.description}
        {item.displayValue && <div className="psi-panel-value mt-2">Current: {item.displayValue}</div>}
        {item.metricSavings.length > 0 && (
          <div className="psi-panel-impact mt-2">
            <span className="psi-impact-label">Est. impact:</span>
            {item.metricSavings.map(m => (
              <span key={m.key} className="psi-impact-chip">{m.key} −{formatImpact(m.ms)}</span>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}

function ImprovementsList({ improvements, page, onPageChange, total }: {
  improvements: Improvement[]
  page: number
  onPageChange: (page: number) => void
  total: number
}) {
  if (!total) {
    return (
      <div className="flex items-center justify-center p-6 text-sm font-semibold" style={{ color: '#4caf50' }}>
        <CheckCircle size={32} color="#4caf50" />
        <span className="ml-2">No issues found — great score!</span>
      </div>
    )
  }
  const paged = improvements.slice((page - 1) * IMPROVEMENTS_PER_PAGE, page * IMPROVEMENTS_PER_PAGE)
  const critical = paged.filter(i => i.score < 0.5)
  const warnings = paged.filter(i => i.score >= 0.5)
  const totalPages = Math.ceil(total / IMPROVEMENTS_PER_PAGE)

  return (
    <div>
      {critical.length > 0 && (
        <>
          <div className="psi-group-header psi-group-header--critical">
            <AlertCircle size={14} color="#f44336" /> Critical Issues
          </div>
          <div className="mb-2">
            {critical.map(item => <ImprovementPanel key={item.id} item={item} />)}
          </div>
        </>
      )}
      {critical.length > 0 && warnings.length > 0 && <hr className="my-3 border-gray-200" />}
      {warnings.length > 0 && (
        <>
          <div className="psi-group-header psi-group-header--warning">
            <AlertTriangle size={14} color="#ff9800" /> Warnings
          </div>
          <div>
            {warnings.map(item => <ImprovementPanel key={item.id} item={item} />)}
          </div>
        </>
      )}
      {totalPages > 1 && (
        <div className="psi-pagination-row">
          <span className="psi-pagination-info">
            {(page - 1) * IMPROVEMENTS_PER_PAGE + 1}–{Math.min(page * IMPROVEMENTS_PER_PAGE, total)} of {total}
          </span>
          <DashPagination page={page} length={totalPages} onChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

export function PageSpeedWidget() {
  const organization = useOrgStore(s => s.organization)
  const domain = useOrgStore(s => s.domain)
  const { getSecure, postSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<TestResult[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyDialog, setHistoryDialog] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)
  const [dialogTab, setDialogTab] = useState<'mobile' | 'desktop'>('mobile')
  const [dialogMobilePage, setDialogMobilePage] = useState(1)
  const [dialogDesktopPage, setDialogDesktopPage] = useState(1)

  const host = (organization as any)?.canonical_domain || domain
  const siteUrl = host ? (host.startsWith('http') ? host : `https://${host}`) : null

  const latestResult = history[0] || null
  const paginatedHistory = history.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE)
  const totalHistoryPages = Math.ceil(history.length / HISTORY_PER_PAGE)

  const loadHistory = useCallback(async (params: Record<string, string> = {}) => {
    try {
      const data = await getSecure<TestResult[]>(SECURE_ENDPOINTS.PAGE_SPEED_RESULTS, params)
      setHistory(data || [])
    } catch {
      setHistory([])
    }
  }, [getSecure])

  useEffect(() => { loadHistory() }, [])

  const filterHistory = async () => {
    setHistoryLoading(true)
    setHistoryPage(1)
    await loadHistory({
      ...(dateFrom && { from_date: dateFrom }),
      ...(dateTo && { to_date: dateTo }),
    })
    setHistoryLoading(false)
  }

  const clearFilter = () => {
    setDateFrom('')
    setDateTo('')
    setHistoryPage(1)
    loadHistory()
  }

  const runTest = async () => {
    if (!siteUrl) return
    setLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_DEVELOPER_KEY || ''
      if (!apiKey) {
        toast.error('PageSpeed API key (NEXT_PUBLIC_DEVELOPER_KEY) is not configured.')
        return
      }
      const [mobile, desktop] = await Promise.all([
        fetchStrategy(siteUrl, 'mobile', apiKey),
        fetchStrategy(siteUrl, 'desktop', apiKey),
      ])
      const saved = await postSecure<TestResult>(SECURE_ENDPOINTS.PAGE_SPEED_RESULTS, {
        url: siteUrl,
        mobile,
        desktop,
      })
      if (saved) {
        setHistory(h => [saved, ...h].slice(0, 7))
      }
    } catch (err: any) {
      if (err?.isQuotaError) {
        toast.error(err.message, { duration: 8000 })
      } else {
        setError(err?.message || 'Test failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectHistoryTest = (idx: number) => {
    setSelectedTest(history[idx])
    setDialogTab('mobile')
    setDialogMobilePage(1)
    setDialogDesktopPage(1)
    setHistoryDialog(true)
  }

  const issueCountClass = (test: TestResult) => {
    const total = test.mobile.improvements.length + test.desktop.improvements.length
    if (total === 0) return 'psi-issues-ok'
    if (total <= 5) return 'psi-issues-warn'
    return 'psi-issues-bad'
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center w-full">
        <div>
          <div className="section-title mb-1">Page Speed</div>
          <div className="section-subtitle">Performance scores for mobile and desktop</div>
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={!siteUrl || loading}
          data-html2canvas-ignore="true"
          className="mr-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
        >
          <Gauge size={18} />
          {loading ? 'Running...' : 'Run Test'}
        </button>
      </div>

      <div className="py-4">
        {!siteUrl ? (
          <div className="no-data-container" style={{ height: 200 }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="no-data-icon-wrapper"><Gauge size={64} /></div>
              <p className="no-data-text mt-4">No website configured</p>
              <p className="no-data-subtext">Set up your domain to run page speed tests</p>
            </div>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="no-data-container mb-4" style={{ height: 200 }}>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="no-data-text mt-4">Running speed test...</p>
                  <p className="no-data-subtext">This may take up to 30 seconds</p>
                </div>
              </div>
            ) : error ? (
              <div className="no-data-container mb-4" style={{ height: 180 }}>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="no-data-icon-wrapper"><AlertCircle size={48} /></div>
                  <p className="no-data-text mt-3">Test failed</p>
                  <p className="no-data-subtext">{error}</p>
                  <button type="button" onClick={runTest} className="mt-2 text-blue-600 text-sm font-medium">Retry</button>
                </div>
              </div>
            ) : latestResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(['mobile', 'desktop'] as const).map(strategy => (
                  <div key={strategy} className="modern-metric-card">
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        {strategy === 'mobile' ? <Smartphone size={20} className="mr-2" /> : <Monitor size={20} className="mr-2" />}
                        <span className="section-title" style={{ fontSize: 15 }}>
                          {strategy === 'mobile' ? 'Mobile' : 'Desktop'}
                        </span>
                        <span className="ml-auto section-subtitle" style={{ fontSize: 11 }}>
                          {formatDate(latestResult.created_at)}
                        </span>
                      </div>
                      <div className="psi-score-row">
                        <div className="psi-score-circle-wrapper">
                          <ScoreCircle score={latestResult[strategy].score} />
                        </div>
                        <MetricRows metrics={latestResult[strategy].metrics} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-container mb-4" style={{ height: 180 }}>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="no-data-icon-wrapper"><Gauge size={64} /></div>
                  <p className="no-data-text mt-4">No tests run yet</p>
                  <p className="no-data-subtext">Click &quot;Run Test&quot; to check your site speed</p>
                </div>
              </div>
            )}

            {(history.length > 0 || dateFrom || dateTo) && (
              <div className="modern-card">
                <div className="p-4 pb-2">
                  <div className="psi-history-header">
                    <div className="section-title" style={{ fontSize: 15 }}>Recent Tests</div>
                    <div className="psi-filter-row" data-html2canvas-ignore="true">
                      <input type="date" className="psi-date-field" value={dateFrom} max={dateTo || undefined}
                        onChange={e => setDateFrom(e.target.value)} aria-label="From" />
                      <input type="date" className="psi-date-field" value={dateTo} min={dateFrom || undefined}
                        onChange={e => setDateTo(e.target.value)} aria-label="To" />
                      <div className="psi-filter-actions">
                        <button type="button" onClick={filterHistory} disabled={historyLoading}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50">
                          {historyLoading ? 'Filtering...' : 'Filter'}
                        </button>
                        {(dateFrom || dateTo) && (
                          <button type="button" onClick={clearFilter} className="px-3 py-1.5 text-sm text-gray-600">
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="psi-table-header">Date &amp; Time</th>
                        <th className="psi-table-header">URL</th>
                        <th className="psi-table-header text-center">Mobile</th>
                        <th className="psi-table-header text-center">Desktop</th>
                        <th className="psi-table-header text-center">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!history.length && (
                        <tr>
                          <td colSpan={5} className="psi-table-cell text-center" style={{ color: '#9ca3af', padding: 24 }}>
                            No tests found for the selected date range
                          </td>
                        </tr>
                      )}
                      {paginatedHistory.map((test, idx) => {
                        const isLatest = idx === 0 && historyPage === 1 && !dateFrom && !dateTo
                        return (
                          <tr
                            key={test.id ?? idx}
                            className={`psi-history-row ${isLatest ? 'psi-latest-row' : ''}`}
                            onClick={() => selectHistoryTest((historyPage - 1) * HISTORY_PER_PAGE + idx)}
                          >
                            <td className="psi-table-cell">
                              {isLatest && <span className="psi-latest-badge">Latest</span>}
                              {formatDate(test.created_at)}
                            </td>
                            <td className="psi-table-cell psi-url-cell">{test.url}</td>
                            <td className="psi-table-cell text-center">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={scoreChipStyle(test.mobile.score)}>
                                {test.mobile.score}
                              </span>
                            </td>
                            <td className="psi-table-cell text-center">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={scoreChipStyle(test.desktop.score)}>
                                {test.desktop.score}
                              </span>
                            </td>
                            <td className="psi-table-cell text-center">
                              <span className={`psi-issues-count ${issueCountClass(test)}`}>
                                {test.mobile.improvements.length + test.desktop.improvements.length}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {totalHistoryPages > 1 && (
                    <div className="psi-pagination-row p-3">
                      <span className="psi-pagination-info">
                        {(historyPage - 1) * HISTORY_PER_PAGE + 1}–{Math.min(historyPage * HISTORY_PER_PAGE, history.length)} of {history.length}
                      </span>
                      <DashPagination page={historyPage} length={totalHistoryPages} onChange={setHistoryPage} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History detail dialog */}
      {historyDialog && selectedTest && (
        <div className="psi-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center p-4 border-b border-gray-100">
              <Gauge size={20} className="mr-2" />
              <span className="font-semibold">Test from {formatDate(selectedTest.created_at)}</span>
              <button type="button" onClick={() => setHistoryDialog(false)}
                className="ml-auto text-gray-500 hover:text-gray-700 p-1" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(['mobile', 'desktop'] as const).map(strategy => (
                  <div key={strategy} className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="text-center mb-3">
                      <div className="text-sm text-gray-500 mb-2">{strategy === 'mobile' ? 'Mobile' : 'Desktop'}</div>
                      <span className="text-lg font-bold px-6 py-1 rounded-full inline-block"
                        style={scoreChipStyle(selectedTest[strategy].score)}>
                        {selectedTest[strategy].score}
                      </span>
                    </div>
                    <MetricRows metrics={selectedTest[strategy].metrics} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                {(['mobile', 'desktop'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDialogTab(tab)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${dialogTab === tab ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {tab === 'mobile' ? 'Mobile' : 'Desktop'} Issues ({selectedTest[tab].improvements.length})
                  </button>
                ))}
              </div>
              {dialogTab === 'mobile' ? (
                <ImprovementsList
                  improvements={selectedTest.mobile.improvements}
                  total={selectedTest.mobile.improvements.length}
                  page={dialogMobilePage}
                  onPageChange={setDialogMobilePage}
                />
              ) : (
                <ImprovementsList
                  improvements={selectedTest.desktop.improvements}
                  total={selectedTest.desktop.improvements.length}
                  page={dialogDesktopPage}
                  onPageChange={setDialogDesktopPage}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
