'use client'

import { useState, useCallback } from 'react'

export function useOfferDeal() {
  const [specialOffer, setSpecialOffer] = useState(false)

  const getDeal = useCallback(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.toLocaleString('en-US', { month: 'long' })

    const dayOfYear = Math.floor(
      (today.getTime() - new Date(year, 0, 1).getTime()) / 86400000
    )

    const nov24 = new Date(year, 10, 24)
    const nov29 = new Date(year, 10, 29)
    const dec04 = new Date(year, 11, 4)
    const dec31 = new Date(year, 11, 31)
    const jan01 = new Date(year, 0, 1)

    if (today > nov24 && today < nov29) {
      setSpecialOffer(true)
      return 'Black Friday'
    }
    if (today > nov29 && today < dec04) {
      setSpecialOffer(true)
      return 'Cyber Monday'
    }
    if ((today > dec04 && today < dec31) || today.toDateString() === jan01.toDateString()) {
      setSpecialOffer(true)
      return 'Holiday'
    }

    setSpecialOffer(false)
    return `Crazy  ${month} Deal Alert.`
  }, [])

  return {
    specialOffer,
    getDeal,
  }
}
