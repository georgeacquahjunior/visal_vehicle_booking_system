import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_BASE_URL } from "../../config.js";
import { approveBookingAPI, declineBookingAPI, isPastBooking } from "../../utils/approvals.js";
import { colorForName } from "../../utils/avatar.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import useGreeting from "../../hooks/useGreeting.js";
import { useSettings } from "../../hooks/useSettings.js";
import { showToast } from "../../utils/toast.js";

const PENDING_PREVIEW_LIMIT = 5;

const STATUS_COLORS = {
  approved: "#1f8f63",
  pending: "#c88810",
  declined: "#cc4a43",
};

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staffError, setStaffError] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [approveTarget, setApproveTarget] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/bookings/schedule_view`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);

        const data = await res.json();
        const remote = Array.isArray(data.bookings) ? data.bookings : [];
        const mapped = remote.map((booking) => ({
          id: booking.booking_id,
          userName: booking.staff_name || "Staff",
          department: booking.department || "Unassigned",
          bookingDate: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          location: booking.location || "Not specified",
          purpose: booking.purpose || "Not specified",
          status: booking.status ? booking.status.toString().trim().toLowerCase() : "pending",
        }));

        setRequests(
          mapped.sort((a, b) => {
            const ad = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
            const bd = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
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

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      setStaffError(null);
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${API_BASE_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);

        const data = await res.json();
        const users = Array.isArray(data.users) ? data.users : data;
        setStaff(
          users.map((user) => ({
            id: user.staff_id,
            name: user.full_name,
            role: user.role || "staff",
            status: (user.status || "active").toString().trim().toLowerCase(),
          }))
        );
      } catch (err) {
        setStaffError(err.message || "Failed to load staff");
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const stats = useMemo(() => {
    const pending = requests.filter((request) => request.status === "pending").length;
    const approved = requests.filter((request) => request.status === "approved").length;
    const declined = requests.filter((request) => request.status === "declined").length;
    const admins = staff.filter((member) => member.role === "admin").length;
    const activeStaff = staff.filter((member) => member.status === "active").length;
    const totalHours = requests.reduce((sum, request) => sum + durationHours(request.startTime, request.endTime), 0);

    return { activeStaff, admins, approved, declined, pending, totalHours };
  }, [requests, staff]);

  const pendingRequests = requests.filter((request) => request.status === "pending");
  const pendingPreview = pendingRequests.slice(0, PENDING_PREVIEW_LIMIT);
  const nextRequest = requests.find((request) => request.status === "pending") || requests[0] || null;

  const openApproveDialog = (request) => {
    setApproveTarget(request);
    setActionError("");
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setProcessingId(approveTarget.id);
    setActionError("");
    try {
      await approveBookingAPI(approveTarget.id);
      setRequests((current) =>
        current.map((item) => (item.id === approveTarget.id ? { ...item, status: "approved" } : item))
      );
      showToast("Booking approved successfully.", "success");
      setApproveTarget(null);
    } catch (err) {
      const message = err.message || "Failed to approve booking.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const openDeclineDialog = (request) => {
    setDeclineTarget(request);
    setDeclineReason("");
    setActionError("");
  };

  const confirmDecline = async () => {
    if (!declineTarget || !declineReason.trim()) return;
    setProcessingId(declineTarget.id);
    setActionError("");
    try {
      await declineBookingAPI(declineTarget.id, declineReason.trim());
      setRequests((current) =>
        current.map((item) => (item.id === declineTarget.id ? { ...item, status: "declined" } : item))
      );
      showToast("Booking declined successfully.", "success");
      setDeclineTarget(null);
      setDeclineReason("");
    } catch (err) {
      const message = err.message || "Failed to decline booking.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const statusChartData = useMemo(
    () =>
      ["pending", "approved", "declined"].map((status) => ({
        name: statusLabel(status),
        status,
        value: requests.filter((request) => request.status === status).length,
      })),
    [requests]
  );

  const departmentChartData = useMemo(() => groupByCount(requests, "department").slice(0, 6), [requests]);

  const decidedCount = stats.approved + stats.declined;
  const approvalRate = decidedCount ? Math.round((stats.approved / decidedCount) * 100) : null;
  const busiestDepartment = departmentChartData[0]?.name || "N/A";

  const adminName = (localStorage.getItem("full_name") || "Admin").split(" ")[0];
  const { greeting, todayLabel } = useGreeting();
  const { settings } = useSettings();

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <CalendarClock size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <p className="m-0 text-lg font-semibold text-[#6b7f9e]">{greeting}, {adminName} 👋</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Bookings overview</h1>
            <InfoButton text="Review incoming requests, monitor staff activity, and keep scheduling decisions moving." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <Clock3 size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock3 size={18} />
            </div>
            {nextRequest ? (
              <p className="m-0 text-[15px] text-[#11233f]">
                Next: <strong className="font-bold">{nextRequest.userName}</strong>
                <span className="text-[#7b8ba5]"> · {formatDate(nextRequest.bookingDate)} · {nextRequest.startTime}-{nextRequest.endTime}</span>
              </p>
            ) : (
              <p className="m-0 text-[15px] text-[#7b8ba5]">No pending requests — queue is up to date.</p>
            )}
            <InfoButton text="The next booking request awaiting your review." />
          </div>
        </div>
      </section>

      <section className="mt-[22px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Active staff"
          loading={staffLoading}
          value={stats.activeStaff}
          detail={`${stats.admins} admin account${stats.admins === 1 ? "" : "s"} with elevated access`}
          tone="blue"
        />
        <MetricCard icon={AlertCircle} label="Pending requests" loading={loading} value={stats.pending} detail="Awaiting admin decision" tone="amber" />
        <MetricCard icon={CheckCircle2} label="Approved requests" loading={loading} value={stats.approved} detail={`${stats.declined} declined request${stats.declined === 1 ? "" : "s"} in the full queue`} tone="green" />
        <MetricCard icon={ShieldCheck} label="System posture" loading={loading || staffLoading} value={staffError || error ? "Check" : "Stable"} detail={staffError || error ? "One or more feeds need attention" : "Core dashboard feeds are responding"} tone="indigo" />
      </section>

      <section className="mt-[22px] grid gap-[22px] xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-7">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Review queue</p>
              <h2 className="mt-1.5 text-2xl font-bold text-[#11233f]">Pending booking requests</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fff6e7] px-4 py-2 text-sm font-bold text-[#b67808]">
                <AlertCircle size={17} />
                {stats.pending}
              </span>
              <Link to="approvals" className="text-sm font-bold text-[#53657f] hover:text-[#1469e1]">
                View all →
              </Link>
            </div>
          </div>

          {loading ? (
            <PanelState>
              <div className="flex flex-col items-center gap-3">
                <Spinner />
                <span>Loading booking requests...</span>
              </div>
            </PanelState>
          ) : error ? (
            <PanelState error>{error}</PanelState>
          ) : pendingPreview.length === 0 ? (
            <PanelState>No pending booking requests right now.</PanelState>
          ) : (
            <div className="divide-y divide-[rgba(15,23,42,0.06)]">
              {pendingPreview.map((request) => {
                const isProcessing = processingId === request.id;
                const isPastDue = isPastBooking(request.bookingDate ? new Date(request.bookingDate) : null);
                const isDisabled = isProcessing || isPastDue;
                return (
                  <div key={request.id} className="flex items-center gap-5 py-5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: colorForName(request.userName) }}
                    >
                      {nameInitials(request.userName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="truncate text-lg font-bold text-[#11233f]">{request.userName}</span>
                        <span className="shrink-0 text-sm text-[#9aa9c0]">{formatDate(request.bookingDate)}</span>
                      </div>
                      <p className="mt-1.5 truncate text-sm text-[#7b8ba5]">
                        {request.startTime}–{request.endTime} · {request.location}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(request.status)}`}>
                      {statusLabel(request.status)}
                    </span>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => openDeclineDialog(request)}
                        disabled={isDisabled}
                        aria-label={`Decline ${request.userName}'s booking`}
                        title={isPastDue ? "Booking date has passed" : "Decline"}
                      >
                        <X size={19} />
                      </button>
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => openApproveDialog(request)}
                        disabled={isDisabled}
                        aria-label={`Approve ${request.userName}'s booking`}
                        title={isPastDue ? "Booking date has passed" : "Approve"}
                      >
                        <CheckCircle size={19} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Decision mix</p>
            <h2 className="mt-1 text-base font-bold text-[#11233f]">Approval status</h2>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-500">
              <Spinner />
              <span className="text-sm font-medium">Loading analytics...</span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={4}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-2 flex flex-col gap-2">
                {statusChartData.map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                      <span className="text-[#53657f]">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#11233f]">{entry.value}</span>
                      <span className="w-9 text-right text-xs text-[#9aa9c0]">
                        {requests.length ? Math.round((entry.value / requests.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[rgba(15,23,42,0.06)] pt-5">
                <MiniStat label="Approval rate" value={approvalRate === null ? "—" : `${approvalRate}%`} />
                <MiniStat label="Total requests" value={requests.length} />
                <MiniStat label="Total hours" value={stats.totalHours.toFixed(1)} />
                <MiniStat label="Top department" value={busiestDepartment} />
              </div>
            </>
          )}
        </article>
      </section>

      <section className="mt-[22px] grid gap-[22px] xl:grid-cols-2">
        <ChartPanel title="Bookings by department" subtitle="Shows where vehicle demand is coming from." loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1768db" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Queue workload" subtitle="Compares request count and booked hours for planning." loading={loading && staffLoading}>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniStat label="Total booking hours" loading={loading} value={stats.totalHours.toFixed(1)} />
            <MiniStat label="Average duration" loading={loading} value={requests.length ? `${(stats.totalHours / requests.length).toFixed(1)}h` : "0h"} />
            <MiniStat label="Pending share" loading={loading} value={requests.length ? `${Math.round((stats.pending / requests.length) * 100)}%` : "0%"} />
            <MiniStat label="Staff coverage" loading={staffLoading} value={staff.length} />
          </div>
        </ChartPanel>
      </section>

      <footer className="mt-10 text-center text-[13px] text-slate-500">
        © {new Date().getFullYear()} Visal Vehicle System. All rights reserved. |{" "}
        <a href="http://www.vaarde.com" target="_blank" rel="noreferrer" className="hover:text-[#1469e1] transition-colors">
          {settings.org_name}
        </a>
      </footer>

      {approveTarget && (
        <Modal onClose={() => !processingId && setApproveTarget(null)} closeOnBackdrop={!processingId}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Booking action</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">Approve booking request</h2>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]" onClick={() => setApproveTarget(null)} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <p className="m-0 text-sm text-[#53657f]">
                Approving <strong className="text-[#11233f]">{approveTarget.userName}</strong>'s request for {formatDate(approveTarget.bookingDate)} ({approveTarget.startTime}–{approveTarget.endTime}) at {approveTarget.location}.
              </p>
              {actionError && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <AlertCircle size={18} />
                  {actionError}
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setApproveTarget(null)} disabled={Boolean(processingId)}>
                  Cancel
                </button>
                <button type="button" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={confirmApprove} disabled={Boolean(processingId)}>
                  {processingId ? "Processing..." : "Confirm approval"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {declineTarget && (
        <Modal onClose={() => !processingId && setDeclineTarget(null)} closeOnBackdrop={!processingId}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Booking action</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">Decline booking request</h2>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]" onClick={() => setDeclineTarget(null)} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <p className="m-0 text-sm text-[#53657f]">
                Declining <strong className="text-[#11233f]">{declineTarget.userName}</strong>'s request for {formatDate(declineTarget.bookingDate)}.
              </p>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#11233f]">Reason for decline</span>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                  value={declineReason}
                  onChange={(event) => setDeclineReason(event.target.value)}
                  placeholder="Add a clear reason for the requester..."
                />
              </label>
              {actionError && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <AlertCircle size={18} />
                  {actionError}
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setDeclineTarget(null)} disabled={Boolean(processingId)}>
                  Cancel
                </button>
                <button type="button" className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={confirmDecline} disabled={Boolean(processingId) || !declineReason.trim()}>
                  {processingId ? "Processing..." : "Decline booking"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MetricCard({ detail, icon: Icon, label, loading = false, tone, value }) {
  const toneStyles = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30" },
    green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/30" },
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
        {loading ? (
          <Spinner size={26} />
        ) : (
          <h3 className="text-4xl font-bold leading-none text-slate-800">{value}</h3>
        )}
        <p className="mt-2 text-xs text-slate-500">{loading ? "Loading..." : detail}</p>
      </div>
    </article>
  );
}

function ChartPanel({ children, loading = false, subtitle, title }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-[1.4rem] font-bold text-[#11233f]">{title}</h2>
        <p className="mt-1 text-sm text-[#7b8ba5]">{subtitle}</p>
      </div>
      {loading ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm font-medium">Loading analytics...</span>
        </div>
      ) : (
        children
      )}
    </article>
  );
}

function MiniStat({ label, loading = false, value }) {
  return (
    <div className="rounded-[22px] border border-[rgba(17,74,157,0.08)] bg-gradient-to-b from-[#f9fbff] to-[#f2f6fb] p-[18px]">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d7d96]">{label}</span>
      {loading ? (
        <div className="mt-2">
          <Spinner size={18} />
        </div>
      ) : (
        <strong className="mt-2 block truncate text-xl text-[#11233f]" title={typeof value === "string" ? value : undefined}>
          {value}
        </strong>
      )}
    </div>
  );
}

function PanelState({ children, error = false }) {
  return (
    <div className={`flex min-h-[220px] items-center justify-center rounded-[22px] p-5 text-center ${error ? "bg-[#fff4f2] text-[#cc4a43]" : "bg-gradient-to-b from-[#f7f9fc] to-[#eef4fb] text-[#53657f]"}`}>
      {children}
    </div>
  );
}

function durationHours(start, end) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return 0;
  return (endMinutes - startMinutes) / 60;
}

function timeToMinutes(value) {
  if (!value) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

function groupByCount(items, key) {
  const grouped = items.reduce((acc, item) => {
    const name = item[key] || "Unassigned";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function formatDate(dateString) {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nameInitials(value) {
  if (!value) return "U";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function statusLabel(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusBadgeClass(status) {
  if (status === "approved") return "bg-[#eaf8f1] text-[#1c8b60]";
  if (status === "declined") return "bg-[#fff0ef] text-[#cc4a43]";
  return "bg-[#fff6e7] text-[#b67808]";
}

export default Dashboard;
