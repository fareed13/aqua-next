'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useEvent } from '@/hooks/useEvent';
import { formatDateUTC } from '@/lib/utils/dateTime';

export function EventDefault(_props: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const currencySign = (organization as any)?.currency_sign ?? '$';
  const isUk = (organization as any)?.is_uk ?? false;
  const isAustralia = (organization as any)?.is_australia ?? false;
  const isNewZealand = (organization as any)?.is_new_zealand ?? false;

  const { events, buyEvent, arrangeEventPrice } = useEvent();

  function formattedDate(start_datetime: string): string {
    const time = formatDateUTC(start_datetime, 'hh:mm A');
    let date = formatDateUTC(start_datetime, 'MM/DD/YYYY');
    if (isUk || isAustralia || isNewZealand) {
      date = formatDateUTC(start_datetime, 'DD/MM/YYYY');
    }
    return `${date} at ${time}`;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, ev) => {
            const priceInfo = arrangeEventPrice(event);
            const isFull =
              event.capacity !== undefined &&
              event.enrolled !== undefined &&
              parseInt(String(event.capacity)) - parseInt(String(event.enrolled)) <= 0;
            const isDisabled = priceInfo.disability || isFull;

            return (
              <div key={ev} className="bg-white shadow-sm p-4">
                <h2
                  className="text-black font-bold leading-tight"
                  style={{ fontSize: 55, fontFamily: 'Khand, sans-serif' }}
                >
                  {event.name}
                </h2>
                <div className="flex items-start gap-4 mt-2">
                  <div className="flex-1">
                    <p className="text-[#eabb06] text-[30px] m-[3px_0]">Date &amp; Time</p>
                    <p className="font-bold text-[30px] text-black mt-5 m-[3px_0]">
                      {formattedDate(event.start_datetime)}
                    </p>
                  </div>
                  <div
                    className="flex flex-col items-center justify-center rounded-full text-white text-center"
                    style={{ background: '#000', height: 110, width: 110, minWidth: 110 }}
                  >
                    <p className="font-bold leading-none m-0 p-0 text-[23px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currencySign}{priceInfo.price}
                    </p>
                  </div>
                </div>
                {event.description && (
                  <p className="text-[rgba(0,0,0,0.7)] text-[20px] mt-2 py-0">{event.description}</p>
                )}
                <div className="mt-4 relative">
                  <button
                    disabled={isDisabled}
                    onClick={() => buyEvent(event)}
                    aria-label={`Register for ${event.name}`}
                    className="w-full py-2 font-bold text-[30px] uppercase text-[#000] disabled:opacity-50 hover:opacity-80 transition-opacity"
                    style={{ background: '#eabb06', fontFamily: 'Khand, sans-serif', borderRadius: 0 }}
                  >
                    REGISTER
                  </button>
                  {isFull && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/70 text-white text-sm px-3 py-1 rounded">
                        Registration is full, you can contact Administration
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
