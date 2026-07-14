'use client'

import { Component } from 'react'
import type { ReactNode } from 'react'

/**
 * Isolates a live section preview. A component rendered with partial/default
 * props (as in the section editor and the reorder modal) can throw during its
 * first render; without this boundary that error bubbles up and tears down the
 * whole host dialog (the "loads → closes → reopens" glitch). Resets itself
 * whenever the previewed component changes (resetKey).
 */
export class PreviewBoundary extends Component<
  { resetKey: string; children: ReactNode; className?: string },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={this.props.className ?? 'w-full h-[120px] flex items-center justify-center text-xs text-gray-400 bg-gray-50'}>
          Preview unavailable
        </div>
      )
    }
    return this.props.children
  }
}
