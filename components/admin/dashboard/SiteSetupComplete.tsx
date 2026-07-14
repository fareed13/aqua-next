'use client'

import { useState, useEffect, useCallback, useMemo, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import {
  MonitorSmartphone, Target, LineChart, Zap, Newspaper, User, ShieldCheck,
  BarChart3, CheckCircle, AlertTriangle, AlertCircle, HeartPulse, Globe,
} from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'
import { DashboardConfigDialogue, type ConfigDialogType } from './DashboardConfigDialogue'

interface LoadingState {
  loading: boolean
  message: string
  subtitle: string
}

interface Integration {
  name: string
  Icon: ComponentType<{ size?: number | string; className?: string }>
  status: 'active' | 'inactive'
  property: any
  showLocationDetails?: boolean
  locationDetails?: {
    total_locations: number
    valid_count: number
    missing_count: number
    missing_locations: any[]
    valid_locations: any[]
  }
}

interface Recommendation {
  id: number
  type: 'warning' | 'error'
  message: string
  subtitle?: string
  hideFixButton?: boolean
}

interface Props {
  dateRangeFilter: string
  currencySign: string
  onRefetch: () => void
  onIntegrationsUpdated: (integrations: Integration[]) => void
}

const GTAG_PROPERTY_STEPS = [
  'Go to Google Analytics',
  'Navigate to Admin',
  'Select Property',
  'Go to Property Access Management',
  'Click Add Property',
  'Save the changes',
]

function getIntegrationStatus(property: any): 'active' | 'inactive' {
  if (!property) return 'inactive'
  const status = property.status
  if (status === 'disabled') return 'inactive'
  if (status === 'completed' || status === 'enabled') return 'active'
  return 'inactive'
}

function mapPropertiesToIntegrations(properties: any): Integration[] {
  const integrationMap = [
    { name: 'PWA', Icon: MonitorSmartphone, property: properties.pwa_enabled },
    { name: 'Ads', Icon: Target, property: properties.fb_ad_account },
    { name: 'GTag', Icon: LineChart, property: properties.gtag },
    { name: 'Pixel', Icon: Zap, property: properties.pixel },
    { name: 'Blogs', Icon: Newspaper, property: properties.last_blog_check },
    { name: 'Payment', Icon: User, property: properties.active_payment_method },
    { name: 'reCAPTCHA', Icon: ShieldCheck, property: properties.recaptcha_enabled },
    { name: 'GTag Property', Icon: LineChart, property: properties.gtag_property },
    { name: 'GMB Posting', Icon: Globe, property: properties.gmb_ai_post },
    { name: 'Abbi Analytics', Icon: BarChart3, property: properties.abbi_analytics_enabled },
  ]

  return integrationMap.map(integration => {
    const integrationData: Integration = {
      name: integration.name,
      Icon: integration.Icon,
      status: getIntegrationStatus(integration.property),
      property: integration.property,
    }

    if (integration.name === 'Payment' && integration.property?.details) {
      integrationData.showLocationDetails = true
      integrationData.locationDetails = {
        total_locations: integration.property.details.total_locations || 0,
        valid_count: integration.property.details.valid_locations?.length || 0,
        missing_count: integration.property.details.missing_count || 0,
        missing_locations: integration.property.details.missing_locations || [],
        valid_locations: integration.property.details.valid_locations || [],
      }
    }

    return integrationData
  })
}

function generateRecommendations(properties: any): Recommendation[] {
  const generated: Recommendation[] = []
  let recommendationId = 1

  if (properties.active_payment_method?.status === 'disabled') {
    const missingCount = properties.active_payment_method?.details?.missing_count || 0
    const missingLocations = properties.active_payment_method?.details?.missing_locations || []

    if (missingCount > 0 && missingLocations.length > 0) {
      const cities = missingLocations.map((loc: any) => loc.location_name?.split(' ')[0] || 'Unknown')
      const uniqueCities = [...new Set(cities)]
      const cityMessage = uniqueCities.length ? ` (${uniqueCities.join(', ')})` : ''
      generated.push({
        id: recommendationId++,
        type: 'error',
        message: `Payment method missing for ${missingCount} location${missingCount > 1 ? 's' : ''}${cityMessage}.`,
        subtitle: 'Enabling this allows users to purchase paid plans and trials without interruption.',
      })
    } else if (missingCount > 0) {
      generated.push({
        id: recommendationId++,
        type: 'error',
        message: `Payment method missing for ${missingCount} location${missingCount > 1 ? 's' : ''}.`,
        subtitle: 'Enabling this allows users to purchase paid plans and trials without interruption.',
      })
    } else {
      generated.push({
        id: recommendationId++,
        type: 'warning',
        message: 'Payment method not configured.',
        subtitle: 'Enabling this allows users to purchase paid plans and trials without interruption.',
      })
    }
  } else if (properties.active_payment_method?.status === 'missing') {
    generated.push({
      id: recommendationId++,
      type: 'error',
      message: 'Payment method not configured for any location.',
      subtitle: 'Enabling this allows users to purchase paid plans and trials without interruption.',
    })
  }

  if (properties.gtag?.status !== 'completed') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'GTag not configured.',
      subtitle: 'Turning this on helps you understand visitor actions, optimize your services, and make data-driven decisions.',
    })
  }
  if (properties.pixel?.status !== 'completed') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'Meta Pixel not detected.',
      subtitle: 'Enables retargeting campaigns and provides valuable insights on your business dashboard. Helps improve ad targeting and user engagement.',
    })
  }
  if (properties.recaptcha_enabled?.status !== 'enabled') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'reCAPTCHA not enabled.',
      subtitle: 'Protects your site from spam and bots. Ensures only human users interact with your forms or checkout.',
    })
  }
  if (properties.pwa_enabled?.status !== 'enabled') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'Progressive Web App (PWA) not enabled.',
      subtitle: 'Converts your website into an app-like experience on desktop.',
    })
  }
  if (properties.abbi_analytics_enabled?.status === 'disabled') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'Abbi Analytics not enabled.',
      subtitle: 'Enables dashboard reporting with metrics like visitors over time and most popular programs. Provides actionable insights for growth.',
    })
  }

  const blogCheck = properties.last_blog_check
  if (blogCheck) {
    if (blogCheck.status === 'missing') {
      generated.push({
        id: recommendationId++,
        type: 'warning',
        message: 'Publish blogs for better SEO.',
        subtitle: 'Regular blog posts improve search engine ranking, drive organic traffic, and showcase your expertise. This is flagged because no blogs were posted in the last 60 days.',
      })
    } else if (blogCheck.status === 'warn' && blogCheck.details?.blog_count_last_60_days !== undefined && blogCheck.details.blog_count_last_60_days < 4) {
      generated.push({
        id: recommendationId++,
        type: 'warning',
        message: 'Publish blogs for better SEO.',
        subtitle: 'Regular blog posts improve search engine ranking, drive organic traffic, and showcase your expertise. This is flagged because the number of blogs posted in the last 60 days is less than 4.',
      })
    }
  }

  if (properties.gtag_property?.status !== 'completed') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'Gtag property not configured.',
      subtitle: 'Essential for tracking conversions and user behavior. Configuring this allows accurate analytics and performance measurement.',
    })
  }
  if (properties.gmb_ai_post) {
    if (properties.gmb_ai_post.gmb_org_setup === false) {
      generated.push({
        id: recommendationId++,
        type: 'warning',
        message: 'GMB setup not configured. Contact Abbi Team.',
        hideFixButton: true,
        subtitle: "Google My Business management helps improve local search visibility and online presence. Contact the Abbi Team to enable.",
      })
    } else if (properties.gmb_ai_post.gmb_org_setup === true && properties.gmb_ai_post.status !== 'enabled') {
      generated.push({
        id: recommendationId++,
        type: 'warning',
        message: 'GMB Posting not enabled.',
        subtitle: "Automates posts for better user engagement, strengthens your brand presence, and improves reliability in customers' eyes.",
      })
    }
  }
  if (properties.fb_ad_account?.status !== 'completed') {
    generated.push({
      id: recommendationId++,
      type: 'warning',
      message: 'No Facebook Ads account found. Contact Abbi Team.',
      hideFixButton: true,
      subtitle: 'Allows us to manage campaigns and ads effectively to reach the right audience and boost conversions.',
    })
  }
  return generated
}

