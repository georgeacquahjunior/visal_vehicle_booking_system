import React, { useState, useEffect } from "react";
import "./ScheduleView.css";

function ScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [statusFilter, setStatusFilter] = useState('all');

  // bookings state — fetched from backend schedule_view
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/bookings/schedule_view`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        const remote = Array.isArray(data.bookings) ? data.bookings : [];

        const mapped = remote.map((b) => {
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

          return ({
          id: b.booking_id,
          // backend doesn't provide vehicle name in current API; use any available field or a fallback
          vehicleName: b.vehicle_name || b.vehicle || `Booking ${b.booking_id}`,
          startTime: b.start_time,
          endTime: b.end_time,
          date: b.booking_date ? new Date(b.booking_date) : new Date(),
          purpose: b.purpose,
          location: b.location,
          // normalize status for consistent UI classes
          status: b.status ? b.status.toString().trim().toLowerCase() : "",
          userName: b.staff_name || b.staff || "Staff",
          notes: b.notes || null,
          duration,
        });
        });

        setBookings(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load schedule');
        // keep mockBookings as fallback
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
 const timeSlots = Array.from({ length: 8 }, (_, i) => {
  const hour = i + 9; // 9 AM start
  return `${String(hour).padStart(2, '0')}:00`;
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
    const slotEnd = slotStart + 60; // 1-hour slot
    const bookingStart = startHour * 60 + startMin;
    const bookingEnd = endHour * 60 + endMin;

    // Return true if booking overlaps the slot
    return bookingStart < slotEnd && bookingEnd > slotStart;
    });
  };


  const navigate = (direction) => {
    const days = view === 'week' ? 7 : 1; // only week or day view
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? days : -days));
    setCurrentDate(newDate);
  };


  const getStatusClass = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'pending' || s === 'in_progress' || s === 'in-progress') return 'pending';
    if (s === 'cancelled' || s === 'canceled' || s === 'declined') return 'declined';
    return 'declined';
  };

  return (
    <div className="schedule-page">

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Header Section */}
        <header className="header">
          <div className="header-wrapper">
            {/* Title & Subtitle */}
            <div className="header-title">
              <h2>Fleet Schedule</h2>
              <div className="header-subtitle">
                <span>Manage and oversee all vehicle bookings</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="toolbar">
              {/* Status Filter */}
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>

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

          {/* Date Navigation */}
          <div className="date-controls">
            <button className="nav-btn" onClick={() => navigate('prev')}>
              <span><i class="fa-solid fa-angle-left"></i></span>
            </button>
            <div className="date-display">
              {view === 'week'
                ? `${formatDate(weekDays[0], 'MMM d')} - ${formatDate(weekDays[6], 'MMM d')}`
                : formatDate(currentDate, 'd')
              }
            </div>
            <button className="nav-btn" onClick={() => navigate('next')}>
              <span><i class="fa-solid fa-angle-right"></i></span>
            </button>
            <button className="btn-today" onClick={() => setCurrentDate(new Date())}>Today</button>
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
                <div className="calendar-body">
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
                            return (
                              <div key={slotIdx} className="time-slot-container" style={{height: '80px', position: 'relative'}}>
                                {bookings.map((booking, idx) => (
                                  <div
                                    key={idx}
                                    className={`booking-card ${getStatusClass(booking.status)}`}
                                    onClick={() => handleEdit(booking)}
                                    style={{cursor: 'pointer', top: `${idx * 20}px`}}
                                  >
                                    <div className="booking-title">{booking.purpose || booking.vehicleName}</div>
                                    <div className="booking-time">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
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
                  return (
                    <div key={idx} className="day-slot">
                      <div className="slot-time">{time}</div>
                      <div className="slot-content">
                        {bookings.map((booking, bidx) => (
                          <div 
                            key={bidx}
                            className={`booking-card ${getStatusClass(booking.status)}`}
                            onClick={() => handleEdit(booking)}
                          >
                            <div className="booking-title">{booking.purpose || booking.vehicleName}</div>
                            <div className="booking-time">{booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}</div>
                            <div className="booking-desc">{booking.location}</div>
                          </div>
                        ))}
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
