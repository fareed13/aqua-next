'use client'

import { QueryProvider } from './QueryProvider'
import { OrgThemeProvider } from './OrgThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <OrgThemeProvider>
        {children}
      </OrgThemeProvider>
    </QueryProvider>
  )
}
