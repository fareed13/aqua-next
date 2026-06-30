'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { Checkout } from '@/components/popupForm/stepperCheckout/Checkout'
import { interestedServiceSetter } from '@/hooks/useCheckoutDetails'

export function CheckoutPageClient() {
  const searchParams = useSearchParams()
  const organization = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)

  // Ensure the popup drawer stays closed when on the standalone checkout page
  useEffect(() => {
    setDialog(false)
  }, [setDialog])

  // Mirror Nuxt: if ?service=X&plan=Y is in the URL, pre-select that service/plan
  useEffect(() => {
    if (!organization) return
    const routeService = searchParams.get('service')
    const routePlan = searchParams.get('plan')
    if (!routeService || !routePlan) return

    const services = organization.services ?? []
    const foundService = services.find((s: any) => Number(s.id) === Number(routeService))
    if (!foundService) return

    const matchedSp = foundService.service_plans?.find((sp: any) =>
      Number(sp.plan?.id) === Number(routePlan) || Number(sp.plan_id) === Number(routePlan)
    )
    if (matchedSp?.plan) {
      setSelectedPlan(matchedSp.plan)
      interestedServiceSetter(matchedSp.service ?? foundService.id)
    }
  }, [searchParams, organization, setSelectedPlan])

  return <Checkout />
}
