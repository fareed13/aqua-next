// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import { useSecureCalls, SECURE_ENDPOINTS, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls';
import { VirtualScheduleEdit } from '@/components/schedule/VirtualScheduleEdit';
import { CloseDateAddEdit } from '@/components/schedule/CloseDateAddEdit';
import { VirtualScheduleUploadPopup } from '@/components/schedule/VirtualScheduleUploadPopup';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

interface AvailableDay {
  day: string;
  date: Date;
  dateStr: string; // YYYY-MM-DD
}

function formatMMDD(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}`;
}

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function VirtualScheduleDefault({ headline, selectedLocation: propLocation }: SectionProps & { selectedLocation?: number }) {
  const router = useRouter();
  const organization = useOrgStore(s => s.organization) as any;
  const { isAdminLoggedIn } = useAuth();
  const { schedule, scheduleFound, selectedLocationId, selectLocation, locations } = useSchedule();
  const { getSecure, postSecure, deleteSecure } = useSecureCalls();

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c';
  const classReservationEnabled = !!organization?.class_reservation;

  const [tab, setTab] = useState(0);
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [classReservations, setClassReservations] = useState<Record<string, Record<string, number>>>({});
  const [reservedClasses, setReservedClasses] = useState<any[]>([]);
  const [overlay, setOverlay] = useState(false);

  // Modals
  const [editPopup, setEditPopup] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [deletePopup, setDeletePopup] = useState<any>(null);
  const [closeDatePopup, setCloseDatePopup] = useState(false);
  const [uploadPopup, setUploadPopup] = useState(false);

  const currentLocationId = propLocation ?? selectedLocationId;

  // Initialise location from prop or default to first location
  useEffect(() => {
    if (propLocation) { selectLocation(propLocation); return; }
    if (!selectedLocationId && locations.length > 0) selectLocation(locations[0].id);
  }, [propLocation, locations]);

  const fetchPublicSchedule = useCallback(async () => {
    if (!currentLocationId) return;
    setOverlay(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}${NON_SECURE_ENDPOINTS.PUBLIC_SCHEDULE}?location_id=${currentLocationId}`
      );
      const data: Record<string, Record<string, number>> = await res.json();

      const scheduleData = schedule;
      const sortedDates = Object.keys(data).sort();
      const days: AvailableDay[] = [];

      sortedDates.forEach(dateStr => {
        const d = new Date(dateStr + 'T00:00:00');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const dayKey = dayName.toLowerCase();
        if (scheduleData[dayKey as keyof typeof scheduleData]?.length > 0) {
          days.push({ day: dayName, date: d, dateStr });
        }
      });

      setAvailableDays(days);
      setClassReservations(data);
      setTab(0);
    } catch { /* handled */ }
    finally { setOverlay(false); }
  }, [currentLocationId, schedule]);

  useEffect(() => {
    if (scheduleFound && currentLocationId) fetchPublicSchedule();
  }, [scheduleFound, currentLocationId]);

  const fetchReservedClasses = useCallback(async () => {
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.RESERVATIONS);
      setReservedClasses(res ?? []);
    } catch { /* handled */ }
  }, []);

  // Capacity helpers
  const computedCapacity = (sch: any, dateStr: string) => {
    const reservationCount = classReservations[dateStr]?.[String(sch.id)] ?? 0;
    return (sch.capacity ?? 0) - reservationCount;
  };

  const isExpired = (sch: any) => {
    if (!sch.booking_active_to) return false;
    return new Date(sch.booking_active_to) < new Date(new Date().toISOString().split('T')[0]);
  };

  const isCloseDate = (dateStr: string, sch: any) => {
    const dateMs = new Date(dateStr + 'T00:00:00').getTime();
    return (sch.booking_close_dates ?? []).some((cd: string) => {
      const cdMs = new Date(cd + 'T00:00:00').getTime();
      const afterFrom = !sch.booking_active_from || new Date(sch.booking_active_from).getTime() <= dateMs;
      const beforeTo = !sch.booking_active_to || dateMs <= new Date(sch.booking_active_to).getTime();
      return cdMs === dateMs && afterFrom && beforeTo;
    });
  };

  const reserved = (sch: any, dateStr: string) => {
    return reservedClasses.some(rc => rc.schedule?.id === sch.id && rc.class_date?.startsWith(dateStr));
  };

  const reservationId = (sch: any, dateStr: string) => {
    return reservedClasses.find(rc => rc.schedule?.id === sch.id && rc.class_date?.startsWith(dateStr))?.id;
  };

  const showVirtualBtn = (sch: any) => sch.link && (sch.class_type === 'virtual' || sch.class_type === 'both');
  const showReserveBtn = (sch: any) => classReservationEnabled && (sch.class_type === 'in-person' || sch.class_type === 'both');

  // Reserve / unreserve
  const handleReserve = async (sch: any, dateStr: string) => {
    const rid = reservationId(sch, dateStr);
    if (rid) {
      await deleteSecure(SECURE_ENDPOINTS.RESERVATIONS, { id: rid });
      setReservedClasses(prev => prev.filter(rc => rc.id !== rid));
    } else {
      const res = await postSecure<any>(SECURE_ENDPOINTS.RESERVATIONS, {
        class_date: dateStr, schedule: sch.id,
      });
      if (res) setReservedClasses(prev => [...prev, res]);
    }
  };

  // Admin — toggle edit modal
  const openEdit = async (item: any) => {
    if (item === 'new') { setSelectedSchedule(null); setEditPopup(true); return; }
    setOverlay(true);
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.SCHEDULE, { id: item.id });
      setSelectedSchedule(res?.[0] ?? item);
      setEditPopup(true);
    } catch { /* handled */ }
    finally { setOverlay(false); }
  };

  const handleDelete = async () => {
    if (!deletePopup) return;
    try {
      await deleteSecure(SECURE_ENDPOINTS.SCHEDULE, { id: deletePopup.id });
      setDeletePopup(null);
      fetchPublicSchedule();
    } catch { setDeletePopup(null); }
  };

  const daySchedule = availableDays[tab]
    ? (schedule[(availableDays[tab].day.toLowerCase()) as keyof typeof schedule] ?? [])
    : [];

  const isAdmin = isAdminLoggedIn();

  if (!scheduleFound && !overlay) return null;

  return (
    <div className="relative">
      {overlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Modals */}
      {editPopup && currentLocationId && (
        <VirtualScheduleEdit
          popup={editPopup}
          toggleEditPopup={() => { setEditPopup(false); fetchPublicSchedule(); }}
          schedule={selectedSchedule}
          selectedLocationId={currentLocationId}
        />
      )}
      {closeDatePopup && currentLocationId && (
        <CloseDateAddEdit
          popup={closeDatePopup}
          toggleCloseDatePopup={() => setCloseDatePopup(false)}
          selectedLocationId={currentLocationId}
        />
      )}
      {uploadPopup && currentLocationId && (
        <VirtualScheduleUploadPopup
          popup={uploadPopup}
          toggleUploadPopup={() => { setUploadPopup(false); fetchPublicSchedule(); }}
          selectedLocationId={currentLocationId}
        />
      )}

      {/* Delete confirm */}
      {deletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">Delete Schedule</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{deletePopup.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletePopup(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {headline && <h2 className="text-center text-2xl font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{headline}</h2>}

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex flex-wrap justify-center gap-3 py-4">
          <button onClick={() => openEdit('new')}
            className="flex items-center gap-1 px-4 py-2 rounded text-white text-sm font-semibold"
            style={{ background: accentColor }}>
            + Add Schedule
          </button>
          <button onClick={() => setCloseDatePopup(true)}
            className="flex items-center gap-1 px-4 py-2 rounded text-white text-sm font-semibold"
            style={{ background: accentColor }}>
            + Add Close Date
          </button>
          <button onClick={() => setUploadPopup(true)}
            className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-semibold"
            style={{ background: accentColor }}>
            ↑ Upload Schedules
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500 font-bold">AI</span>
          </button>
        </div>
      )}

      {/* Date range header */}
      {availableDays.length > 0 && (
        <p className="text-center font-bold mb-4 text-sm tracking-wide">
          {formatMMDD(availableDays[0].date)} – {formatMMDD(availableDays[availableDays.length - 1].date)}
        </p>
      )}

      {/* Desktop day tabs */}
      <div className="hidden lg:flex border-b mb-4">
        {availableDays.map((obj, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`flex-1 py-5 text-center transition-colors border-b-4 ${
              tab === i ? 'border-current font-bold bg-black text-white' : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === i ? { borderColor: accentColor } : {}}>
            <div className="font-bold text-sm">{obj.day}</div>
            <div className="text-xs mt-1">{formatMMDD(obj.date)}</div>
          </button>
        ))}
      </div>

      {/* Mobile day selector */}
      <div className="lg:hidden mb-4 rounded-xl overflow-hidden shadow">
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
          <button onClick={() => setTab(t => Math.max(0, t - 1))} disabled={tab === 0}
            className="text-xl disabled:opacity-30">‹</button>
          <div className="text-center">
            <div className="font-bold">{availableDays[tab]?.day}</div>
            <div className="text-sm opacity-80">{availableDays[tab] ? formatMMDD(availableDays[tab].date) : ''}</div>
          </div>
          <button onClick={() => setTab(t => Math.min(availableDays.length - 1, t + 1))} disabled={tab === availableDays.length - 1}
            className="text-xl disabled:opacity-30">›</button>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-gray-50 scrollbar-none">
          {availableDays.map((obj, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-full border-2 transition-colors ${
                tab === i ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'
              }`}
              style={tab === i ? { background: accentColor } : {}}>
              <span className="text-xs font-semibold uppercase">{obj.day.substring(0, 3)}</span>
              <span className="text-base font-bold">{obj.date.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule list */}
      <div className="px-4 space-y-0">
        {availableDays.length === 0 && !overlay && (
          <p className="text-center text-gray-400 py-10">No classes scheduled for this week.</p>
        )}

        {daySchedule.map((sch: any, j: number) => {
          const dateStr = availableDays[tab]?.dateStr ?? '';
          const isVirtual = sch.class_type === 'virtual' || sch.class_type?.value === 'Virtual';
          const capacity = classReservationEnabled && sch.capacity ? computedCapacity(sch, dateStr) : null;
          const isReserved = reserved(sch, dateStr);

          return (
            <div key={j} className="border-b py-6">
              {/* Desktop layout */}
              <div className="hidden lg:flex items-center justify-between gap-4">
                <div className="w-1/3">
                  <h3 className="font-semibold text-base">
                    {sch.name}{isVirtual && <span className="ml-1 text-blue-500 text-sm"> [Online]</span>}
                  </h3>
                </div>
                <div className="w-1/4 text-center">
                  {capacity !== null && <small className="block text-gray-500">Available seats: {capacity}</small>}
                  <p className="text-sm">{sch.day_of_week} {sch.pretty_start_time} to {sch.pretty_end_time}</p>
                </div>
                <div className="w-1/3 flex justify-end gap-2">
                  {showVirtualBtn(sch) && (
                    <a href={sch.link} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                      style={{ background: accentColor }}>Join Virtually</a>
                  )}
                  {sch.eligible_for_trial_class && !isCloseDate(dateStr, sch) && !isExpired(sch) && (
                    <button className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                      style={{ background: accentColor }}>BOOK NOW</button>
                  )}
                  {showReserveBtn(sch) && (
                    <button onClick={() => handleReserve(sch, dateStr)}
                      disabled={capacity === 0 && !isReserved}
                      className="px-4 py-2 rounded-full text-white text-sm font-semibold disabled:opacity-50"
                      style={{ background: accentColor }}>
                      {isReserved ? 'Unregister' : 'Reserve'}
                    </button>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(sch)} className="text-blue-600 hover:text-blue-800 text-lg p-1">✏</button>
                    <button onClick={() => setDeletePopup(sch)} className="text-red-500 hover:text-red-700 text-lg p-1">🗑</button>
                  </div>
                )}
              </div>

              {/* Mobile layout */}
              <div className="lg:hidden rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-base">
                      {sch.name}{isVirtual && <span className="ml-1 text-blue-500 text-sm">[Online]</span>}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">🕐 {sch.pretty_start_time} – {sch.pretty_end_time}</div>
                    {capacity !== null && <div className="text-sm text-gray-500 mt-1">👥 Available: {capacity} seats</div>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(sch)} className="text-blue-600 text-lg p-1">✏</button>
                      <button onClick={() => setDeletePopup(sch)} className="text-red-500 text-lg p-1">🗑</button>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {showVirtualBtn(sch) && (
                    <a href={sch.link} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-blue-600">
                      📹 Join Virtually
                    </a>
                  )}
                  {sch.eligible_for_trial_class && !isCloseDate(dateStr, sch) && !isExpired(sch) && (
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-green-600">
                      📅 Book Now
                    </button>
                  )}
                  {showReserveBtn(sch) && (
                    <button onClick={() => handleReserve(sch, dateStr)}
                      disabled={capacity === 0 && !isReserved}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 ${isReserved ? 'bg-red-500' : 'bg-blue-600'}`}>
                      {isReserved ? '❌ Unregister' : '📌 Reserve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {daySchedule.length === 0 && availableDays.length > 0 && !overlay && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📅</div>
            <p>No classes scheduled for {availableDays[tab]?.day}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
