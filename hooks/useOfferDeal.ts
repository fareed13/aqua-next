'use client'

function computeDeal(): { dealText: string; specialOffer: boolean } {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.toLocaleString('en-US', { month: 'long' })

  const nov24 = new Date(year, 10, 24)
  const nov29 = new Date(year, 10, 29)
  const dec04 = new Date(year, 11, 4)
  const dec31 = new Date(year, 11, 31)
  const jan01 = new Date(year, 0, 1)

  if (today > nov24 && today < nov29) return { dealText: 'Black Friday', specialOffer: true }
  if (today > nov29 && today < dec04) return { dealText: 'Cyber Monday', specialOffer: true }
  if ((today > dec04 && today < dec31) || today.toDateString() === jan01.toDateString()) {
    return { dealText: 'Holiday', specialOffer: true }
  }
  return { dealText: `Crazy  ${month} Deal Alert.`, specialOffer: false }
}

export function useOfferDeal() {
  const { dealText, specialOffer } = computeDeal()
  return {
    specialOffer,
    getDeal: () => dealText,
  }
}
