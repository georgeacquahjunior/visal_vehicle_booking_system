import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UsersRound,
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
import { API_BASE_URL } from "../../../config.js";

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

  const recentRequests = requests.slice(0, 4);
  const nextRequest = requests.find((request) => request.status === "pending") || requests[0] || null;

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

  return (
    <div className="text-[#11233f]">
      <section className="grid gap-5 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white bg-[radial-gradient(circle_at_top_right,rgba(80,133,214,0.22),transparent_28%),radial-gradient(circle_at_left_center,rgba(17,74,157,0.18),transparent_32%)] p-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.95fr)]">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Administration overview</div>
          <h1 className="my-2.5 max-w-[300px] text-3xl font-bold leading-tight text-[#11233f]">
            Operational control for vehicle bookings
          </h1>
          <p className="m-0 max-w-[65ch] text-[15px] leading-7 text-[#53657f]">
            Review incoming requests, monitor staff activity, and keep scheduling decisions moving with clear visual signals.
          </p>
        </div>

        <div className="flex min-h-[180px] flex-col justify-between gap-3 rounded-3xl bg-gradient-to-br from-[#113f82] to-[#1d62bf] p-[22px] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Next item in queue</span>
            <Clock3 size={18} />
          </div>
          {nextRequest ? (
            <>
              <strong className="text-2xl font-bold">{nextRequest.userName}</strong>
              <p className="m-0 text-white/85">{formatDate(nextRequest.bookingDate)}</p>
              <span className="text-white/85">{nextRequest.startTime} - {nextRequest.endTime}</span>
            </>
          ) : (
            <>
              <strong className="text-2xl font-bold">All clear</strong>
              <p className="m-0 text-white/85">No requests waiting for review right now.</p>
              <span className="text-white/85">Queue is up to date</span>
            </>
          )}
        </div>
      </section>

      <section className="mt-[22px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Active staff" value={stats.activeStaff} detail={`${stats.admins} admin account${stats.admins === 1 ? "" : "s"} with elevated access`} tone="blue" />
        <MetricCard icon={AlertCircle} label="Pending requests" value={stats.pending} detail="Awaiting admin decision" tone="amber" />
        <MetricCard icon={CheckCircle2} label="Approved requests" value={stats.approved} detail={`${stats.declined} declined request${stats.declined === 1 ? "" : "s"} in the full queue`} tone="green" />
        <MetricCard icon={ShieldCheck} label="System posture" value={staffError || error ? "Check" : "Stable"} detail={staffError || error ? "One or more feeds need attention" : "Core dashboard feeds are responding"} tone="indigo" />
      </section>

      <section className="mt-[22px] grid gap-[22px] xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <article className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6">
          <div className="mb-[18px] flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Review queue</p>
              <h2 className="mt-1.5 text-[1.4rem] font-bold text-[#11233f]">Recent booking requests</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-2.5 text-[13px] font-bold text-[#114a9d]">
              <CalendarClock size={16} />
              <span>{stats.pending} awaiting action</span>
            </div>
          </div>

          {loading ? (
            <PanelState>Loading booking requests...</PanelState>
          ) : error ? (
            <PanelState error>{error}</PanelState>
          ) : recentRequests.length === 0 ? (
            <PanelState>No booking requests available.</PanelState>
          ) : (
            <div className="grid gap-4">
              {recentRequests.map((request) => (
                <article key={request.id} className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-gradient-to-b from-white to-[#fbfcfe] p-[18px]">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d62bf] to-[#113f82] font-bold text-white">
                        {nameInitials(request.userName)}
                      </div>
                      <div>
                        <h3 className="m-0 text-base font-bold text-[#11233f]">{request.userName}</h3>
                        <p className="mt-1 text-[13px] text-[#7b8ba5]">{formatDate(request.bookingDate)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(request.status)}`}>
                      {statusLabel(request.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53657f]">
                    <span>{request.startTime} - {request.endTime}</span>
                    <span>{request.location}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Decision mix</p>
            <h2 className="mt-1.5 text-[1.4rem] font-bold text-[#11233f]">Approval status</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={98} paddingAngle={4}>
                {statusChartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="mt-[22px] grid gap-[22px] xl:grid-cols-2">
        <ChartPanel title="Bookings by department" subtitle="Shows where vehicle demand is coming from.">
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

        <ChartPanel title="Queue workload" subtitle="Compares request count and booked hours for planning.">
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniStat label="Total booking hours" value={stats.totalHours.toFixed(1)} />
            <MiniStat label="Average duration" value={requests.length ? `${(stats.totalHours / requests.length).toFixed(1)}h` : "0h"} />
            <MiniStat label="Pending share" value={requests.length ? `${Math.round((stats.pending / requests.length) * 100)}%` : "0%"} />
            <MiniStat label="Staff coverage" value={staff.length} />
          </div>
        </ChartPanel>
      </section>
    </div>
  );
}

function MetricCard({ detail, icon: Icon, label, tone, value }) {
  const tones = {
    amber: "bg-[rgba(200,136,16,0.12)] text-[#c88810]",
    blue: "bg-[rgba(22,119,255,0.12)] text-[#1768db]",
    green: "bg-[rgba(31,143,99,0.12)] text-[#1f8f63]",
    indigo: "bg-[rgba(91,99,216,0.12)] text-[#4c56d7]",
  };

  return (
    <article className="relative flex gap-4 overflow-hidden rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-[22px]">
      <div className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">{label}</p>
        <h3 className="my-1.5 truncate text-3xl font-bold leading-none text-[#11233f]">{value}</h3>
        <span className="text-[13px] leading-5 text-[#53657f]">{detail}</span>
      </div>
    </article>
  );
}

function ChartPanel({ children, subtitle, title }) {
  return (
    <article className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6">
      <div className="mb-5">
        <h2 className="text-[1.4rem] font-bold text-[#11233f]">{title}</h2>
        <p className="mt-1 text-sm text-[#7b8ba5]">{subtitle}</p>
      </div>
      {children}
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-[rgba(17,74,157,0.08)] bg-gradient-to-b from-[#f9fbff] to-[#f2f6fb] p-[18px]">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d7d96]">{label}</span>
      <strong className="mt-2 block text-2xl text-[#11233f]">{value}</strong>
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
