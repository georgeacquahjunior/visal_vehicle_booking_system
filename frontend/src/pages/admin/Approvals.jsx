import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import {
  approveBookingAPI,
  declineBookingAPI,
  fetchApprovalBookings,
  formatDate,
  isPastBooking,
} from "../../utils/approvals";

const PAGE_SIZE = 5;

function Approvals() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApprovalBookings();
        setBookings(
          data
            .filter((booking) => booking.status !== "cancelled")
            .sort((a, b) => {
              const ad = a.date ? a.date.getTime() : 0;
              const bd = b.date ? b.date.getTime() : 0;
              if (bd !== ad) return bd - ad;
              return (b.startTime || "").localeCompare(a.startTime || "");
            })
        );
      } catch (err) {
        setError(err.message || "Failed to load booking requests");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setOpenActionId(null);
  }, [searchTerm, statusFilter]);

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return bookings.filter((booking) => {
      const statusMatches = statusFilter === "all" || booking.status === statusFilter;
      const searchMatches =
        !search ||
        [booking.userName, booking.purpose, booking.location, booking.vehicleName, booking.userDept]
          .some((value) => (value || "").toString().toLowerCase().includes(search));
      return statusMatches && searchMatches;
    });
  }, [bookings, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleBookings = filteredBookings.slice(pageStart, pageStart + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    approved: bookings.filter((booking) => booking.status === "approved").length,
    declined: bookings.filter((booking) => booking.status === "declined").length,
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setOpenActionId(null);
    setViewDialogOpen(true);
  };

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setActionError("");
    setOpenActionId(null);
    setApproveDialogOpen(true);
  };

  const handleDecline = (booking) => {
    setSelectedBooking(booking);
    setDeclineReason("");
    setActionError("");
    setOpenActionId(null);
    setDeclineDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedBooking) return;
    setProcessingId(selectedBooking.id);
    setActionError("");
    try {
      await approveBookingAPI(selectedBooking.id);
      setBookings((current) =>
        current.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, status: "approved", approvedBy: "Admin" } : booking
        )
      );
      setApproveDialogOpen(false);
      setSelectedBooking(null);
      setSuccessMessage("Booking approved successfully.");
    } catch (err) {
      setActionError(err.message || "Failed to approve booking.");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDecline = async () => {
    if (!selectedBooking || !declineReason.trim()) return;
    setProcessingId(selectedBooking.id);
    setActionError("");
    try {
      await declineBookingAPI(selectedBooking.id, declineReason.trim());
      setBookings((current) =>
        current.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, status: "declined", declineReason: declineReason.trim() }
            : booking
        )
      );
      setDeclineDialogOpen(false);
      setSelectedBooking(null);
      setDeclineReason("");
      setSuccessMessage("Booking declined successfully.");
    } catch (err) {
      setActionError(err.message || "Failed to decline booking.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-0 text-[#11233f]">
      <section className="grid grid-cols-1 gap-5 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white bg-[radial-gradient(circle_at_top_right,rgba(80,133,214,0.22),transparent_28%),radial-gradient(circle_at_left_center,rgba(17,74,157,0.18),transparent_32%)] p-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.95fr)]">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Booking approvals</div>
          <h1 className="my-2.5 max-w-[12ch] text-[clamp(2rem,3vw,3rem)] font-bold leading-tight text-[#11233f]">
            Review and manage vehicle requests
          </h1>
          <p className="m-0 max-w-[65ch] text-[15px] leading-7 text-[#53657f]">
            Process requests with clearer table controls, duration visibility, and fast row actions.
          </p>
        </div>

        <div className="flex min-h-[180px] flex-col justify-between gap-3 rounded-3xl bg-gradient-to-br from-[#113f82] to-[#1d62bf] p-[22px] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Quick stats</span>
            <Clock3 size={18} />
          </div>
          <strong className="text-2xl font-bold">{statusCounts.pending} pending</strong>
          <p className="m-0 text-white/85">{statusCounts.all} total requests</p>
          <span className="text-white/85">{statusCounts.approved} approved this period</span>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={CalendarClock} label="Total requests" value={statusCounts.all} detail="All booking requests in system" tone="blue" />
        <MetricCard icon={AlertCircle} label="Pending review" value={statusCounts.pending} detail="Awaiting admin decision" tone="amber" />
        <MetricCard icon={CheckCircle2} label="Approved" value={statusCounts.approved} detail="Successfully processed" tone="green" />
        <MetricCard icon={X} label="Declined" value={statusCounts.declined} detail="Not approved for booking" tone="red" />
      </section>

      {(error || successMessage) && (
        <div className={`mt-5 flex items-center gap-3 rounded-2xl border px-5 py-4 ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="flex-1 text-sm font-semibold">{error || successMessage}</span>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-black/5"
            onClick={() => {
              setError(null);
              setSuccessMessage("");
            }}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6">
        <div className="mb-[18px] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Request queue</p>
            <h2 className="mt-1.5 text-xl font-semibold text-[#11233f]">Booking requests</h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-2.5 text-xs font-semibold text-[#114a9d]">
            <Filter size={16} />
            <span>{filteredBookings.length} shown</span>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8ba5]" />
            <input
              type="text"
              className="w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white py-2.5 pl-10 pr-10 text-sm focus:border-[#1469e1] focus:outline-none"
              placeholder="Search requester, purpose, location, or vehicle..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#7b8ba5] hover:text-[#11233f]"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={statusFilter === "all"} label="All" count={statusCounts.all} onClick={() => setStatusFilter("all")} />
            <FilterButton active={statusFilter === "pending"} label="Pending" count={statusCounts.pending} onClick={() => setStatusFilter("pending")} />
            <FilterButton active={statusFilter === "approved"} label="Approved" count={statusCounts.approved} onClick={() => setStatusFilter("approved")} />
            <FilterButton active={statusFilter === "declined"} label="Declined" count={statusCounts.declined} onClick={() => setStatusFilter("declined")} />
          </div>
        </div>

        {loading ? (
          <PanelState>Loading booking requests...</PanelState>
        ) : filteredBookings.length === 0 ? (
          <PanelState>
            <CalendarClock size={44} />
            <span>No booking requests match your current filters.</span>
          </PanelState>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead className="bg-[#f4f7fb]">
                  <tr>
                    {["Requester", "Purpose", "Date & time", "Duration", "Location", "Status", ""].map((heading) => (
                      <th key={heading || "actions"} className="border-b border-[rgba(15,23,42,0.08)] px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((booking) => {
                    const disabled = processingId === booking.id || isPastBooking(booking.date);
                    const isPending = booking.status === "pending";

                    return (
                      <tr key={booking.id} className="border-b border-[rgba(15,23,42,0.06)] hover:bg-[rgba(17,74,157,0.03)]">
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d62bf] to-[#113f82] font-bold text-white">
                              {nameInitials(booking.userName)}
                            </div>
                            <div className="min-w-0">
                              <strong className="block truncate font-semibold text-[#11233f]">{booking.userName}</strong>
                              <span className="text-xs text-[#7b8ba5]">{booking.userDept || "No department"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[220px] px-4 py-4 align-middle text-[#53657f]">
                          <span className="line-clamp-2">{booking.purpose}</span>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="leading-tight text-[#53657f]">
                            <div className="font-semibold text-[#11233f]">{formatDate(booking.date)}</div>
                            <div className="mt-1 text-xs text-[#7b8ba5]">{booking.startTime} - {booking.endTime}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {calculateDuration(booking.startTime, booking.endTime)}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle text-[#53657f]">{booking.location}</td>
                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(booking.status)}`}>
                            {statusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="relative px-4 py-4 text-right align-middle">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                            onClick={() => setOpenActionId((id) => (id === booking.id ? null : booking.id))}
                            aria-label={`Open actions for ${booking.userName}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openActionId === booking.id && (
                            <div className="absolute right-4 top-14 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                              <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => handleView(booking)}>
                                View details
                              </button>
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => handleApprove(booking)}
                                    disabled={disabled}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => handleDecline(booking)}
                                    disabled={disabled}
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="text-sm font-medium text-[#7b8ba5]">
                Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <PaginationButton disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  <ChevronLeft size={16} />
                </PaginationButton>
                {pageNumbers.map((page) => (
                  <PaginationButton key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationButton>
                ))}
                <PaginationButton disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  <ChevronRight size={16} />
                </PaginationButton>
              </div>
            </div>
          </>
        )}
      </section>

      {viewDialogOpen && selectedBooking && (
        <BookingDialog title="Booking details" onClose={() => setViewDialogOpen(false)}>
          <BookingSummary booking={selectedBooking} />
          <div className="flex justify-end">
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setViewDialogOpen(false)}>
              Close
            </button>
          </div>
        </BookingDialog>
      )}

      {approveDialogOpen && selectedBooking && (
        <BookingDialog title="Approve booking request" onClose={() => !processingId && setApproveDialogOpen(false)}>
          <BookingSummary booking={selectedBooking} />
          {actionError && <ErrorBox>{actionError}</ErrorBox>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setApproveDialogOpen(false)} disabled={Boolean(processingId)}>
              Cancel
            </button>
            <button type="button" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={confirmApprove} disabled={Boolean(processingId)}>
              {processingId ? "Processing..." : "Confirm approval"}
            </button>
          </div>
        </BookingDialog>
      )}

      {declineDialogOpen && selectedBooking && (
        <BookingDialog title="Decline booking request" onClose={() => !processingId && setDeclineDialogOpen(false)}>
          <BookingSummary booking={selectedBooking} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#11233f]">Reason for decline</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="Add a clear reason for the requester..."
            />
          </label>
          {actionError && <ErrorBox>{actionError}</ErrorBox>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setDeclineDialogOpen(false)} disabled={Boolean(processingId)}>
              Cancel
            </button>
            <button type="button" className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={confirmDecline} disabled={Boolean(processingId) || !declineReason.trim()}>
              {processingId ? "Processing..." : "Decline booking"}
            </button>
          </div>
        </BookingDialog>
      )}
    </div>
  );
}

function MetricCard({ detail, icon: Icon, label, tone, value }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
  };

  return (
    <article className="flex gap-4 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-[22px]">
      <div className={`inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">{label}</p>
        <h3 className="my-1.5 text-3xl font-bold leading-none">{value}</h3>
        <span className="text-xs leading-tight text-[#53657f]">{detail}</span>
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
          ? "border-sky-500 bg-sky-400 text-white shadow-sm"
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

function PaginationButton({ active = false, children, disabled = false, onClick }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors ${
        active
          ? "border-[#1469e1] bg-[#1469e1] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function PanelState({ children }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#f7f9fc] to-[#eef4fb] p-5 text-center text-[#53657f]">
      {children}
    </div>
  );
}

function BookingDialog({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Booking action</p>
            <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">{title}</h2>
          </div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 p-6">{children}</div>
      </div>
    </div>
  );
}

function BookingSummary({ booking }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
      <SummaryItem label="Requester" value={booking.userName} />
      <SummaryItem label="Department" value={booking.userDept || "No department"} />
      <SummaryItem label="Purpose" value={booking.purpose} />
      <SummaryItem label="Location" value={booking.location} />
      <SummaryItem label="Date" value={formatDate(booking.date)} />
      <SummaryItem label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <strong className="mt-1 block text-sm text-[#11233f]">{value || "N/A"}</strong>
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      <AlertCircle size={18} />
      {children}
    </div>
  );
}

function nameInitials(value) {
  if (!value) return "U";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function calculateDuration(start, end) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return "N/A";
  const hours = (endMinutes - startMinutes) / 60;
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} hr${hours === 1 ? "" : "s"}`;
}

function timeToMinutes(value) {
  if (!value) return null;
  const match = value.toString().trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function statusLabel(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusBadgeClass(status) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "declined") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export default Approvals;
