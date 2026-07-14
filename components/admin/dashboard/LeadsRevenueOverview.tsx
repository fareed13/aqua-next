'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Metric {
  id: number
  label: string
  value: number
  previousValue: number
  change: number
  tooltip: string
  isCurrency?: boolean
}

interface Props {
  dateRangeFilter: string
  currencySign: string
}

const DEFAULT_LABELS = ['Revenue', 'Leads', 'Appointments', 'Trials', 'Event Purchases', 'Gift Card Purchases']

function mapLeadRevenueStatsToMetrics(data: any): Metric[] {
  const mapped: Metric[] = []
  const push = (id: number, label: string, stats: any, tooltip: string, isCurrency = false) => {
    mapped.push({
      id,
      label,
      value: stats.current || 0,
      previousValue: stats.previous || 0,
      change: stats.percentage_change,
      tooltip,
      isCurrency,
    })
  }

  if (data?.customer_statistics) {
    const cs = data.customer_statistics
    if (cs?.leads !== undefined) push(1, 'Leads', cs.leads, 'Number of leads added in the selected period')
    if (cs?.trials !== undefined) push(2, 'Trials', cs.trials, 'Number of trials purchased in the selected period')
    if (cs?.members !== undefined) push(3, 'Members', cs.members, 'Number of members added in the selected period')
  }
  if (data?.appointment_statistics) push(4, 'Appointments', data.appointment_statistics, 'Number of appointments scheduled in the selected period')
  if (data?.reserved_class_statistics) push(5, 'Reserved Classes', data.reserved_class_statistics, 'Number of reserved classes in the selected period')
  if (data?.event_purchase_statistics) push(6, 'Event Purchases', data.event_purchase_statistics, 'Number of event purchases made in the selected period')
  if (data?.gift_card_statistics) push(7, 'Gift Card Purchases', data.gift_card_statistics, 'Number of gift cards purchased in the selected period')
  if (data?.revenue_statistics) push(8, 'Revenue', data.revenue_statistics, 'Total revenue generated in the selected period', true)
  return mapped
}

function formatNumber(num: number) {
  return num.toLocaleString('en-US')
}

function formatPercentageChange(value: number) {
  const numValue = parseFloat(String(value))
  if (isNaN(numValue)) return '0.00%'
  const sign = numValue >= 0 ? '+' : ''
  return `${sign}${numValue.toFixed(2)}%`
}

export function LeadsRevenueOverview({ dateRangeFilter, currencySign }: Props) {
  const { getSecure } = useSecureCalls()

  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [emptyMessage, setEmptyMessage] = useState('')
  const [emptySubtitle, setEmptySubtitle] = useState('')
  const [showAllMetrics, setShowAllMetrics] = useState(false)

  useEffect(() => {
    const fetchLeadRevenueStats = async () => {
      setLoading(true)
      setEmptyMessage('')
      setEmptySubtitle('')
      try {
        const response = await getSecure(SECURE_ENDPOINTS.DASHBOARD_LEAD_REVENUE_STATS, {
          date_range: dateRangeFilter,
        })
        const mapped = mapLeadRevenueStatsToMetrics(response)
        setMetrics(mapped)
        if (!mapped.length) {
          setEmptyMessage('No data available')
          setEmptySubtitle('No lead or revenue metrics found for the selected period')
        }
      } catch (error) {
        console.error('Error fetching lead revenue stats:', error)
        setEmptyMessage('Error fetching lead revenue stats')
        setEmptySubtitle('Please try again later')
      } finally {
        setLoading(false)
      }
    }
    fetchLeadRevenueStats()
  }, [dateRangeFilter])

  const orderedDefaults = DEFAULT_LABELS
    .map(label => metrics.find(m => m.label === label))
    .filter((m): m is Metric => !!m)
  const otherMetrics = metrics.filter(m => !DEFAULT_LABELS.includes(m.label))
  const displayedMetrics = showAllMetrics ? [...orderedDefaults, ...otherMetrics] : orderedDefaults
  const hasMoreMetrics = metrics.length > DEFAULT_LABELS.length

  return (
    <div className="mb-6">
      <div className="pb-3">
        <div className="section-title">Leads & Revenue Overview</div>
      </div>
      <div>
        {loading ? (
          <div className="metrics-skeleton-loader">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }, (_, n) => (
                <div key={n} className="modern-metric-card" style={{ height: 150 }}>
                  <div className="p-4">
                    <div className="custom-skeleton-text mb-2" style={{ width: '60%' }} />
                    <div className="custom-skeleton-text mb-2" style={{ width: '80%' }} />
                    <div className="custom-skeleton-text mb-2" style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : emptyMessage ? (
          <div className="no-data-container" style={{ height: 300 }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="no-data-icon-wrapper"><BarChart3 size={64} /></div>
              <p className="no-data-text mt-4">{emptyMessage}</p>
              <p className="no-data-subtext">{emptySubtitle}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
              {displayedMetrics.map(metric => (
                <div key={metric.id} className="metric-card modern-metric-card">
                  <div className="p-4">
                    <div className="metric-content">
                      <div className="metric-values-row" title={metric.tooltip}>
                        {metric.label === 'Revenue' && <sup className="currency-symbol">{currencySign}</sup>}
                        <span className="metric-current-value">{formatNumber(metric.value)}</span>
                        <span className="metric-separator">/</span>
                        <span className="metric-previous-value">{formatNumber(metric.previousValue || 0)}</span>
                      </div>
                      <div className="metric-label mt-2">{metric.label}</div>
                      <div className="metric-period-label mt-1">Current/Previous</div>
                      <div className="flex items-center mt-3 justify-center">
                        <div className={`metric-change-badge ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                          {metric.change >= 0
                            ? <TrendingUp size={16} color="#2e7d32" />
                            : <TrendingDown size={16} color="#c62828" />}
                          <span className="metric-change-text">{formatPercentageChange(metric.change)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMoreMetrics && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setShowAllMetrics(v => !v)}
                  className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 rounded px-3 py-1.5 text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {showAllMetrics ? 'See Less' : 'See More'}
                  {showAllMetrics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
