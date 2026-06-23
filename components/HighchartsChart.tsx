'use client'

import { useEffect, useRef } from 'react'
import type Highcharts from 'highcharts'

interface Props {
  options: Highcharts.Options
  [key: string]: any
}

export function HighchartsChart({ options, ...rest }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const HC = (await import('highcharts')).default

      try {
        const vpMod = await import('highcharts/modules/variable-pie')
        const fn = (vpMod as any).default ?? vpMod
        if (typeof fn === 'function') fn(HC)
      } catch {}

      if (!mounted || !containerRef.current) return
      chartRef.current = HC.chart(containerRef.current, options)
    }

    init()
    return () => {
      mounted = false
      chartRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    chartRef.current?.update(options, true, true)
  }, [options])

  return <div ref={containerRef} {...rest} />
}
