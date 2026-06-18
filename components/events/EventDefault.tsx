'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useUiStore } from '@/store/uiStore';

interface EventItem {
  name: string;
  start_datetime: string;
  description?: string;
  capacity?: number;
  enrolled?: number;
  price?: string | number;
}

interface EventDefaultProps extends SectionProps {
  events?: EventItem[];
}

function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${date} at ${time}`;
  } catch {
    return dateStr;
  }
}

export function EventDefault({ events }: EventDefaultProps) {
  const organization = useOrgStore((s) => s.organization);
  const setDialog = useUiStore((s) => s.setDialog);
  const currencySign = organization?.currency_sign ?? '$';

  const eventList = events ?? [];

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventList.map((event, ev) => {
            const isFull =
              event.capacity !== undefined &&
              event.enrolled !== undefined &&
              parseInt(String(event.capacity)) - parseInt(String(event.enrolled)) <= 0;

            return (
              <div key={ev} className="bg-white shadow-sm p-4">
                <h2 className="text-black font-bold leading-tight" style={{ fontSize: 55, fontFamily: 'Khand, sans-serif' }}>
                  {event.name}
                </h2>
                <div className="flex items-start gap-4 mt-2">
                  <div className="flex-1">
                    <p className="text-[#eabb06] text-[30px]">Date &amp; Time</p>
                    <p className="font-bold text-[30px] text-black mt-4">
                      {formatEventDate(event.start_datetime)}
                    </p>
                  </div>
                  <div
                    className="flex flex-col items-center justify-center rounded-full text-white text-center"
                    style={{ background: '#000', height: 110, width: 110, minWidth: 110 }}
                  >
                    <p className="font-bold text-[23px] leading-none m-0">
                      {currencySign}{event.price ?? '0'}
                    </p>
                  </div>
                </div>
                {event.description && (
                  <p className="text-black/70 text-[20px] mt-2">{event.description}</p>
                )}
                <button
                  disabled={isFull}
                  onClick={() => setDialog(true)}
                  aria-label={`Register for ${event.name}`}
                  className="w-full mt-4 py-3 font-bold text-[30px] uppercase text-[#000] transition-opacity disabled:opacity-50 hover:opacity-80"
                  style={{ background: '#eabb06', fontFamily: 'Khand, sans-serif' }}
                >
                  {isFull ? 'Registration Full' : 'REGISTER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
