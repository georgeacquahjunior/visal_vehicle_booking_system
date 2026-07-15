import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Clock3,
  Filter,
  Mail,
  MapPin,
  MoreVertical,
  Search,
  X,
  XCircle,
} from "lucide-react";
import {
  approveBookingAPI,
  declineBookingAPI,
  fetchApprovalBookings,
  formatDate,
  isPastBooking,
} from "../../utils/approvals";
import { colorForName } from "../../utils/avatar.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import useGreeting from "../../hooks/useGreeting.js";
import { showToast } from "../../utils/toast.js";

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // The action menu is identified by a custom attribute `data-action-menu`
      // We check if the click is outside any element with this attribute.
      if (openActionId !== null && !event.target.closest('[data-action-menu]')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openActionId]);

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

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleBookings = filteredBookings.slice(pageStart, pageStart + PAGE_SIZE);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    approved: bookings.filter((booking) => booking.status === "approved").length,
    declined: bookings.filter((booking) => booking.status === "declined").length,
  };

  const { todayLabel } = useGreeting();

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
      showToast("Booking approved successfully.", "success");
    } catch (err) {
      const message = err.message || "Failed to approve booking.";
      setActionError(message);
      showToast(message, "error");
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
      showToast("Booking declined successfully.", "success");
    } catch (err) {
      const message = err.message || "Failed to decline booking.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-0 text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <CheckCircle2 size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Booking approvals</h1>
            <InfoButton text="Process requests with clearer table controls, duration visibility, and fast row actions." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <CheckCircle2 size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock3 size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{statusCounts.pending} pending</strong>
              <span className="text-[#7b8ba5]"> · {statusCounts.all} total · {statusCounts.approved} approved</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={CalendarClock} label="Total requests" value={statusCounts.all} detail="All booking requests in system" tone="blue" />
        <MetricCard icon={AlertCircle} label="Pending review" value={statusCounts.pending} detail="Awaiting admin decision" tone="amber" />
        <MetricCard icon={CheckCircle2} label="Approved" value={statusCounts.approved} detail="Successfully processed" tone="green" />
        <MetricCard icon={X} label="Declined" value={statusCounts.declined} detail="Not approved for booking" tone="red" />
      </section>

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
          <AlertCircle size={18} />
          <span className="flex-1 text-sm font-semibold">{error}</span>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-black/5"
            onClick={() => setError(null)}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
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
            <div className="rounded-2xl border border-slate-200 bg-white">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-[#f4f7fb]">
                  <tr>
                    <th className="w-[24%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]">Requester</th>
                    <th className="w-[22%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]">Purpose</th>
                    <th className="w-[18%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]">Date & time</th>
                    <th className="hidden w-[10%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c] lg:table-cell">Duration</th>
                    <th className="hidden w-[14%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c] md:table-cell">Location</th>
                    <th className="w-[12%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]">Status</th>
                    <th className="w-[10%] border-b border-slate-200 px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#61728c]" />
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
                            <div
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-white"
                              style={{ backgroundColor: colorForName(booking.userName) }}
                            >
                              {nameInitials(booking.userName)}
                            </div>
                            <div className="min-w-0">
                              <strong className="block truncate font-semibold text-[#11233f]">{booking.userName}</strong>
                              <span className="block truncate text-xs text-[#7b8ba5]">{booking.userDept || "No department"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle text-[#53657f]">
                          <span className="line-clamp-2">{booking.purpose}</span>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="leading-tight text-[#53657f]">
                            <div className="truncate font-semibold text-[#11233f]">{formatDate(booking.date)}</div>
                            <div className="mt-1 truncate text-xs text-[#7b8ba5]">{booking.startTime} - {booking.endTime}</div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-4 align-middle lg:table-cell">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {calculateDuration(booking.startTime, booking.endTime)}
                          </span>
                        </td>
                        <td className="hidden truncate px-4 py-4 align-middle text-[#53657f] md:table-cell">{booking.location}</td>
                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(booking.status)}`}>
                            {statusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="relative px-4 py-4 text-right align-middle">
                          <button
                            data-action-menu
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                            onClick={() => setOpenActionId((id) => (id === booking.id ? null : booking.id))}
                            aria-label={`Open actions for ${booking.userName}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openActionId === booking.id && (
                            <div data-action-menu className="absolute right-4 top-14 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
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

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={filteredBookings.length} />
          </>
        )}
      </section>

      {viewDialogOpen && selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          onClose={() => setViewDialogOpen(false)}
          onApprove={() => {
            setViewDialogOpen(false);
            handleApprove(selectedBooking);
          }}
          onDecline={() => {
            setViewDialogOpen(false);
            handleDecline(selectedBooking);
          }}
        />
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
  const toneStyles = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30" },
    green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30" },
    red: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/30" },
  };
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <article className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm ${styles.border}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${styles.bg}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-4xl font-bold leading-none text-slate-800">{value}</h3>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
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

function PanelState({ children }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#f7f9fc] to-[#eef4fb] p-5 text-center text-[#53657f]">
      {children}
    </div>
  );
}

function BookingDialog({ children, onClose, title }) {
  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white">
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
    </Modal>
  );
}

