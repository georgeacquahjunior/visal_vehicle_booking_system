import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config.js";

function ScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarBodyRef = useRef(null);

  // bookings state — fetched from backend schedule_view
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = API_BASE_URL;

  // Update current time every minute for the time indicator line
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/bookings/schedule_view`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        const remote = Array.isArray(data.bookings) ? data.bookings : [];

        const mapped = remote
          .filter(b => {
            // Filter out declined bookings automatically
            const status = b.status ? b.status.toString().trim().toLowerCase() : "";
            return status !== 'declined' && status !== 'cancelled' && status !== 'canceled';
          })
          .map((b) => {
            // compute duration from HH:MM strings
            let duration = '';
            try {
              if (b.start_time && b.end_time) {
                const [sh, sm] = b.start_time.split(':').map(Number);
                const [eh, em] = b.end_time.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                if (diff > 0) {
                  const h = Math.floor(diff / 60);
                  const m = diff % 60;
                  duration = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
                }
              }
            } catch (e) {
              duration = '';
            }

            return {
              id: b.booking_id,
              vehicleName: b.vehicle_name || b.vehicle || `Booking ${b.booking_id}`,
              startTime: b.start_time,
              endTime: b.end_time,
              date: b.booking_date ? new Date(b.booking_date) : new Date(),
              purpose: b.purpose,
              location: b.location,
              status: b.status ? b.status.toString().trim().toLowerCase() : "",
              userName: b.staff_name || b.staff || "Staff",
              notes: b.notes || null,
              duration,
            };
          });

        setBookings(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => (b.status || '').toString().toLowerCase() === statusFilter);

  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay() + 1;
    const weekStart = new Date(curr.setDate(first));
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i));
    }
    return days;
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const formatDate = (date, format) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    if (format === 'MMM d') return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${day}`;
    if (format === 'EEE') return dayName;
    if (format === 'd') return day;
    return date.toString();
  };

  const weekDays = getWeekDays();

  // Generate 30-minute time slots from 6 AM to 6 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const totalMinutes = 6 * 60 + i * 30; // Start at 6:00 AM, increment by 30 mins
    const hour = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  });

  const getBookingsForDay = (date) => {
    return filteredBookings.filter(b => isSameDay(b.date, date));
  };

  const getBookingsForSlot = (date, time) => {
    const dayBookings = getBookingsForDay(date);
    const [slotHour, slotMin] = time.split(':').map(Number);

    return dayBookings.filter(b => {
      if (!b.startTime || !b.endTime) return false;
      const [startHour, startMin] = b.startTime.split(':').map(Number);
      const [endHour, endMin] = b.endTime.split(':').map(Number);

      const slotStart = slotHour * 60 + slotMin;
      const slotEnd = slotStart + 30; // 30-minute slot
      const bookingStart = startHour * 60 + startMin;
      const bookingEnd = endHour * 60 + endMin;

      return bookingStart < slotEnd && bookingEnd > slotStart;
    });
  };

  // Calculate the position and height of a booking card
  const getBookingStyle = (booking, slotTime) => {
    if (!booking.startTime || !booking.endTime) return {};

    const [startHour, startMin] = booking.startTime.split(':').map(Number);
    const [endHour, endMin] = booking.endTime.split(':').map(Number);
    const [slotHour, slotMin] = slotTime.split(':').map(Number);

    const bookingStart = startHour * 60 + startMin;
    const bookingEnd = endHour * 60 + endMin;
    const slotStart = slotHour * 60 + slotMin;

    // Calculate offset from slot start
    const offsetMinutes = Math.max(0, bookingStart - slotStart);
    const topOffset = (offsetMinutes / 30) * 40; // 40px per 30-min slot

    // Calculate height based on duration
    const durationMinutes = bookingEnd - bookingStart;
    const height = (durationMinutes / 30) * 40;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height - 4, 30)}px`,
    };
  };

  // Group overlapping bookings for side-by-side layout
  const getBookingColumns = (bookings) => {
    if (bookings.length === 0) return [];

    // Sort bookings by start time
    const sorted = [...bookings].sort((a, b) => {
      const aStart = a.startTime.split(':').map(Number);
      const bStart = b.startTime.split(':').map(Number);
      return (aStart[0] * 60 + aStart[1]) - (bStart[0] * 60 + bStart[1]);
    });

    const columns = [];

    sorted.forEach(booking => {
      const [startH, startM] = booking.startTime.split(':').map(Number);
      const [endH, endM] = booking.endTime.split(':').map(Number);
      const bookingStart = startH * 60 + startM;
      const bookingEnd = endH * 60 + endM;

      // Find a column where this booking doesn't overlap
      let placed = false;
      for (let col of columns) {
        const hasOverlap = col.some(b => {
          const [bStartH, bStartM] = b.startTime.split(':').map(Number);
          const [bEndH, bEndM] = b.endTime.split(':').map(Number);
          const bStart = bStartH * 60 + bStartM;
          const bEnd = bEndH * 60 + bEndM;
          return bookingStart < bEnd && bookingEnd > bStart;
        });

        if (!hasOverlap) {
          col.push(booking);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([booking]);
      }
    });

    return columns;
  };

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 6 * 60; // 6 AM
    const endMinutes = 18 * 60; // 6 PM

    if (totalMinutes < startMinutes || totalMinutes > endMinutes) {
      return null; // Outside visible range
    }

    const minutesFromStart = totalMinutes - startMinutes;
    const position = (minutesFromStart / 30) * 40; // 40px per 30-min slot

    return position;
  };

  const navigate = (direction) => {
    const days = view === 'week' ? 7 : 1;
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? days : -days));
    setCurrentDate(newDate);
  };

  const getStatusClass = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'pending' || s === 'in_progress' || s === 'in-progress') return 'pending';
    return 'pending';
  };

  const BOOKING_CARD_CLASS = {
    approved: "bg-[#d1fae5] border-l-4 border-l-emerald-500 text-[#065f46]",
    pending: "bg-[#fef3c7] border-l-4 border-l-amber-500 text-[#92400e]",
  };

  const handleEdit = (booking) => {
    // Placeholder for edit functionality
    console.log('Edit booking:', booking);
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="flex h-screen overflow-hidden bg-[#fcfbfb]">
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header Section */}
        <header className="z-10 rounded-[20px] border border-blue-500/[0.15] bg-gradient-to-br from-white to-[#eef3ff] p-[10px_24px]">
          <div className="mb-3 flex flex-col gap-4">
            {/* Title & Subtitle */}
            <div>
              <h2 className="mb-1 text-center text-[30px] tracking-[-0.015em] text-[#0b2a4a]">Schedule View</h2>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Color Legend */}
              <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-gray-50 p-[8px_12px]">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
                  <div className="h-3 w-3 shrink-0 rounded-[3px] bg-emerald-500"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
                  <div className="h-3 w-3 shrink-0 rounded-[3px] bg-amber-500"></div>
                  <span>Pending</span>
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center justify-center rounded-md border border-[#d9d6e1] bg-white p-2 transition-all hover:bg-black/[0.02]" onClick={() => navigate('prev')}>
                  <span><i className="fa-solid fa-angle-left"></i></span>
                </button>
                <div className="min-w-[140px] rounded-md border border-[#d9d6e1] bg-white p-[8px_16px] text-center text-sm font-semibold text-[#131117]">
                  {view === 'week'
                    ? `${formatDate(weekDays[0], 'MMM d')} - ${formatDate(weekDays[6], 'MMM d')}`
                    : formatDate(currentDate, 'MMM d')
                  }
                </div>
                <button className="flex items-center justify-center rounded-md border border-[#d9d6e1] bg-white p-2 transition-all hover:bg-black/[0.02]" onClick={() => navigate('next')}>
                  <span><i className="fa-solid fa-angle-right"></i></span>
                </button>
                <button className="cursor-pointer rounded-md border border-[#d9d6e1] bg-white px-4 py-2 text-sm font-semibold text-[#131117] transition-all hover:bg-black/[0.02]" onClick={() => setCurrentDate(new Date())}>Today</button>
              </div>

              {/* View Tabs */}
              <div className="flex rounded-md border border-[#d9d6e1] bg-white">
                <button
                  className={`cursor-pointer border-r border-[#d9d6e1] px-4 py-2 font-medium transition-all last:border-r-0 hover:bg-black/[0.02] ${view === 'day' ? 'rounded-[5px] bg-[#0b77be] text-white' : 'bg-transparent text-[#6b6284]'}`}
                  onClick={() => setView('day')}
                >
                  Day
                </button>
                <button
                  className={`cursor-pointer border-r border-[#d9d6e1] px-4 py-2 font-medium transition-all last:border-r-0 hover:bg-black/[0.02] ${view === 'week' ? 'rounded-[5px] bg-[#0b77be] text-white' : 'bg-transparent text-[#6b6284]'}`}
                  onClick={() => setView('week')}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Calendar Grid Container */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-[#fcfbfb] p-6">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#eceaf0] bg-white">
            {view === 'week' && (
              <>
                {/* Week Header */}
                <div className="z-[1] grid shrink-0 grid-cols-[60px_1fr] border-b border-[#eceaf0] bg-white">
                  <div className="flex items-end justify-center border-r border-[#eceaf0] p-4 pb-2"><span className="text-xs font-bold uppercase text-gray-400">GMT</span></div>
                  <div className="grid grid-cols-7">
                    {weekDays.map((day, idx) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div key={idx} className={`border-r border-[#eceaf0] p-3 text-center transition-all last:border-r-0 hover:bg-black/[0.02] ${isToday ? 'bg-[rgba(63,47,106,0.05)]' : ''}`}>
                          <p className={`mb-2 text-xs uppercase tracking-[0.05em] ${isToday ? 'font-bold text-[#0b77be]' : 'font-medium text-gray-400'}`}>{formatDate(day, 'EEE')}</p>
                          <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${isToday ? 'bg-[#0b77be] text-white shadow-[0_4px_12px_rgba(63,47,106,0.3)]' : 'text-[#131117]'}`}>{formatDate(day, 'd')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Week Calendar Body */}
                <div className="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent" ref={calendarBodyRef}>
                  <div className="grid min-h-full grid-cols-[60px_1fr]">
                    <div className="flex flex-col border-r border-[#eceaf0] bg-white text-xs font-medium text-gray-400 select-none">
                      {timeSlots.map((time, idx) => (
                        <div key={idx} className="relative flex h-10 items-start justify-center pt-2"><span className="block -translate-y-1/2">{time}</span></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {weekDays.map((day, dayIdx) => (
                        <div key={dayIdx} className={`relative h-full border-r border-[#eceaf0] last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-[rgba(63,47,106,0.02)]' : ''}`}>
                          {timeSlots.map((time, slotIdx) => {
                            const bookings = getBookingsForSlot(day, time);
                            const columns = getBookingColumns(bookings);
                            const columnCount = columns.length;

                            return (
                              <div key={slotIdx} className="relative border-b border-gray-100" style={{height: '40px', position: 'relative'}}>
                                {columns.map((column, colIdx) =>
                                  column.map((booking, bookingIdx) => {
                                    // Only render if this is the first slot the booking appears in
                                    const [bookingStartH, bookingStartM] = booking.startTime.split(':').map(Number);
                                    const [slotH, slotM] = time.split(':').map(Number);
                                    const bookingStartMin = bookingStartH * 60 + bookingStartM;
                                    const slotStartMin = slotH * 60 + slotM;

                                    if (bookingStartMin >= slotStartMin && bookingStartMin < slotStartMin + 30) {
                                      const style = getBookingStyle(booking, time);
                                      const width = columnCount > 1 ? `calc(${100 / columnCount}% - 4px)` : 'calc(100% - 8px)';
                                      const left = columnCount > 1 ? `calc(${(colIdx * 100) / columnCount}% + 4px)` : '4px';

                                      return (
                                        <div
                                          key={`${colIdx}-${bookingIdx}`}
                                          className={`absolute z-10 overflow-hidden rounded-md p-2 text-xs transition-all hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:brightness-95 ${BOOKING_CARD_CLASS[getStatusClass(booking.status)]}`}
                                          onClick={() => handleEdit(booking)}
                                          style={{
                                            ...style,
                                            width,
                                            left,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">{booking.purpose || booking.vehicleName}</div>
                                          <div className="text-[10px] font-medium opacity-80">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })
                                )}
                              </div>
                            );
                          })}
                          {/* Current Time Indicator for Today */}
                          {isSameDay(day, new Date()) && currentTimePosition !== null && (
                            <div
                              className="absolute left-0 right-0 z-20 pointer-events-none"
                              style={{ top: `${currentTimePosition}px` }}
                            >
                              <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
                              <div className="absolute left-0 right-0 h-0.5 w-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === 'day' && (
              <div className="relative flex-1 overflow-y-auto">
                {timeSlots.map((time, idx) => {
                  const bookings = getBookingsForSlot(currentDate, time);
                  const columns = getBookingColumns(bookings);
                  const columnCount = columns.length;

                  return (
                    <div key={idx} className="flex h-10 min-h-[50px] border-b border-gray-100">
                      <div className="w-[60px] shrink-0 border-r border-[#eceaf0] p-3 text-right text-xs font-medium text-gray-400">{time}</div>
                      <div className="relative flex-1">
                        {columns.map((column, colIdx) =>
                          column.map((booking, bookingIdx) => {
                            const [bookingStartH, bookingStartM] = booking.startTime.split(':').map(Number);
                            const [slotH, slotM] = time.split(':').map(Number);
                            const bookingStartMin = bookingStartH * 60 + bookingStartM;
                            const slotStartMin = slotH * 60 + slotM;

                            if (bookingStartMin >= slotStartMin && bookingStartMin < slotStartMin + 30) {
                              const style = getBookingStyle(booking, time);
                              const width = columnCount > 1 ? `calc(${100 / columnCount}% - 8px)` : 'calc(100% - 16px)';
                              const left = columnCount > 1 ? `calc(${(colIdx * 100) / columnCount}% + 8px)` : '8px';

                              return (
                                <div
                                  key={`${colIdx}-${bookingIdx}`}
                                  className={`absolute z-10 overflow-hidden rounded-md p-2 text-xs transition-all hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:brightness-95 ${BOOKING_CARD_CLASS[getStatusClass(booking.status)]}`}
                                  onClick={() => handleEdit(booking)}
                                  style={{
                                    ...style,
                                    width,
                                    left,
                                    position: 'absolute',
                                  }}
                                >
                                  <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">{booking.purpose || booking.vehicleName}</div>
                                  <div className="text-[10px] font-medium opacity-80">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
                                  <div className="mt-1 text-[10px] leading-[1.3] opacity-70">{booking.location}</div>
                                </div>
                              );
                            }
                            return null;
                          })
                        )}
                        {/* Current Time Indicator for Today's Day View */}
                        {isSameDay(currentDate, new Date()) && currentTimePosition !== null && idx === 0 && (
                          <div
                            className="absolute left-0 right-0 z-20 pointer-events-none"
                            style={{ top: `${currentTimePosition}px` }}
                          >
                            <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
                            <div className="absolute left-0 right-0 h-0.5 w-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScheduleView;
