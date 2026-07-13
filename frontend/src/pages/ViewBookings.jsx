import React, { useState, useEffect } from "react";
import { Clock, MapPin, FileText, CheckCircle, AlertCircle, XCircle, BarChart3 } from "lucide-react";
import { API_BASE_URL } from "../config.js";

const STAT_CARD_CLASS = {
  all: "border-[#93c5fd] bg-[#eff6ff] [&_.stat-number]:text-[#1e40af] [&_.stat-label]:text-[#1e3a8a]",
  approved: "border-[#86efac] bg-[#f0fdf4] [&_.stat-number]:text-[#166534] [&_.stat-label]:text-[#15803d]",
  pending: "border-[#fcd34d] bg-[#fefce8] [&_.stat-number]:text-[#713f12] [&_.stat-label]:text-[#854d0e]",
  declined: "border-[#fca5a5] bg-[#fef2f2] [&_.stat-number]:text-[#7f1d1d] [&_.stat-label]:text-[#991b1b]",
};

const STATUS_BADGE_CLASS = {
  approved: "bg-[#d1fae5] text-[#065f46]",
  pending: "bg-[#fef3c7] text-[#92400e]",
  completed: "bg-[#cffafe] text-[#164e63]",
  declined: "bg-[#fee2e2] text-[#7f1d1d]",
};

const ITEM_HOVER_BORDER_CLASS = {
  approved: "hover:border-emerald-500",
  pending: "hover:border-amber-500",
  completed: "hover:border-cyan-500",
  declined: "hover:border-red-600",
};

function ViewBookings() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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
          // normalize status to lowercase (trim to be safe) so class lookups match
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
    <div className="min-h-screen bg-[#fcfbfb]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <header className="mb-7 rounded-3xl border border-blue-500/[0.15] bg-gradient-to-br from-white to-[#eef3ff] p-[30px_36px] max-md:mb-6 max-md:p-6">
          <div>
            <h1 className="m-0 mb-3 text-center text-[36px] leading-[1.1] text-[#102a55] max-md:text-[28px]">My Bookings</h1>
            <p className="m-0 text-center text-[15px] leading-[1.75] text-gray-600">Track, manage, and review all your vehicle booking requests.</p>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-7 grid grid-cols-4 gap-5 max-md:mb-6 max-md:grid-cols-2 max-md:gap-3">
          {Object.entries(statusCounts).map(([key, count]) => {
            const getIcon = (status) => {
              switch (status) {
                case 'all': return <BarChart3 size={18} />;
                case 'approved': return <CheckCircle size={18} />;
                case 'pending': return <Clock size={18} />;
                case 'declined': return <XCircle size={18} />;
                default: return null;
              }
            };

            return (
              <div key={key} className={`relative overflow-hidden rounded-[18px] border p-[28px_24px] text-center transition-all max-md:p-5 ${STAT_CARD_CLASS[key]}`}>
                <div className="stat-number mb-3 text-[42px] font-extrabold leading-none tracking-[-1px] max-md:text-2xl">{count}</div>
                <div className="stat-label flex items-center justify-center gap-1.5 text-sm font-semibold capitalize tracking-[0.02em]">
                  {getIcon(key)}
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Filters */}
        <section className="mb-7 flex flex-wrap items-center gap-4 max-md:flex-col max-md:gap-3">
          <input
            type="text"
            className="min-w-[240px] flex-1 rounded-2xl border border-[#e5e6e7] bg-white p-[14px_16px] text-[15px] outline-none focus:border-[#aacefd] max-md:min-w-0"
            placeholder="Search by vehicle, purpose, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2.5 max-md:w-full max-md:justify-start">
            {["all", "approved", "pending", "declined"].map((status) => (
              <button
                key={status}
                className={`rounded-[14px] border border-[#dbeafe] px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-[180ms] hover:border-blue-500/30 hover:bg-[#f0f7ff] hover:text-[#0f4aa1] ${
                  statusFilter === status ? "border-[#289aff] bg-[#289aff] text-white" : "bg-white"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Bookings List */}
        <section className="mb-5">
          {loading ? (
            <div className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-[80px_40px] text-center max-md:p-[60px_24px]">
              <Clock size={48} className="mb-4 text-slate-300" />
              <h3 className="mb-2 mt-4 text-2xl font-bold text-[#102a55]">Loading bookings...</h3>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-[80px_40px] text-center max-md:p-[60px_24px]">
              <AlertCircle size={48} className="mb-4 text-slate-300" />
              <h3 className="mb-2 mt-4 text-2xl font-bold text-[#102a55]">Failed to load bookings</h3>
              <p className="text-[15px] leading-[1.6] text-slate-600">{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-[80px_40px] text-center max-md:p-[60px_24px]">
              <FileText size={48} className="mb-4 text-slate-300" />
              <h3 className="mb-2 mt-4 text-2xl font-bold text-[#102a55]">No Bookings Found</h3>
              <p className="text-[15px] leading-[1.6] text-slate-600">No bookings match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-5 max-[1100px]:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-md:grid-cols-1">
                {displayedBookings.map((booking) => {
                  const statusClass = getStatusClass(booking.status);
                  return (
                    <div
                      key={booking.id}
                      className={`flex flex-col gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-6 transition-all duration-200 max-md:p-5 ${ITEM_HOVER_BORDER_CLASS[statusClass] || ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="m-0 flex-1 text-lg font-bold text-[#102a55]">{booking.purpose}</h3>
                          <p className="m-0 mt-1 text-sm text-slate-600">{booking.vehicleName}</p>
                        </div>
                        <span className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-[0.05em] ${STATUS_BADGE_CLASS[statusClass] || ""}`}>
                          {booking.status ? booking.status.toUpperCase() : ""}
                        </span>
                      </div>

                      <div className="grid gap-3 rounded-2xl border border-blue-500/[0.12] bg-[#f8fbff] p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <p className="m-0 min-w-[60px] font-semibold text-gray-500">Date:</p> {booking.date ? formatDate(booking.date) : "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <p className="m-0 min-w-[60px] font-semibold text-gray-500">Time:</p> {booking.startTime || ""} - {booking.endTime || ""}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <p className="m-0 min-w-[60px] font-semibold text-gray-500">Location:</p> {booking.location}
                        </div>
                        {booking.notes && (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <p className="m-0 min-w-[60px] font-semibold text-gray-500">Notes:</p> {booking.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBookings.length > 0 && (
                <div className="mt-[18px] text-center text-sm text-slate-600">
                  Showing {Math.min(visibleCount, filteredBookings.length)} of {filteredBookings.length} bookings
                </div>
              )}

              {hasMoreBookings && (
                <div className="mt-[22px] flex justify-center">
                  <button
                    type="button"
                    className="rounded-[14px] border-none bg-blue-600 px-[26px] py-3 font-bold text-white hover:-translate-y-px hover:bg-blue-700"
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