function BookingDetailsDialog({ booking, onApprove, onClose, onDecline }) {
  const isPending = booking.status === "pending";

  const detailRows = [
    { icon: CalendarDays, label: "Date", value: formatDate(booking.date) },
    { icon: Clock, label: "Time", value: `${booking.startTime} - ${booking.endTime}` },
    { icon: Clock3, label: "Duration", value: calculateDuration(booking.startTime, booking.endTime) },
    { icon: Car, label: "Vehicle", value: booking.vehicleName || "Not assigned" },
    { icon: MapPin, label: "Location", value: booking.location },
    { icon: Building2, label: "Department", value: booking.userDept },
    { icon: Mail, label: "Requester email", value: booking.userEmail },
    { icon: CalendarDays, label: "Submitted", value: booking.submittedDate ? formatDate(booking.submittedDate) : null },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between p-6 pb-0">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Booking details</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#11233f]"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3.5 p-6 pt-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: colorForName(booking.userName) }}
          >
            {nameInitials(booking.userName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate text-base font-bold text-[#11233f]">{booking.userName}</h2>
            <p className="m-0 mt-0.5 truncate text-sm text-slate-500">{booking.userDept || "No department"}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(booking.status)}`}>
            {statusLabel(booking.status)}
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6">
          <p className="m-0 rounded-xl bg-slate-50 p-4 text-sm font-medium leading-relaxed text-[#11233f]">
            {booking.purpose || "N/A"}
          </p>

          <dl className="mt-2 divide-y divide-slate-100">
            {detailRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3">
                <dt className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon size={15} className="shrink-0 text-slate-400" />
                  {label}
                </dt>
                <dd className="m-0 truncate text-right text-sm font-semibold text-[#11233f]">{value || "N/A"}</dd>
              </div>
            ))}
          </dl>

          {booking.notes && (
            <div className="mb-4 border-t border-slate-100 pt-4">
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-400">Additional notes</span>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">{booking.notes}</p>
            </div>
          )}

          {booking.status === "declined" && booking.declineReason && (
            <div className="mb-5 flex items-start gap-2.5 border-l-2 border-rose-400 py-1 pl-3.5">
              <XCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="m-0 text-sm text-slate-600">
                <strong className="font-semibold text-rose-700">Declined —</strong> {booking.declineReason}
              </p>
            </div>
          )}

          {booking.status === "approved" && booking.approvedBy && (
            <div className="mb-5 flex items-start gap-2.5 border-l-2 border-emerald-400 py-1 pl-3.5">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
              <p className="m-0 text-sm text-slate-600">
                <strong className="font-semibold text-emerald-700">Approved</strong> by {booking.approvedBy}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-6">
          <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={onClose}>
            Close
          </button>
          {isPending && !isPastBooking(booking.date) && (
            <>
              <button type="button" className="rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50" onClick={onDecline}>
                Decline
              </button>
              <button type="button" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800" onClick={onApprove}>
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
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
