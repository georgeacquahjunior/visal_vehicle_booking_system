import React, { useState, useEffect } from "react";
import { Clock, MapPin, FileText, CheckCircle, AlertCircle, XCircle, BarChart3 } from "lucide-react";
import "./ViewBookings.css";
import { API_BASE_URL } from "../../config.js";

function ViewBookings() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem("staff_id");
      const staffId = stored ? stored : "1";

      try {
        const res = await fetch(`${API_BASE}/bookings/staff/${staffId}`);
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        const data = await res.json();

        // backend returns { staff: {...}, total_bookings, bookings: [...] }
        const remote = Array.isArray(data.bookings) ? data.bookings : [];

        // map backend booking shape to this component's expected fields
        const mapped = remote.map((b) => ({
          id: b.booking_id,
          vehicleName: b.vehicle_name || b.vehicle || "Company Vehicle",
          startTime: b.start_time,
          endTime: b.end_time,
          date: b.booking_date ? new Date(b.booking_date) : null,
          purpose: b.purpose,
          location: b.location,
          // normalize status to lowercase (trim to be safe) so CSS classnames match
          status: b.status ? b.status.toString().trim().toLowerCase() : "",
          notes: b.notes,
          createdDate: b.created_at ? new Date(b.created_at) : null,
        }));

        setBookings(mapped);
      } catch (err) {
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings
  const sourceBookings = bookings;
  const filteredBookings = sourceBookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (booking.vehicleName && booking.vehicleName.toLowerCase().includes(q)) ||
      (booking.purpose && booking.purpose.toLowerCase().includes(q)) ||
      (booking.location && booking.location.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getStatusClass = (status) => {
    const s = (status || "").toString().trim().toLowerCase();
    switch (s) {
      case "approved":
        return "approved";
      case "pending":
        return "pending";
      case "completed":
        return "completed";
      case "declined":
        return "declined";
      default:
        return "";
    }
  };

  const statusCounts = {
    all: sourceBookings.length,
    approved: sourceBookings.filter((b) => b.status === "approved").length,
    pending: sourceBookings.filter((b) => b.status === "pending").length,
    declined: sourceBookings.filter((b) => b.status === "declined").length,
  };

  const displayedBookings = filteredBookings.slice(0, visibleCount);
  const hasMoreBookings = filteredBookings.length > visibleCount;

  useEffect(() => {
    setVisibleCount(4);
  }, [statusFilter, searchTerm, bookings]);

  return (
    <div className="view-bookings">
      <div className="vb-container">
        {/* Header */}
        <header className="vb-header">
          <div>
            <h1>My Bookings</h1>
            <p>Track, manage, and review all your vehicle booking requests.</p>
          </div>
        </header>

        {/* Stats */}
        <section className="vb-stats">
        {Object.entries(statusCounts).map(([key, count]) => {
          const getIcon = (status) => {
            switch(status) {
              case 'all': return <BarChart3 size={18} />;
              case 'approved': return <CheckCircle size={18} />;
              case 'pending': return <Clock size={18} />;
              case 'declined': return <XCircle size={18} />;
              default: return null;
            }
          };
          
          return (
            <div key={key} className={`stat-card ${key}`}>
              <div className="stat-number">{count}</div>
              <div className="stat-label">
                {getIcon(key)}
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
            </div>
          );
        })}
      </section>

        {/* Filters */}
        <section className="vb-filters">
        <input
          type="text"
          className="vb-search-input"
          placeholder="Search by vehicle, purpose, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="status-filter">
          {["all", "approved", "pending", "declined"].map((status) => (
            <button
              key={status}
              className={`bookings-filter-btn ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Bookings List */}
      <section className="vb-content">
        {loading ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>Loading bookings...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>Failed to load bookings</h3>
            <p>{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Bookings Found</h3>
            <p>No bookings match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="bookings-grid">
              {displayedBookings.map((booking) => (
                <div key={booking.id} className={`booking-item ${getStatusClass(booking.status)}`}>
                <div className="vb-booking-header">
                  <div>
                    <h3>{booking.purpose}</h3>
                    <p>{booking.vehicleName}</p>
                  </div>
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status ? booking.status.toUpperCase() : ""}
                  </span>
                </div>

                <div className="booking-details">
                  <div>
                    <p className="view-card-label">Date:</p> {booking.date ? formatDate(booking.date) : "N/A"}
                  </div>
                  <div>
                    <p className="view-card-label">Time:</p> {booking.startTime || ""} - {booking.endTime || ""}
                  </div>
                  <div>
                    <p className="view-card-label">Location:</p> {booking.location}
                  </div>
                  {booking.notes && (
                    <div>
                      <p className="view-card-label">Notes:</p> {booking.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBookings.length > 0 && (
            <div className="vb-results-summary">
              Showing {Math.min(visibleCount, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
          )}

          {hasMoreBookings && (
            <div className="load-more-container">
              <button
                type="button"
                className="load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 4)}
              >
                Load more bookings
              </button>
            </div>
          )}
        </>
        )}
      </section>
      </div>
    </div>
  );
}

export default ViewBookings;
