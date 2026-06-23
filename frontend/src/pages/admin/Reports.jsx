import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  MapPin,
  PieChart as PieChartIcon,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_BASE_URL } from "../../config.js";

const STATUS_COLORS = {
  approved: "#1f8f63",
  pending: "#c88810",
  declined: "#cc4a43",
};

const CHART_COLORS = ["#1768db", "#1f8f63", "#c88810", "#cc4a43", "#7c3aed", "#0f766e"];

const fallbackBookings = [
  {
    id: 1,
    staffName: "John Doe",
    department: "Operations",
    bookingDate: "2026-06-20",
    startTime: "09:00",
    endTime: "11:30",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "approved",
  },
  {
    id: 2,
    staffName: "Jane Smith",
    department: "Finance",
    bookingDate: "2026-06-21",
    startTime: "13:00",
    endTime: "15:00",
    location: "Client Office",
    purpose: "Site Visit",
    status: "pending",
  },
  {
    id: 3,
    staffName: "Kwame Mensah",
    department: "Admin",
    bookingDate: "2026-06-22",
    startTime: "08:30",
    endTime: "10:00",
    location: "Airport",
    purpose: "Staff airport Drop Off/Pick up",
    status: "declined",
  },
];

function Reports() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/bookings/schedule_view`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);

        const data = await res.json();
        const remote = Array.isArray(data.bookings) ? data.bookings : [];

        setBookings(
          remote.map((booking) => ({
            id: booking.booking_id,
            staffName: booking.staff_name || "Staff",
            staffId: booking.staff_id || "",
            department: booking.department || "Unassigned",
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
            location: booking.location || "Not specified",
            purpose: booking.purpose || "Not specified",
            status: booking.status ? booking.status.toString().trim().toLowerCase() : "pending",
            adminComment: booking.admin_comment || "",
          }))
        );
      } catch (err) {
        setError(err.message || "Failed to load report data");
        setBookings(fallbackBookings);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStart = !startDate || booking.bookingDate >= startDate;
      const matchesEnd = !endDate || booking.bookingDate <= endDate;
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || booking.department === departmentFilter;
      return matchesStart && matchesEnd && matchesStatus && matchesDepartment;
    });
  }, [bookings, departmentFilter, endDate, startDate, statusFilter]);

  const departments = useMemo(() => {
    return ["all", ...Array.from(new Set(bookings.map((booking) => booking.department))).sort()];
  }, [bookings]);

  const analytics = useMemo(() => {
    const total = filteredBookings.length;
    const approved = filteredBookings.filter((booking) => booking.status === "approved").length;
    const pending = filteredBookings.filter((booking) => booking.status === "pending").length;
    const declined = filteredBookings.filter((booking) => booking.status === "declined").length;
    const totalHours = filteredBookings.reduce((sum, booking) => sum + durationHours(booking.startTime, booking.endTime), 0);
    const averageDuration = total ? totalHours / total : 0;
    const approvalRate = total ? (approved / total) * 100 : 0;
    const declineRate = total ? (declined / total) * 100 : 0;
    const uniqueStaff = new Set(filteredBookings.map((booking) => booking.staffName)).size;
    const topPurpose = topEntry(filteredBookings, "purpose");
    const topLocation = topEntry(filteredBookings, "location");
    const busiestDay = topEntry(filteredBookings, "bookingDate");
    const backlogHours = filteredBookings
      .filter((booking) => booking.status === "pending")
      .reduce((sum, booking) => sum + durationHours(booking.startTime, booking.endTime), 0);

    return {
      approvalRate,
      approved,
      averageDuration,
      backlogHours,
      busiestDay,
      declined,
      declineRate,
      pending,
      topLocation,
      topPurpose,
      total,
      totalHours,
      uniqueStaff,
    };
  }, [filteredBookings]);

  const statusData = useMemo(() => {
    return ["approved", "pending", "declined"].map((status) => ({
      name: statusLabel(status),
      value: filteredBookings.filter((booking) => booking.status === status).length,
      status,
    }));
  }, [filteredBookings]);

  const dailyUsage = useMemo(() => {
    const grouped = filteredBookings.reduce((acc, booking) => {
      acc[booking.bookingDate] = (acc[booking.bookingDate] || 0) + durationHours(booking.startTime, booking.endTime);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, hours]) => ({ date: formatShortDate(date), hours: Number(hours.toFixed(1)) }));
  }, [filteredBookings]);

  const purposeData = useMemo(() => groupByCount(filteredBookings, "purpose").slice(0, 6), [filteredBookings]);
  const departmentData = useMemo(() => groupByCount(filteredBookings, "department").slice(0, 6), [filteredBookings]);

  const exportToCSV = () => {
    const headers = ["Booking Date", "Staff", "Department", "Start", "End", "Duration", "Location", "Purpose", "Status"];
    const rows = filteredBookings.map((booking) => [
      booking.bookingDate,
      booking.staffName,
      booking.department,
      booking.startTime,
      booking.endTime,
      durationHours(booking.startTime, booking.endTime).toFixed(2),
      booking.location,
      booking.purpose,
      statusLabel(booking.status),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vehicle-booking-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  return (
    <div className="text-[#11233f]">
      <section className="grid gap-5 rounded-[28px] border border-slate-200 bg-white bg-[radial-gradient(circle_at_top_right,rgba(80,133,214,0.2),transparent_30%)] p-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Reports & analytics</div>
          <h1 className="my-2.5 max-w-[14ch] text-3xl font-bold leading-tight text-[#11233f]">Decision dashboard for vehicle usage</h1>
          <p className="max-w-[68ch] text-[15px] leading-7 text-slate-600">
            Track demand, approval flow, booking hours, staff coverage, and operational pressure points from one reporting view.
          </p>
        </div>

        <div className="flex min-h-[180px] flex-col justify-between gap-3 rounded-3xl bg-gradient-to-br from-[#113f82] to-[#1d62bf] p-[22px] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Executive signal</span>
            <TrendingUp size={18} />
          </div>
          <strong className="text-2xl font-bold">{analytics.approvalRate.toFixed(0)}% approval rate</strong>
          <p className="m-0 text-sm leading-6 text-white/85">
            {analytics.pending} pending request{analytics.pending === 1 ? "" : "s"} representing {analytics.backlogHours.toFixed(1)} booked hours.
          </p>
          <span className="text-sm text-white/75">{loading ? "Refreshing report data..." : `${analytics.total} records in current view`}</span>
        </div>
      </section>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={18} />
          <span>Using sample analytics because live reports could not load: {error}</span>
        </div>
      )}

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CalendarClock} label="Total bookings" value={analytics.total} detail={`${analytics.uniqueStaff} staff member${analytics.uniqueStaff === 1 ? "" : "s"} represented`} tone="blue" />
        <KpiCard icon={CheckCircle2} label="Approval rate" value={`${analytics.approvalRate.toFixed(0)}%`} detail={`${analytics.approved} approved, ${analytics.declined} declined`} tone="green" />
        <KpiCard icon={Clock3} label="Pending backlog" value={analytics.pending} detail={`${analytics.backlogHours.toFixed(1)} hours awaiting decision`} tone="amber" />
        <KpiCard icon={BarChart3} label="Booked hours" value={analytics.totalHours.toFixed(1)} detail={`${analytics.averageDuration.toFixed(1)} hrs average duration`} tone="indigo" />
        <KpiCard icon={PieChartIcon} label="Decline rate" value={`${analytics.declineRate.toFixed(0)}%`} detail="Watch this for access or availability constraints" tone="red" />
        <KpiCard icon={UsersRound} label="Top purpose" value={analytics.topPurpose.name || "N/A"} detail={`${analytics.topPurpose.count || 0} request${analytics.topPurpose.count === 1 ? "" : "s"}`} tone="blue" compact />
        <KpiCard icon={MapPin} label="Top location" value={analytics.topLocation.name || "N/A"} detail={`${analytics.topLocation.count || 0} booking${analytics.topLocation.count === 1 ? "" : "s"}`} tone="green" compact />
        <KpiCard icon={CalendarClock} label="Busiest day" value={analytics.busiestDay.name ? formatShortDate(analytics.busiestDay.name) : "N/A"} detail={`${analytics.busiestDay.count || 0} booking${analytics.busiestDay.count === 1 ? "" : "s"}`} tone="amber" />
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Filter controls</p>
            <h2 className="mt-1.5 text-xl font-bold">Focus the report</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Reset
            </button>
            <button type="button" onClick={exportToCSV} className="inline-flex items-center gap-2 rounded-xl bg-[#1469e1] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#115cc7]">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Start date">
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1469e1]" />
          </FilterField>
          <FilterField label="End date">
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1469e1]" />
          </FilterField>
          <FilterField label="Status">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize outline-none focus:border-[#1469e1]">
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </FilterField>
          <FilterField label="Department">
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1469e1]">
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "all" ? "All departments" : department}
                </option>
              ))}
            </select>
          </FilterField>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)]">
        <ChartPanel title="Booked hours by day" subtitle="Demand trend across the selected period">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#1768db" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Decision mix" subtitle="Approval, pending, and decline distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Top booking purposes" subtitle="Use this to identify recurring vehicle demand">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purposeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={135} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#1768db" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Bookings by department" subtitle="Compare demand across teams">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {departmentData.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="mb-[18px] flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Records</p>
            <h2 className="mt-1.5 text-xl font-bold">Booking detail</h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            <Filter size={15} />
            {filteredBookings.length} shown
          </span>
        </div>

        <div className="overflow-x-auto rounded-[22px] border border-slate-200">
          <table className="w-full min-w-[980px] border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                {["Date", "Staff", "Department", "Time", "Hours", "Purpose", "Location", "Status"].map((heading) => (
                  <th key={heading} className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{formatShortDate(booking.bookingDate)}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm font-semibold text-[#11233f]">{booking.staffName}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.department}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.startTime} - {booking.endTime}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{durationHours(booking.startTime, booking.endTime).toFixed(1)}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.purpose}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.location}</td>
                  <td className="border-b border-slate-100 px-4 py-[18px] text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusBadgeClass(booking.status)}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ compact = false, detail, icon: Icon, label, tone, value }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    red: "bg-rose-50 text-rose-700",
  };

  return (
    <article className="flex min-h-[132px] gap-4 rounded-[22px] border border-slate-200 bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <h3 className={`${compact ? "text-xl" : "text-3xl"} my-1.5 truncate font-bold leading-tight text-[#11233f]`}>{value}</h3>
        <span className="text-[13px] leading-5 text-slate-600">{detail}</span>
      </div>
    </article>
  );
}

function ChartPanel({ children, subtitle, title }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#11233f]">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </article>
  );
}

function FilterField({ children, label }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-[#11233f]">{label}</span>
      {children}
    </label>
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
    const label = item[key] || "Not specified";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function topEntry(items, key) {
  return groupByCount(items, key)[0] || { name: "", count: 0 };
}

function formatShortDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

export default Reports;
