import React, { useState, useEffect, useRef } from "react";
import "./ScheduleView.css";
import { API_BASE_URL } from "../../config.js";

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

  const handleEdit = (booking) => {
    // Placeholder for edit functionality
    console.log('Edit booking:', booking);
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="schedule-page">
      <main className="main-content">
        {/* Header Section */}
        <header className="header">
          <div className="header-wrapper">
            {/* Title & Subtitle */}
            <div className="header-title">
              <h2>Schedule View</h2>
              {/* <div className="header-subtitle">
                <span>Manage and oversee all vehicle bookings</span>
              </div> */}
            </div>

            {/* Actions Toolbar */}
            <div className="toolbar">
              {/* Color Legend */}
              <div className="color-legend">
                <div className="legend-item">
                  <div className="legend-dot approved"></div>
                  <span>Approved</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot pending"></div>
                  <span>Pending</span>
                </div>
              </div>

               {/* Date Navigation */}
          <div className="date-controls">
            <button className="nav-btn" onClick={() => navigate('prev')}>
              <span><i className="fa-solid fa-angle-left"></i></span>
            </button>
            <div className="date-display">
              {view === 'week'
                ? `${formatDate(weekDays[0], 'MMM d')} - ${formatDate(weekDays[6], 'MMM d')}`
                : formatDate(currentDate, 'MMM d')
              }
            </div>
            <button className="nav-btn" onClick={() => navigate('next')}>
              <span><i className="fa-solid fa-angle-right"></i></span>
            </button>
            <button className="btn-today" onClick={() => setCurrentDate(new Date())}>Today</button>
          </div>

              {/* Status Filter */}
              {/* <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select> */}

              {/* View Tabs */}
              <div className="view-tabs">
                <button 
                  className={`tab-btn ${view === 'day' ? 'active' : ''}`}
                  onClick={() => setView('day')}
                >
                  Day
                </button>
                <button 
                  className={`tab-btn ${view === 'week' ? 'active' : ''}`}
                  onClick={() => setView('week')}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

         
        </header>

        {/* Calendar Grid Container */}
        <div className="calendar-wrapper">
          <div className="calendar-container">
            {view === 'week' && (
              <>
                {/* Week Header */}
                <div className="calendar-header">
                  <div className="time-zone"><span>GMT</span></div>
                  <div className="days-header">
                    {weekDays.map((day, idx) => (
                      <div key={idx} className={`day-column ${isSameDay(day, new Date()) ? 'current-day' : ''}`}>
                        <p className="day-name">{formatDate(day, 'EEE')}</p>
                        <div className={`day-number ${isSameDay(day, new Date()) ? 'active' : ''}`}>{formatDate(day, 'd')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week Calendar Body */}
                <div className="calendar-body" ref={calendarBodyRef}>
                  <div className="calendar-grid">
                    <div className="time-column">
                      {timeSlots.map((time, idx) => (
                        <div key={idx} className="time-slot"><span>{time}</span></div>
                      ))}
                    </div>
                    <div className="events-grid">
                      {weekDays.map((day, dayIdx) => (
                        <div key={dayIdx} className={`day-grid ${isSameDay(day, new Date()) ? 'current-day-grid' : ''}`}>
                          {timeSlots.map((time, slotIdx) => {
                            const bookings = getBookingsForSlot(day, time);
                            const columns = getBookingColumns(bookings);
                            const columnCount = columns.length;

                            return (
                              <div key={slotIdx} className="time-slot-container" style={{height: '40px', position: 'relative'}}>
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
                                          className={`booking-card ${getStatusClass(booking.status)}`}
                                          onClick={() => handleEdit(booking)}
                                          style={{
                                            ...style,
                                            width,
                                            left,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <div className="booking-title">{booking.purpose || booking.vehicleName}</div>
                                          <div className="booking-time">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
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
                              className="current-time-indicator"
                              style={{ top: `${currentTimePosition}px` }}
                            >
                              <div className="time-indicator-dot"></div>
                              <div className="time-indicator-line"></div>
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
              <div className="day-view">
                {timeSlots.map((time, idx) => {
                  const bookings = getBookingsForSlot(currentDate, time);
                  const columns = getBookingColumns(bookings);
                  const columnCount = columns.length;

                  return (
                    <div key={idx} className="day-slot">
                      <div className="slot-time">{time}</div>
                      <div className="slot-content">
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
                                  className={`booking-card ${getStatusClass(booking.status)}`}
                                  onClick={() => handleEdit(booking)}
                                  style={{
                                    ...style,
                                    width,
                                    left,
                                    position: 'absolute',
                                  }}
                                >
                                  <div className="booking-title">{booking.purpose || booking.vehicleName}</div>
                                  <div className="booking-time">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
                                  <div className="booking-desc">{booking.location}</div>
                                </div>
                              );
                            }
                            return null;
                          })
                        )}
                        {/* Current Time Indicator for Today's Day View */}
                        {isSameDay(currentDate, new Date()) && currentTimePosition !== null && idx === 0 && (
                          <div 
                            className="current-time-indicator"
                            style={{ top: `${currentTimePosition}px` }}
                          >
                            <div className="time-indicator-dot"></div>
                            <div className="time-indicator-line"></div>
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