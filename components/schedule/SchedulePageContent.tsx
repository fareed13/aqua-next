'use client'

import { useState } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSchedule } from '@/hooks/useSchedule'
import { VirtualScheduleDefault } from '@/components/schedule/VirtualScheduleDefault'

export function SchedulePageContent() {
  const { filteredLocations, selectedLocationId, selectLocation } = useSchedule()
  const isMultiLocation = filteredLocations.length > 1

  function getLocationLabel(loc: any) {
    return loc.target_locations?.length > 0 ? loc.target_locations[0] : loc.city
  }

  return (
    <div>
      {isMultiLocation && (
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <select
            value={selectedLocationId ?? ''}
            onChange={e => selectLocation(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
          >
            {filteredLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {getLocationLabel(loc)}
              </option>
            ))}
          </select>
        </div>
      )}
      <VirtualScheduleDefault component="VirtualScheduleDefault" selectedLocation={selectedLocationId ?? undefined} />
    </div>
  )
}