export function SiteSetupComplete({ dateRangeFilter, currencySign, onRefetch, onIntegrationsUpdated }: Props) {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const setSettingsVisibleSection = useUiStore(s => s.setSettingsVisibleSection)
  const { getSecure } = useSecureCalls()

  const [healthScore, setHealthScore] = useState(60)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [graphicalStats, setGraphicalStats] = useState<any[] | null>(null)
  const [healthLoading, setHealthLoading] = useState<LoadingState>({
    loading: true,
    message: 'Loading completion percentage...',
    subtitle: 'Please wait while we fetch the completion percentage...',
  })
  const [graphicalStatsLoading, setGraphicalStatsLoading] = useState<LoadingState>({
    loading: true,
    message: 'Loading graphical stats...',
    subtitle: 'Please wait while we fetch the graphical stats...',
  })
  const [configDialog, setConfigDialog] = useState<{
    show: boolean
    type: ConfigDialogType | null
    initialData: unknown
    field: string | null
    message: string
  }>({ show: false, type: null, initialData: null, field: null, message: '' })

  const activeIntegrations = integrations.filter(i => i.status === 'active')

  const fetchGraphicalStats = useCallback(async () => {
    setGraphicalStatsLoading(s => ({ ...s, loading: true }))
    try {
      const params: Record<string, string> = {}
      if (dateRangeFilter) params.date_range = dateRangeFilter
      const response: any = await getSecure(SECURE_ENDPOINTS.DASHBOARD_GRAPHICAL_STATS, params)
      const data = response?.data ?? response
      setGraphicalStats(Array.isArray(data) ? data : null)
      setGraphicalStatsLoading({ loading: false, message: '', subtitle: '' })
    } catch (error) {
      console.error('Error fetching graphical stats:', error)
      setGraphicalStatsLoading({
        loading: false,
        message: 'Error fetching graphical stats',
        subtitle: 'Please try again later',
      })
    }
  }, [dateRangeFilter, getSecure])

  const fetchCompletionPercentage = useCallback(async () => {
    setHealthLoading({ loading: true, message: '', subtitle: '' })
    try {
      const response: any = await getSecure(SECURE_ENDPOINTS.DASHBOARD_COMPLETION_PERCENTAGE)
      if (response?.profile_completion?.weighted_percentage !== undefined) {
        setHealthScore(response.profile_completion.weighted_percentage)
      }
      const properties = response?.properties || {}
      const mapped = mapPropertiesToIntegrations(properties)
      const recs = generateRecommendations(properties)
      setIntegrations(mapped)
      setRecommendations(recs)
      setHealthLoading({
        loading: false,
        message: recs.length ? '' : 'No recommendations at this time',
        subtitle: recs.length ? '' : 'Your setup looks good for now',
      })
      onIntegrationsUpdated(mapped)
    } catch (error) {
      console.error('Error fetching completion percentage:', error)
      setHealthLoading({
        loading: false,
        message: 'Error fetching completion percentage',
        subtitle: 'Please try again later',
      })
    }
  }, [getSecure, onIntegrationsUpdated])

  useEffect(() => { fetchCompletionPercentage() }, [])
  useEffect(() => { fetchGraphicalStats() }, [dateRangeFilter])

  const graphicalStatsChartOptions = useMemo(() => {
    if (!graphicalStats || !graphicalStats.length) return null
    const categories = graphicalStats.map(item =>
      new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
    return {
      chart: { type: 'area', height: 400, backgroundColor: 'transparent', spacing: [20, 20, 20, 20] },
      title: { text: '' },
      credits: { enabled: false },
      xAxis: {
        categories,
        title: { text: null },
        gridLineColor: '#e0e0e0',
        lineColor: '#e0e0e0',
        labels: { style: { color: '#757575', fontSize: '12px' }, rotation: -45 },
      },
      yAxis: [
        {
          title: { text: 'Leads & Trials' },
          gridLineColor: '#f0f0f0',
          labels: { style: { color: '#757575', fontSize: '12px' } },
        },
        {
          opposite: true,
          title: { text: `Revenue ${currencySign}` },
          gridLineColor: '#f0f0f0',
          labels: { style: { color: '#757575', fontSize: '12px' }, format: `${currencySign}{value}` },
        },
      ],
      tooltip: {
        shared: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderRadius: 6,
        borderWidth: 1,
      },
      plotOptions: { area: { fillOpacity: 0.6, marker: { enabled: false }, lineWidth: 2 } },
      legend: { enabled: true, align: 'center', verticalAlign: 'bottom' },
      series: [
        { name: 'Leads', data: graphicalStats.map(i => i.leads_count || 0), color: '#2196F3', yAxis: 0 },
        { name: 'Trials', data: graphicalStats.map(i => i.purchases_count || 0), color: '#4CAF50', yAxis: 0 },
        {
          name: 'Revenue',
          data: graphicalStats.map(i => i.revenue_amount || 0),
          color: '#FF9800',
          yAxis: 1,
          tooltip: { valuePrefix: currencySign },
        },
      ],
    } as any
  }, [graphicalStats, currencySign])

  const loadOrganizationDataForDialog = useCallback(async (field: string): Promise<any> => {
    try {
      if (organization && (organization as any)[field] !== undefined) return organization
      const response: any = await getSecure(SECURE_ENDPOINTS.ORGANIZATION, {})
      if (response && response.length > 0) return response[0]
      return organization || {}
    } catch (error) {
      console.error('Error loading organization data:', error)
      return organization || {}
    }
  }, [organization, getSecure])

  const handleFix = useCallback(async (recommendation: Recommendation) => {
    const message = recommendation.message?.toLowerCase() || ''

    if (message.includes('gtag property')) {
      setConfigDialog({ show: true, type: 'gtag_property_steps', initialData: null, field: null, message: recommendation.message })
      return
    }
    if (message.includes('gtag not configured')) {
      const orgData = await loadOrganizationDataForDialog('gtag')
      setConfigDialog({ show: true, type: 'gtag', initialData: orgData?.gtag || [], field: null, message: recommendation.message })
      return
    }
    if (message.includes('meta pixel') || message.includes('pixel') || message.includes('facebook pixel')) {
      const orgData = await loadOrganizationDataForDialog('pixel')
      setConfigDialog({ show: true, type: 'pixel', initialData: orgData?.pixel || [], field: null, message: recommendation.message })
      return
    }
    if (message.includes('recaptcha')) {
      const orgData = await loadOrganizationDataForDialog('recaptcha_enabled')
      setConfigDialog({ show: true, type: 'toggle', initialData: orgData?.recaptcha_enabled || false, field: 'recaptcha_enabled', message: recommendation.message })
      return
    }
    if (message.includes('pwa') || message.includes('progressive web app')) {
      setSettingsVisibleSection(JSON.stringify({ parent: 101, child: 1015 }))
      router.push('/admin/all-settings')
      return
    }
    if (message.includes('gmb posting')) {
      const orgData = await loadOrganizationDataForDialog('gmb_ai_post')
      setConfigDialog({ show: true, type: 'toggle', initialData: orgData?.gmb_ai_post || false, field: 'gmb_ai_post', message: recommendation.message })
      return
    }
    if (message.includes('abbi analytics') || message.includes('abbi_analytics')) {
      const orgData = await loadOrganizationDataForDialog('is_analytics_enabled')
      setConfigDialog({ show: true, type: 'toggle', initialData: orgData?.is_analytics_enabled || false, field: 'is_analytics_enabled', message: recommendation.message })
      return
    }
    if (message.includes('payment') || message.includes('payment method')) {
      setSettingsVisibleSection(JSON.stringify({ parent: 203, child: null }))
      router.push('/admin/all-settings')
      return
    }
    if (message.includes('blogs')) {
      setSettingsVisibleSection(JSON.stringify({ parent: 402, child: 4021 }))
      router.push('/admin/all-settings')
    }
  }, [loadOrganizationDataForDialog, setSettingsVisibleSection, router])

  const handleDialogSaved = useCallback(() => {
    fetchCompletionPercentage()
    fetchGraphicalStats()
    onRefetch()
  }, [fetchCompletionPercentage, fetchGraphicalStats, onRefetch])

  // SVG ring matching v-progress-circular (size 140, width 12)
  const R = 64
  const CIRCUMFERENCE = 2 * Math.PI * R

  return (
    <div className="mb-6 health-section-card modern-card">
      <div className="px-4 pt-4 pb-0">
        <div className="section-title mb-1">Site Setup Complete</div>
        <p className="section-subtitle">Tracking & integration status</p>
      </div>
      <div className="px-4 pb-4">
        {healthLoading.loading ? (
          <div className="health-section-skeleton">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-center justify-center">
                <div className="custom-skeleton-circle mb-4" />
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="custom-skeleton-chip m-1" />
                  <div className="custom-skeleton-chip m-1" />
                  <div className="custom-skeleton-chip m-1" />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="custom-skeleton-chart" />
              </div>
            </div>
          </div>
        ) : healthLoading.message ? (
          <div className="no-data-container" style={{ height: 400 }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="no-data-icon-wrapper"><HeartPulse size={64} /></div>
              <p className="no-data-text mt-4">{healthLoading.message}</p>
              <p className="no-data-subtext">{healthLoading.subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col justify-center items-center">
              <div className="health-score-container">
                <div className="health-score-wrapper">
                  <div className="health-score-circle relative" style={{ width: 140, height: 140 }}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r={R} fill="none" stroke="#e8f5e9" strokeWidth="12" />
                      <circle
                        cx="70" cy="70" r={R} fill="none"
                        stroke="#4caf50" strokeWidth="12" strokeLinecap="butt"
                        strokeDasharray={`${(healthScore / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                        transform="rotate(-90 70 70)"
                      />
                    </svg>
                    <div className="health-score-text">
                      <div className="health-score-value">{healthScore}%</div>
                      <div className="health-score-label">Setup Complete</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="integration-chips-container">
                <div className="integration-chips-wrapper">
                  {activeIntegrations.map(integration => (
                    <span key={integration.name} className="integration-chip chip-active m-1">
                      <integration.Icon size={20} />
                      <span className="chip-label font-semibold">{integration.name}</span>
                      <CheckCircle size={18} color="#4caf50" />
                      {integration.showLocationDetails && integration.locationDetails && (
                        <span className="location-tooltip">
                          {integration.locationDetails.total_locations === 1 ? (
                            integration.locationDetails.valid_count === 1 ? (
                              <span className="flex items-center gap-1 text-green-400 font-medium">
                                <CheckCircle size={16} /> Payment Configured
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400 font-medium">
                                <AlertCircle size={16} /> Payment Missing
                              </span>
                            )
                          ) : (
                            <span className="block">
                              <span className="block mb-2 font-medium">Total: {integration.locationDetails.total_locations}</span>
                              {integration.locationDetails.valid_count > 0 && (
                                <span className="block mb-1 text-green-400">✓ {integration.locationDetails.valid_count} Configured</span>
                              )}
                              {integration.locationDetails.missing_count > 0 && (
                                <span className="block text-red-400">✗ {integration.locationDetails.missing_count} Missing</span>
                              )}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="modern-card">
                {graphicalStatsLoading.loading ? (
                  <div className="chart-skeleton-wrapper">
                    <div className="custom-skeleton-chart" />
                  </div>
                ) : graphicalStatsLoading.message ? (
                  <div className="no-data-container" style={{ height: 400 }}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="no-data-icon-wrapper"><LineChart size={64} /></div>
                      <p className="no-data-text mt-4">{graphicalStatsLoading.message}</p>
                      <p className="no-data-subtext">{graphicalStatsLoading.subtitle}</p>
                    </div>
                  </div>
                ) : graphicalStatsChartOptions ? (
                  <div className="chart-container">
                    <HighchartsChart options={graphicalStatsChartOptions} />
                  </div>
                ) : (
                  <div className="no-data-container" style={{ height: 400 }}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="no-data-icon-wrapper"><LineChart size={64} /></div>
                      <p className="no-data-text mt-4">No graphical stats available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!healthLoading.loading && recommendations.length > 0 && (
          <div className="recommendations-section mt-5">
            {recommendations.map(recommendation => (
              <div key={recommendation.id} className={`recommendation-item ${recommendation.type}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`recommendation-icon-wrapper ${recommendation.type}`}>
                      {recommendation.type === 'warning'
                        ? <AlertTriangle size={20} color="orange" />
                        : <AlertCircle size={20} color="#b00020" />}
                    </div>
                    <div>
                      <span className="recommendation-item-text">{recommendation.message}</span>
                      {recommendation.subtitle && (
                        <div className="recommendation-item-subtitle">{recommendation.subtitle}</div>
                      )}
                    </div>
                  </div>
                  {!recommendation.hideFixButton && (
                    <button type="button" className="fix-link" onClick={() => handleFix(recommendation)}>
                      Fix this →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DashboardConfigDialogue
          open={configDialog.show}
          type={configDialog.type}
          initialData={configDialog.initialData}
          field={configDialog.field}
          message={configDialog.message}
          gtagPropertySteps={GTAG_PROPERTY_STEPS}
          onClose={() => setConfigDialog(d => ({ ...d, show: false }))}
          onSaved={handleDialogSaved}
        />
      </div>
    </div>
  )
}

export type { Integration }
