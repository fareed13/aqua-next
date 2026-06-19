'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import {
  formatDate, addDays, addMonths, addYears,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  startOfIsoWeek, startOfWeek,
} from '@/lib/utils/dateTime'

const DATE_RANGE_ITEMS = [
  { title: 'Today' },
  { title: 'Yesterday' },
  { title: 'This Week', subList: [{ title: 'Sun - Today' }, { title: 'Mon - Today' }, { title: 'Sat - Today' }] },
  { title: 'Last Week', subList: [{ title: 'Sun - Sat' }, { title: 'Mon - Sun' }, { title: 'Sat - Fri' }] },
  { title: 'Last 7 Days' },
  { title: 'Last 28 Days' },
  { title: 'Last 30 Days' },
  { title: 'Last 90 Days' },
  { title: 'Last 12 Months' },
  { title: 'Last Calendar Year' },
  { title: 'This Year (Jan - Today)' },
  { title: 'Custom' },
]

const DAYS_RANGE: Record<string, number> = {
  Today: 0, Yesterday: 1, Last7Days: 7, Last28Days: 28, Last30Days: 30, Last90Days: 90,
}

const WEEK_RANGE = ['Sun-Today', 'Mon-Today', 'Sat-Today', 'Sun-Sat', 'Mon-Sun', 'Sat-Fri']

export function useAnalytics() {
  const domain = useOrgStore(s => s.domain)

  const [active, setActive] = useState(4)
  const [activeItem, setActiveItem] = useState(4)
  const [thisWeek, setThisWeek] = useState(false)
  const [lastWeek, setLastWeek] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState('')
  const [dialog, setDialog] = useState(false)
  const [custom, setCustom] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [rangeProp, setRangeProp] = useState({ start_date: '', end_date: '' })
  const [selectedOption, setSelectedOption] = useState('Last90Days')
  const [currentSetOption, setCurrentSetOption] = useState('')

  const todayStr = useMemo(() => {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString().substring(0, 10)
  }, [])

  const calculateDays = useCallback((t = 'Last7Days') => {
    const sd = formatDate(addDays(new Date(), -(DAYS_RANGE[t] ?? 0)))
    const ed = formatDate(addDays(new Date(todayStr), t === 'Today' ? 0 : -1))
    setStartDate(sd)
    setEndDate(ed)
    setSelectedOption(t)
    setDateRange(`${sd} - ${ed}`)
  }, [todayStr])

  const calculateWeeks = useCallback((t: string) => {
    const baseDate = addDays(new Date(todayStr), -(thisWeek ? 0 : 7))
    let sdDate = (t === 'Mon-Sun' || t === 'Mon-Today') ? startOfIsoWeek(baseDate) : startOfWeek(baseDate)
    if (t === 'Sat-Fri' || t === 'Sat-Today') sdDate = addDays(sdDate, -1)
    const sd = formatDate(sdDate)
    const ed = thisWeek ? todayStr : formatDate(addDays(new Date(sd), 6))
    setStartDate(sd)
    setEndDate(ed)
    setSelectedOption(t)
    setDateRange(`${sd} - ${ed}`)
  }, [todayStr, thisWeek])

  const calculateMonthsAndYears = useCallback((t: string) => {
    let sd: string, ed: string
    if (t === 'Last12Months') {
      sd = formatDate(startOfMonth(addMonths(new Date(todayStr), -12)))
      ed = formatDate(endOfMonth(addMonths(new Date(todayStr), -1)))
    } else if (t === 'ThisYear(Jan-Today)') {
      sd = formatDate(startOfYear(new Date(todayStr)))
      ed = todayStr
    } else {
      sd = formatDate(startOfYear(addYears(new Date(todayStr), -1)))
      ed = formatDate(endOfYear(addYears(new Date(todayStr), -1)))
    }
    setStartDate(sd)
    setEndDate(ed)
    setSelectedOption(t)
    setDateRange(`${sd} - ${ed}`)
  }, [todayStr])

  const dateMeasurement = useCallback((rawT: string) => {
    const t = rawT.replace(/\s/g, '')
    if (t === 'LastWeek') setLastWeek(prev => !prev)
    if (t === 'ThisWeek') setThisWeek(prev => !prev)

    if (t === 'Custom') {
      setActive(11)
      setSelectedOption(t)
      setCustom(prev => !prev)
    } else if (WEEK_RANGE.includes(t) && (lastWeek || thisWeek)) {
      calculateWeeks(t)
    } else if (['Last12Months', 'LastCalendarYear', 'ThisYear(Jan-Today)'].includes(t)) {
      calculateMonthsAndYears(t)
    } else if (DAYS_RANGE[t] !== undefined || t === 'Today') {
      calculateDays(t)
    }
  }, [lastWeek, thisWeek, calculateWeeks, calculateMonthsAndYears, calculateDays])

  const changProps = useCallback(() => {
    if (!startDate || !endDate) return
    if (startDate > endDate) return
    setActiveItem(active)
    setCurrentSetOption(selectedOption)
    setDialog(false)
    setRangeProp({ start_date: startDate, end_date: endDate })
    setSelectedDateRange(`${startDate} - ${endDate}`)
  }, [startDate, endDate, active, selectedOption])

  const cleanUp = useCallback(() => {
    setActive(activeItem)
    setDateRange(selectedDateRange)
    setDialog(false)
    setThisWeek(false)
    setLastWeek(false)
    setCustom(false)
  }, [activeItem, selectedDateRange])

  useEffect(() => {
    calculateDays('Last90Days')
  }, [calculateDays])

  useEffect(() => {
    if (startDate && endDate) {
      setRangeProp({ start_date: startDate, end_date: endDate })
      setSelectedDateRange(`${startDate} - ${endDate}`)
    }
  }, [])

  return {
    active, setActive, activeItem, thisWeek, lastWeek,
    selectedDateRange, dialog, setDialog, custom,
    startDate, setStartDate, endDate, setEndDate,
    dateRange, rangeProp, selectedOption, currentSetOption,
    items: DATE_RANGE_ITEMS, daysRange: DAYS_RANGE, weekRange: WEEK_RANGE,
    domain,
    calculateDays, calculateWeeks, calculateMonthsAndYears,
    dateMeasurement, changProps, cleanUp,
  }
}
