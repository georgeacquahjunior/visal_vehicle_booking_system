import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Ban,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Clock3,
  Eye,
  FileText,
  LayoutGrid,
  List,
  ListChecks,
  MapPin,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config.js";
import { cancelBookingAPI } from "../utils/bookings.js";
import { isPastBooking } from "../utils/approvals.js";
import InfoButton from "../components/InfoButton";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import useGreeting from "../hooks/useGreeting.js";
import { showToast } from "../utils/toast.js";

const PAGE_SIZE = 9;

const STATUS_BADGE_CLASS = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-cyan-50 text-cyan-700",
  declined: "bg-rose-50 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function ViewBookings() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");

  const [detailsTarget, setDetailsTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const { todayLabel } = useGreeting();

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    const stored = localStorage.getItem("staff_id");
    const staffId = stored ? stored : "1";

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/staff/${staffId}`);
      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }
      const data = await res.json();

      // backend returns { staff: {...}, total_bookings, bookings: [...] }
      const remote = Array.isArray(data.bookings) ? data.bookings : [];

      const mapped = remote
        .map((b) => ({
          id: b.booking_id,
          startTime: b.start_time,
          endTime: b.end_time,
          date: b.booking_date ? new Date(b.booking_date) : null,
          purpose: b.purpose,
          location: b.location,
          status: b.status ? b.status.toString().trim().toLowerCase() : "",
          notes: b.notes,
          adminComment: b.admin_comment,
          createdDate: b.created_at ? new Date(b.created_at) : null,
        }))
        .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

      setBookings(mapped);
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (booking.purpose && booking.purpose.toLowerCase().includes(q)) ||
      (booking.location && booking.location.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: bookings.length,
    approved: bookings.filter((b) => b.status === "approved").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    declined: bookings.filter((b) => b.status === "declined").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleBookings = filteredBookings.slice(pageStart, pageStart + PAGE_SIZE);

  const formatDate = (date) =>
    date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "N/A";

  const canCancel = (booking) => (booking.status === "pending" || booking.status === "approved") && !isPastBooking(booking.date);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setProcessingId(cancelTarget.id);
    setActionError("");
    try {
      await cancelBookingAPI(cancelTarget.id);
      setBookings((current) => current.map((b) => (b.id === cancelTarget.id ? { ...b, status: "cancelled" } : b)));
      showToast("Booking cancelled.", "success");
      setCancelTarget(null);
    } catch (err) {
      const message = err.message || "Failed to cancel booking.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <ListChecks size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">My Bookings</h1>
            <InfoButton text="Track, manage, and review all your vehicle booking requests." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <CalendarClock size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock3 size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{statusCounts.pending} pending</strong>
              <span className="text-[#7b8ba5]"> · {statusCounts.all} total requests</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={ListChecks} label="Total requests" value={statusCounts.all} tone="blue" />
        <MetricCard icon={CheckCircle2} label="Approved" value={statusCounts.approved} tone="green" />
        <MetricCard icon={Clock3} label="Pending" value={statusCounts.pending} tone="amber" />
        <MetricCard icon={XCircle} label="Declined" value={statusCounts.declined} tone="red" />
        <MetricCard icon={Ban} label="Cancelled" value={statusCounts.cancelled} tone="slate" />
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
          <div className="relative w-full max-w-[200px] shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8ba5]" />
            <input
              type="text"
              className="w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white py-2.5 pl-9 pr-8 text-sm focus:border-[#1469e1] focus:outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#7b8ba5] hover:text-[#11233f]"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex gap-2">
              <FilterButton active={statusFilter === "all"} label="All" count={statusCounts.all} onClick={() => setStatusFilter("all")} />
              <FilterButton active={statusFilter === "approved"} label="Approved" count={statusCounts.approved} onClick={() => setStatusFilter("approved")} />
              <FilterButton active={statusFilter === "pending"} label="Pending" count={statusCounts.pending} onClick={() => setStatusFilter("pending")} />
              <FilterButton active={statusFilter === "declined"} label="Declined" count={statusCounts.declined} onClick={() => setStatusFilter("declined")} />
              <FilterButton active={statusFilter === "cancelled"} label="Cancelled" count={statusCounts.cancelled} onClick={() => setStatusFilter("cancelled")} />
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  view === "grid" ? "bg-white text-[#1469e1] shadow-sm" : "text-slate-500 hover:text-[#11233f]"
                }`}
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  view === "list" ? "bg-white text-[#1469e1] shadow-sm" : "text-slate-500 hover:text-[#11233f]"
                }`}
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <PanelState>Loading bookings...</PanelState>
        ) : error ? (
          <PanelState error>{error}</PanelState>
        ) : filteredBookings.length === 0 ? (
          <PanelState>
            <FileText size={40} />
            <span>No bookings match your current filters.</span>
          </PanelState>
        ) : view === "grid" ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#1469e1]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="m-0 line-clamp-2 text-base font-bold leading-snug text-[#11233f]">{booking.purpose || "N/A"}</h3>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                      {booking.status || "Unknown"}
                    </span>
                  </div>

                  <div className="space-y-2 rounded-xl border border-slate-100 bg-[#f8fbff] p-3.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="shrink-0 text-slate-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0 text-slate-400" />
                      {booking.startTime || "—"} - {booking.endTime || "—"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{booking.location || "N/A"}</span>
                    </div>
                    {booking.notes && (
                      <div className="flex items-start gap-2">
                        <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{booking.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsTarget(booking)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                    >
                      <Eye size={14} />
                      View details
                    </button>
                    {canCancel(booking) && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(booking)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <Ban size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={filteredBookings.length} />
          </>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[820px] table-fixed border-collapse bg-white">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-[26%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Purpose</th>
                    <th className="w-[16%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Date</th>
                    <th className="w-[14%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Time</th>
                    <th className="hidden w-[16%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500 md:table-cell">Location</th>
                    <th className="w-[14%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
                    <th className="w-[14%] border-b border-slate-200 px-4 py-3.5 text-right text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="px-4 py-3.5 align-middle">
                        <span className="line-clamp-2 text-sm font-semibold text-[#11233f]" title={booking.purpose || undefined}>
                          {booking.purpose || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm text-slate-600">{formatDate(booking.date)}</td>
                      <td className="px-4 py-3.5 align-middle text-sm text-slate-600">{booking.startTime || "—"} - {booking.endTime || "—"}</td>
                      <td className="hidden truncate px-4 py-3.5 align-middle text-sm text-slate-600 md:table-cell">{booking.location || "N/A"}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                          {booking.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsTarget(booking)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                            aria-label="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {canCancel(booking) && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(booking)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                              aria-label="Cancel booking"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={filteredBookings.length} />
          </>
        )}
      </section>

      {detailsTarget && (
        <Modal onClose={() => setDetailsTarget(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between p-6 pb-0">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Booking details</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#11233f]"
                onClick={() => setDetailsTarget(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-lg font-bold text-[#11233f]">{detailsTarget.purpose || "N/A"}</h2>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[detailsTarget.status] || "bg-slate-100 text-slate-600"}`}>
                  {detailsTarget.status || "Unknown"}
                </span>
              </div>

              <dl className="mt-4 divide-y divide-slate-100">
                <DetailRow icon={Calendar} label="Date" value={formatDate(detailsTarget.date)} />
                <DetailRow icon={Clock} label="Time" value={`${detailsTarget.startTime || "—"} - ${detailsTarget.endTime || "—"}`} />
                <DetailRow icon={MapPin} label="Location" value={detailsTarget.location} />
              </dl>

              {detailsTarget.notes && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-400">Additional notes</span>
                  <p className="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">{detailsTarget.notes}</p>
                </div>
              )}

              {detailsTarget.status === "declined" && detailsTarget.adminComment && (
                <div className="mt-5 flex items-start gap-2.5 border-l-2 border-rose-400 py-1 pl-3.5">
                  <XCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                  <p className="m-0 text-sm text-slate-600">
                    <strong className="font-semibold text-rose-700">Declined —</strong> {detailsTarget.adminComment}
                  </p>
                </div>
              )}

              {detailsTarget.status === "approved" && detailsTarget.adminComment && (
                <div className="mt-5 flex items-start gap-2.5 border-l-2 border-emerald-400 py-1 pl-3.5">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <p className="m-0 text-sm text-slate-600">
                    <strong className="font-semibold text-emerald-700">Approved —</strong> {detailsTarget.adminComment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-6">
              <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setDetailsTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {cancelTarget && (
        <Modal onClose={() => !processingId && setCancelTarget(null)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Booking</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">Cancel this booking?</h2>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]"
                onClick={() => setCancelTarget(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <p className="m-0 text-sm text-slate-600">
                This will cancel your <strong className="text-[#11233f]">{cancelTarget.purpose}</strong> request for{" "}
                {formatDate(cancelTarget.date)}. This can't be undone.
              </p>

              {actionError && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <AlertCircle size={18} />
                  {actionError}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setCancelTarget(null)}
                  disabled={Boolean(processingId)}
                >
                  Keep booking
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={confirmCancel}
                  disabled={Boolean(processingId)}
                >
                  {processingId ? "Cancelling..." : "Cancel booking"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, tone, value }) {
  const toneStyles = {
    amber: { bg: "bg-amber-500", border: "border-amber-500/30" },
    blue: { bg: "bg-blue-500", border: "border-blue-500/30" },
    green: { bg: "bg-green-500", border: "border-green-500/30" },
    red: { bg: "bg-rose-500", border: "border-rose-500/30" },
    slate: { bg: "bg-slate-400", border: "border-slate-300" },
  };
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <article className={`flex items-center gap-4 rounded-3xl border bg-white p-5 shadow-sm ${styles.border}`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${styles.bg}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="m-0 text-2xl font-bold leading-none text-slate-800">{value}</h3>
        <p className="m-0 mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </article>
  );
}

function FilterButton({ active, count, label, onClick }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-blue-600 bg-blue-500 text-white shadow-sm"
          : "border-[rgba(15,23,42,0.12)] bg-white text-[#53657f] hover:border-[#1469e1] hover:bg-blue-50 hover:text-[#1469e1]"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={`min-w-4 rounded-lg px-1.5 py-px text-center text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-[rgba(15,23,42,0.08)] text-[#53657f]"}`}>
        {count}
      </span>
    </button>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} className="shrink-0 text-slate-400" />
        {label}
      </dt>
      <dd className="m-0 truncate text-right text-sm font-semibold text-[#11233f]">{value || "N/A"}</dd>
    </div>
  );
}

function PanelState({ children, error = false }) {
  return (
    <div className={`flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center ${error ? "bg-rose-50 text-rose-700" : "bg-gradient-to-b from-slate-50 to-blue-50 text-slate-600"}`}>
      {error && <AlertCircle size={40} />}
      {children}
    </div>
  );
}

export default ViewBookings;
