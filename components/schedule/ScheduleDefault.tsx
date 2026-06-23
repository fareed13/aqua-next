'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useSchedule } from '@/hooks/useSchedule';

export function ScheduleDefault({ headline }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c';

  const { activeTab, setActiveTab, daysOfWeek, schedule, scheduleFound } = useSchedule();

  const visibleDays = daysOfWeek.filter(
    (day) => Array.isArray(schedule[day]) && schedule[day].length > 0,
  );
  const selectedDay = visibleDays[activeTab] ?? null;

  if (!scheduleFound) return null;

  return (
    <div className="relative w-full min-h-[820px] overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: `${accentColor}cc` }}
      />

      {/* Content */}
      <div className="relative z-20 pt-24 pb-36 px-4">
        <h2 className="uppercase text-center text-3xl md:text-4xl font-bold text-white mb-12 tracking-wide">
          {headline ?? 'Schedule'}
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg">
            {/* Day tabs */}
            <div className="flex flex-wrap border-b">
              {visibleDays.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 min-w-[80px] py-3 px-2 text-sm uppercase font-semibold tracking-wide border-r last:border-r-0 transition-colors ${
                    activeTab === index
                      ? 'bg-gray-100 text-black'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </button>
              ))}
            </div>

            {/* Schedule cards */}
            <div className="p-5 space-y-3">
              {selectedDay && schedule[selectedDay].length > 0 ? (
                schedule[selectedDay].map((item: any, j: number) => (
                  <div
                    key={j}
                    className="border-2 rounded p-4"
                    style={{ borderColor: accentColor }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Time</span>
                        <div className="text-lg font-medium">
                          {item.pretty_start_time} – {item.pretty_end_time}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Class</span>
                        <div className="text-lg font-medium">{item.name}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-6">No classes scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
