import React, { useState } from "react";
import "./ScheduleView.css";

function ScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Mock bookings data
  const mockBookings = [
    { id: 1, vehicleName: 'Ford Transit - Van 02', startTime: '09:00', endTime: '10:30', date: new Date(2025, 0, 15), purpose: 'Client Site Visit', location: 'Downtown Distribution Center', status: 'approved', userName: 'Alex Johnson' },
    { id: 2, vehicleName: 'Toyota Camry', startTime: '11:15', endTime: '12:30', date: new Date(2025, 0, 16), purpose: 'Executive Transport', location: 'Downtown', status: 'pending', userName: 'You' },
    { id: 3, vehicleName: 'Maintenance Truck 01', startTime: '12:00', endTime: '14:00', date: new Date(2025, 0, 17), purpose: 'Equipment Haul', location: 'North Sector', status: 'approved', userName: 'Alex Johnson' },
    { id: 4, vehicleName: 'Pool Car - Sedan', startTime: '16:00', endTime: '16:45', date: new Date(2025, 0, 17), purpose: 'Airport Pickup', location: 'Terminal 3', status: 'approved', userName: 'Alex Johnson' },
    { id: 5, vehicleName: 'Nissan NV200', startTime: '10:00', endTime: '13:00', date: new Date(2025, 0, 18), purpose: 'Quarterly Supply Run', location: 'Warehouse', status: 'approved', userName: 'Sarah M.' },
  ];

  const filteredBookings = statusFilter === 'all' 
    ? mockBookings 
    : mockBookings.filter(b => b.status === statusFilter);

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
    if (format === 'MMMM yyyy') return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]} ${year}`;
    if (format === 'EEE') return dayName;
    if (format === 'd') return day;
    return date.toString();
  };

  const weekDays = getWeekDays();
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  const getBookingsForDay = (date) => {
    return filteredBookings.filter(b => isSameDay(b.date, date));
  };

  const getBookingsForSlot = (date, time) => {
    const dayBookings = getBookingsForDay(date);
    return dayBookings.filter(b => {
      const slotHour = parseInt(time.split(':')[0]);
      const startHour = parseInt(b.startTime.split(':')[0]);
      const endHour = parseInt(b.endTime.split(':')[0]);
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const navigate = (direction) => {
    const days = view === 'month' ? 30 : view === 'week' ? 7 : 1;
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? days : -days));
    setCurrentDate(newDate);
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      alert('Booking cancelled');
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const getStatusClass = (status) => {
    return status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'declined';
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
                <button 
                  className={`tab-btn ${view === 'month' ? 'active' : ''}`}
                  onClick={() => setView('month')}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="date-controls">
            <button className="nav-btn" onClick={() => navigate('prev')}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="date-display">
              {view === 'month' 
                ? formatDate(currentDate, 'MMMM yyyy')
                : view === 'week'
                  ? `${formatDate(weekDays[0], 'MMM d')} - ${formatDate(weekDays[6], 'MMM d')}`
                  : formatDate(currentDate, 'd')
              }
            </div>
            <button className="nav-btn" onClick={() => navigate('next')}>
              <span className="material-symbols-outlined">chevron_right</span>
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
                                    <div className="booking-title">{booking.vehicleName}</div>
                                    <div className="booking-time">{booking.startTime} - {booking.endTime}</div>
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

            {view === 'month' && (
              <div className="month-view">
                <div className="month-header">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="month-day-header">{day}</div>
                  ))}
                </div>
                <div className="month-grid">
                  {/* Placeholder for month view */}
                  <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
                    Month view calendar
                  </div>
                </div>
              </div>
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
                            <div className="booking-title">{booking.vehicleName}</div>
                            <div className="booking-time">{booking.startTime} - {booking.endTime}</div>
                            <div className="booking-desc">{booking.purpose}</div>
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

      {/* Edit Dialog */}
      {editDialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={() => setEditDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Booking Details</h3>
              <button className="dialog-close" onClick={() => setEditDialogOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dialog-content">
              <div className="dialog-title">{selectedBooking.purpose}</div>
              <div className="dialog-status">
                <span className={`status-badge ${getStatusClass(selectedBooking.status)}`}>
                  {selectedBooking.status.toUpperCase()}
                </span>
              </div>
              <div className="dialog-info">
                <div className="info-row">
                  <span className="material-symbols-outlined">person</span>
                  <span>{selectedBooking.userName}</span>
                </div>
                <div className="info-row">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                </div>
                <div className="info-row">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{selectedBooking.location}</span>
                </div>
                <div className="info-row">
                  <span className="material-symbols-outlined">directions_car</span>
                  <span>{selectedBooking.vehicleName}</span>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setEditDialogOpen(false)}>
                Close
              </button>
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'declined' && (
                <>
                  <button className="btn-primary">Edit</button>
                  <button className="btn-danger" onClick={() => {
                    setEditDialogOpen(false);
                    handleCancel(selectedBooking);
                  }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelDialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={() => setCancelDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Cancel Booking</h3>
            </div>
            <div className="dialog-content">
              <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setCancelDialogOpen(false)}>
                Keep Booking
              </button>
              <button className="btn-danger" onClick={confirmCancel}>
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleView;
