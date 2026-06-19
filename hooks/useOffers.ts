'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import type { ServicePlan } from '@/types/api'

interface UseOffersProps {
  component_plan_id?: number | null
  defaultPlanId?: number | null
  service_id?: number | null
  name?: string
}

export function useOffers(props: UseOffersProps = {}) {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []
  const currencySign = (organization as any)?.currency_sign ?? '$'
  const setDialog = useUiStore(s => s.setDialog)

  const [offerReady, setOfferReady] = useState(false)
  const [showComponent, setShowComponent] = useState(false)
  const [newPrice, setNewPrice] = useState<string | number>(0)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [classOffer, setClassOffer] = useState('')
  const [classOfferNoPrice, setClassOfferNoPrice] = useState('')
  const [classOfferOnly, setClassOfferOnly] = useState('')
  const [offers, setOffers] = useState<string[]>([])
  const [selectedPaidPlanId, setSelectedPaidPlanId] = useState<number | null>(null)

  const whatYouGet = 'Included in your discounted starter package:'

  const planSelectedForComponent = useCallback((selectedPlanId?: number | null): ServicePlan | undefined => {
    const allServicePlans = services.flatMap(s => s.service_plans ?? [])
    const validPlans = allServicePlans.filter(
      sp => sp.plan && (sp.plan.discounted_price !== null || sp.plan.price !== null)
    )

    if (selectedPlanId && !isNaN(selectedPlanId)) {
      const found = validPlans.find(p => p.plan.id === selectedPlanId)
      if (found) return found
    }

    if (props.defaultPlanId && !isNaN(props.defaultPlanId)) {
      const found = validPlans.find(p => p.plan.id === props.defaultPlanId)
      if (found) return found
    }

    if (!props.service_id) {
      const first = validPlans[0]
      if (first) {
        setSelectedPaidPlanId(first.plan.id)
        return first
      }
    }

    if (props.service_id) {
      const service = services.find(s => s.id === props.service_id)
      if (service?.service_plans?.length) {
        const first = service.service_plans[0]
        setSelectedPaidPlanId(first.plan.id)
        return first
      }
    }

    return undefined
  }, [services, props.defaultPlanId, props.service_id])

  const getComponentPlan = useCallback((cpId?: number | null) => {
    return planSelectedForComponent(cpId)
  }, [planSelectedForComponent])

  useEffect(() => {
    const sp = planSelectedForComponent(props.component_plan_id)
    setOfferReady(true)

    if (['Birthday Parties', 'Summer Camp', 'Private Training'].includes(props.name ?? '')) {
      setShowComponent(false)
    } else {
      setShowComponent(true)
    }

    const plan = sp?.plan
    if (!plan) return

    const price = parseFloat(plan.discounted_price ?? plan.price).toFixed(2)
    setNewPrice(price === '0.00' ? 'Free' : price)

    const unitText = arrangeUnitOfTime(plan.amount_of_units, plan.unit_of_time)

    setClassOffer(
      `${plan.amount_of_units} Trial ${unitText} In ${props.name ?? ''} With A Certified Instructor (value ${currencySign}${plan.discounted_price ?? plan.price})`
    )
    setClassOfferOnly(`${plan.amount_of_units} ${unitText}`)
    setClassOfferNoPrice(
      `for ${plan.amount_of_units} ${unitText} (value $${plan.price})`
    )
    setOffers(plan.free_items ?? [])
  }, [planSelectedForComponent, props.component_plan_id, props.name, currencySign])

  return {
    offerReady,
    showComponent,
    newPrice,
    originalPrice,
    classOffer,
    classOfferNoPrice,
    classOfferOnly,
    whatYouGet,
    offers,
    selectedPaidPlanId,
    services,
    currencySign,
    getComponentPlan,
    setDialog,
  }
}
