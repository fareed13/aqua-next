'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, BarChart3 } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'
import { DashPagination } from './DashPagination'

interface Props {
  dateRangeFilter: string
}

const PROGRAMS_PER_PAGE = 8

function getPercentage(value: number, totalValue: number) {
  if (!totalValue) return '0.0'
  return String(Math.round((value / totalValue) * 1000) / 10)
}

function formatDateShort(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AnalyticsOverview({ dateRangeFilter }: Props) {
  const { getSecure } = useSecureCalls()

  const [analyticsGraph, setAnalyticsGraph] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorSubtitle, setErrorSubtitle] = useState('')
  const [abbiAnalyticsEnabled, setAbbiAnalyticsEnabled] = useState(false)
  const [programsPage, setProgramsPage] = useState(1)

  const analyticsData = useMemo(() => {
    if (!analyticsGraph) return null
    if (analyticsGraph.analytics) return analyticsGraph.analytics
    if (analyticsGraph.programs || analyticsGraph.users_series) return analyticsGraph
    return null
  }, [analyticsGraph])

  useEffect(() => {
    const checkAbbiAnalyticsStatus = async () => {
      try {
        const response: any = await getSecure(SECURE_ENDPOINTS.DASHBOARD_COMPLETION_PERCENTAGE)
        const status = response?.properties?.abbi_analytics_enabled?.status
        setAbbiAnalyticsEnabled(status === 'enabled')
      } catch (error) {
        console.error('Error checking Abbi Analytics status:', error)
      }
    }
    checkAbbiAnalyticsStatus()
  }, [])

  useEffect(() => {
    const fetchAnalyticsGraph = async () => {
      setLoading(true)
      try {
        const params: Record<string, string> = {}
        if (dateRangeFilter) params.date_range = dateRangeFilter
        const response: any = await getSecure(SECURE_ENDPOINTS.DASHBOARD_ANALYTICS_STATS, params)
        setAnalyticsGraph(response)
        const data = response?.analytics ?? ((response?.programs || response?.users_series) ? response : null)
        if (!data) {
          setErrorMessage('No analytics data available')
          setErrorSubtitle('Analytics data will appear here once available')
        } else {
          setErrorMessage('')
          setErrorSubtitle('')
        }
        setProgramsPage(1)
      } catch (error) {
        console.error('Error fetching analytics graph:', error)
        setErrorMessage('Error fetching analytics graph')
        setErrorSubtitle('Please try again later')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyticsGraph()
  }, [dateRangeFilter])

  const usersChartOptions = useMemo(() => {
    const series = analyticsData?.users_series
    if (!series || Object.keys(series).length === 0) return null
    const entries = Object.entries(series)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    return {
      chart: { type: 'spline', height: 350, backgroundColor: 'transparent', spacing: [20, 20, 20, 20] },
      title: { text: '' },
      credits: { enabled: false },
      xAxis: {
        categories: entries.map(([date]) => formatDateShort(date)),
        title: { text: null },
        gridLineColor: '#e0e0e0',
        lineColor: '#e0e0e0',
        labels: { style: { color: '#757575', fontSize: '12px' }, rotation: -45 },
      },
      yAxis: {
        title: { text: 'Visitors' },
        gridLineColor: '#f0f0f0',
        labels: { style: { color: '#757575', fontSize: '12px' } },
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderRadius: 6,
        borderWidth: 1,
      },
      plotOptions: {
        spline: {
          marker: { radius: 4, lineColor: '#666666', lineWidth: 1 },
          lineWidth: 2,
          color: '#2196F3',
        },
      },
      legend: { enabled: false },
      series: [{ name: 'Users', data: entries.map(([, count]) => count) }],
    } as any
  }, [analyticsData])

  const programs: { program_name: string; count: number }[] = useMemo(() => (
    Array.isArray(analyticsData?.programs) ? analyticsData.programs : []
  ), [analyticsData])

  const perPage = programs.length <= PROGRAMS_PER_PAGE ? programs.length || PROGRAMS_PER_PAGE : PROGRAMS_PER_PAGE
  const programsStart = (programsPage - 1) * perPage
  const programsEnd = Math.min(programsPage * perPage, programs.length)
  const totalProgramPages = Math.ceil(programs.length / perPage)

  const programsChartOptions = useMemo(() => {
    if (!programs.length) return null
    const pagePrograms = programs.slice(programsStart, programsEnd)
    return {
      chart: { type: 'bar', height: 400, backgroundColor: 'transparent', spacing: [20, 20, 20, 20] },
      title: { text: '' },
      credits: { enabled: false },
      xAxis: {
        categories: pagePrograms.map(p => p.program_name),
        title: { text: null },
        gridLineColor: '#e0e0e0',
        lineColor: '#e0e0e0',
        labels: { style: { color: '#757575', fontSize: '11px' }, rotation: -45 },
      },
      yAxis: {
        title: { text: 'Visitors' },
        gridLineColor: '#f0f0f0',
        labels: { style: { color: '#757575', fontSize: '12px' } },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderRadius: 6,
        borderWidth: 1,
      },
      plotOptions: {
        series: { borderWidth: 0, pointWidth: 20, allowPointSelect: true, color: '#4CAF50' },
      },
      legend: { enabled: false },
      series: [{ name: 'Programs', data: pagePrograms.map(p => p.count) }],
    } as any
  }, [programs, programsStart, programsEnd])

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center w-full">
        <div>
          <div className="section-title mb-1">Analytics Overview</div>
          <div className="section-subtitle">Users and program performance insights</div>
        </div>
      </div>
      <div className="py-4">
        {loading ? (
          <div className="analytics-skeleton-loader">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 modern-card">
                <div className="p-4 pb-2"><div className="custom-skeleton-text" style={{ width: 150 }} /></div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }, (_, n) => (
                      <div key={n}>
                        <div className="custom-skeleton-text mb-1" style={{ width: '60%' }} />
                        <div className="custom-skeleton-text" style={{ width: '40%' }} />
                      </div>
                    ))}
                  </div>
                  <div className="custom-skeleton-chart" style={{ height: 350 }} />
                </div>
              </div>
              <div className="modern-card">
                <div className="p-4 pb-2"><div className="custom-skeleton-text" style={{ width: 100 }} /></div>
                <div className="p-4"><div className="custom-skeleton-chart" style={{ height: 400 }} /></div>
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="no-data-container" style={{ height: 500 }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="no-data-icon-wrapper"><LineChart size={64} /></div>
              <p className="no-data-text mt-4">{errorMessage}</p>
              <p className="no-data-subtext">{errorSubtitle}</p>
            </div>
          </div>
        ) : !abbiAnalyticsEnabled ? (
          <div className="no-data-container" style={{ height: 500 }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="no-data-icon-wrapper"><LineChart size={80} /></div>
              <p className="no-data-text mt-4">No analytics data available</p>
              <p className="no-data-subtext">Enable Abbi Analytics to view user and programs</p>
            </div>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Users Chart (Spline) */}
            <div className="md:col-span-2 modern-card">
              <div className="p-4 pb-2">
                <div className="section-title">Visitors Over Time</div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="analytics-stat-label">Visitors</div>
                    <div className="analytics-stat-value">{analyticsData.total_users || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="analytics-stat-label">Leads</div>
                    <div className="analytics-stat-value">{analyticsData.total_leads || 0}</div>
                    {!!analyticsData.total_users && (
                      <div className="analytics-stat-percentage">
                        {getPercentage(analyticsData.total_leads, analyticsData.total_users)}%
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="analytics-stat-label">Trials</div>
                    <div className="analytics-stat-value">{analyticsData.total_purchases || 0}</div>
                    {!!analyticsData.total_users && (
                      <div className="analytics-stat-percentage">
                        {getPercentage(analyticsData.total_purchases, analyticsData.total_users)}%
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="analytics-stat-label">Returning</div>
                    <div className="analytics-stat-value">{analyticsData.returning_users || 0}</div>
                    {!!analyticsData.total_users && (
                      <div className="analytics-stat-percentage">
                        {getPercentage(analyticsData.returning_users, analyticsData.total_users)}%
                      </div>
                    )}
                  </div>
                </div>
                {usersChartOptions ? (
                  <div className="chart-container">
                    <HighchartsChart options={usersChartOptions} />
                  </div>
                ) : (
                  <div className="no-data-container" style={{ height: 300 }}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="no-data-icon-wrapper"><LineChart size={64} /></div>
                      <p className="no-data-text mt-3">No user data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Programs Chart (Bar) */}
            <div className="modern-card h-full flex flex-col justify-between">
              <div className="p-4 pb-2">
                <div className="section-title">Programs</div>
              </div>
              <div className="p-4">
                {programsChartOptions ? (
                  <div className="chart-container">
                    <HighchartsChart options={programsChartOptions} />
                    {programs.length > PROGRAMS_PER_PAGE && (
                      <div className="flex justify-end items-center mt-3 gap-3">
                        <div className="text-xs text-gray-500">
                          {programsStart + 1} - {programsEnd} / {programs.length}
                        </div>
                        <DashPagination page={programsPage} length={totalProgramPages} onChange={setProgramsPage} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-data-container" style={{ height: 370 }}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="no-data-icon-wrapper"><BarChart3 size={64} /></div>
                      <p className="no-data-text mt-3">No program data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
