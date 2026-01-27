import React, { useState } from "react";
import "./ViewBookings.css";

function ViewBookings() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock booking data
  const mockBookings = [
    {
      id: 1,
      vehicleName: "Ford Transit - Van 02",
      startTime: "09:00",
      endTime: "10:30",
      date: new Date(2025, 0, 15),
      purpose: "Client Site Visit",
      location: "Downtown Distribution Center",
      status: "approved",
      notes: "Client meeting for project discussion",
      createdDate: new Date(2025, 0, 10),
    },
    {
      id: 2,
      vehicleName: "Toyota Camry",
      startTime: "14:00",
      endTime: "15:30",
      date: new Date(2025, 0, 16),
      purpose: "Executive Transport",
      location: "Airport Terminal",
      status: "pending",
      notes: "Airport pickup for visiting executive",
      createdDate: new Date(2025, 0, 14),
    },
    // add more as needed
  ];

  // Filter bookings
  const filteredBookings = mockBookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "approved";
      case "pending":
        return "pending";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "";
    }
  };

  const openDialog = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedBooking(null);
    setDialogOpen(false);
  };

  const statusCounts = {
    all: mockBookings.length,
    approved: mockBookings.filter((b) => b.status === "approved").length,
    pending: mockBookings.filter((b) => b.status === "pending").length,
    completed: mockBookings.filter((b) => b.status === "completed").length,
    cancelled: mockBookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="view-bookings">
      {/* Header */}
      <header className="vb-header">
        <h1>My Bookings</h1>
        <p>View and manage all your vehicle bookings</p>
      </header>

      {/* Stats */}
      <section className="vb-stats">
        {Object.entries(statusCounts).map(([key, count]) => (
          <div key={key} className={`stat-card ${key}`}>
            <div className="stat-number">{count}</div>
            <div className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="vb-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by vehicle, purpose, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="status-filter">
          {["all", "approved", "pending", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Bookings List */}
      <section className="vb-content">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">event_busy</span>
            <h3>No Bookings Found</h3>
            <p>No bookings match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-item ${getStatusClass(booking.status)}`}>
                <div className="booking-header">
                  <div>
                    <h3>{booking.purpose}</h3>
                    <p>{booking.vehicleName}</p>
                  </div>
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="booking-details">
                  <div>
                    <strong>Date:</strong> {formatDate(booking.date)}
                  </div>
                  <div>
                    <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                  </div>
                  <div>
                    <strong>Location:</strong> {booking.location}
                  </div>
                  {booking.notes && (
                    <div>
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}
                </div>

                <div className="booking-footer">
                  <span>Created: {formatDate(booking.createdDate)}</span>
                  <button className="btn-view" onClick={() => openDialog(booking)}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dialog */}
      {dialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <header className="dialog-header">
              <h3>Booking Details</h3>
              <button onClick={closeDialog} className="dialog-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="dialog-content">
              <div>
                <p>
                  <strong>Purpose:</strong> {selectedBooking.purpose}
                </p>
                <p>
                  <strong>Vehicle:</strong> {selectedBooking.vehicleName}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedBooking.date)}
                </p>
                <p>
                  <strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
                </p>
                <p>
                  <strong>Location:</strong> {selectedBooking.location}
                </p>
                {selectedBooking.notes && (
                  <p>
                    <strong>Notes:</strong> {selectedBooking.notes}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status.toUpperCase()}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(selectedBooking.createdDate)}
                </p>
              </div>
            </div>

            <footer className="dialog-footer">
              <button className="btn-secondary" onClick={closeDialog}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewBookings;
