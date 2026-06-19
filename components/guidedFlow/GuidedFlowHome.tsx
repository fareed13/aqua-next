'use client'

import { useState } from 'react'
import { useOrgStore } from '@/store/orgStore'

export function GuidedFlowHome() {
  const organization = useOrgStore(s => s.organization)
  const [stepNumber, setStepNumber] = useState(1)

  const moveForward = () => setStepNumber(prev => prev + 1)
  const moveBackward = () => setStepNumber(prev => Math.max(1, prev - 1))

  const scraped = organization?.is_scraped ?? false

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#168b61' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <div
              key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                stepNumber === n ? 'bg-white text-green-700' : 'bg-white/20 text-white'
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Step content placeholder */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {stepNumber === 1 && 'Welcome'}
            {stepNumber === 2 && 'Lead Notifications'}
            {stepNumber === 3 && 'Direct Call'}
            {stepNumber === 4 && 'Templates'}
            {stepNumber === 5 && 'Programs'}
            {stepNumber === 6 && 'Logo And Pictures'}
            {stepNumber === 7 && 'Intro Trial'}
            {stepNumber > 7 && `Step ${stepNumber}`}
          </h2>
          <p className="text-gray-500 mb-8">
            Guided flow step {stepNumber} content will be rendered here.
          </p>

          <div className="flex justify-between">
            {stepNumber > 1 && (
              <button
                onClick={moveBackward}
                className="bg-gray-200 px-6 py-2 rounded font-semibold"
              >
                Back
              </button>
            )}
            <button
              onClick={moveForward}
              className="bg-green-600 text-white px-6 py-2 rounded font-semibold ml-auto"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
