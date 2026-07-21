import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  Clock3,
  Download,
  Filter,
  MapPin,
  PieChart as PieChartIcon,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
import InfoButton from "../../components/InfoButton";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import useGreeting from "../../hooks/useGreeting.js";

const STATUS_COLORS = {
  approved: "#1f8f63",
  pending: "#c88810",
  declined: "#cc4a43",
};

const CHART_COLORS = ["#1768db", "#1f8f63", "#c88810", "#cc4a43", "#7c3aed", "#0d9488"];
const TABLE_PAGE_SIZE = 10;

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
  const [tablePage, setTablePage] = useState(1);

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

  useEffect(() => {
    setTablePage(1);
  }, [startDate, endDate, statusFilter, departmentFilter]);

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
    const topLocation = topEntry(filteredBookings, "location");
    const avgPerStaff = uniqueStaff ? total / uniqueStaff : 0;
    const peakHour = topEntry(filteredBookings, (booking) => hourBucketLabel(booking.startTime));
    const backlogHours = filteredBookings
      .filter((booking) => booking.status === "pending")
      .reduce((sum, booking) => sum + durationHours(booking.startTime, booking.endTime), 0);

    return {
      approvalRate,
      approved,
      averageDuration,
      avgPerStaff,
      backlogHours,
      declined,
      declineRate,
      peakHour,
      pending,
      topLocation,
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
  const departmentData = useMemo(
    () =>
      groupByCount(filteredBookings, "department")
        .slice(0, 6)
        .map((entry, index) => ({ ...entry, fill: CHART_COLORS[index % CHART_COLORS.length] })),
    [filteredBookings]
  );

  const hourlyDemand = useMemo(() => {
    const buckets = Array.from({ length: 13 }, (_, i) => {
      const hour = 6 + i;
      return { hour, label: hourBucketLabel(`${String(hour).padStart(2, "0")}:00`), count: 0 };
    });
    const byHour = new Map(buckets.map((bucket) => [bucket.hour, bucket]));

    filteredBookings.forEach((booking) => {
      const minutes = timeToMinutes(booking.startTime);
      if (minutes === null) return;
      const hour = Math.floor(minutes / 60);
      const bucket = byHour.get(hour);
      if (bucket) bucket.count += 1;
    });

    return buckets;
  }, [filteredBookings]);

  const tablePageStart = (tablePage - 1) * TABLE_PAGE_SIZE;
  const visibleBookings = filteredBookings.slice(tablePageStart, tablePageStart + TABLE_PAGE_SIZE);

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

  const { todayLabel } = useGreeting();

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <BarChart3 size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Decision dashboard for vehicle usage</h1>
            <InfoButton text="Track demand, approval flow, booking hours, staff coverage, and operational pressure points from one reporting view." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <TrendingUp size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{analytics.approvalRate.toFixed(0)}% approval rate</strong>
              <span className="text-[#7b8ba5]"> · {analytics.pending} pending · {loading ? "refreshing…" : `${analytics.total} records`}</span>
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-5 flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-[28px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
          <Spinner />
          <span>Loading report data...</span>
        </div>
      ) : (
        <>
      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={18} />
          <span>Using sample analytics because live reports could not load: {error}</span>
        </div>
      )}

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CalendarClock} label="Total bookings" value={analytics.total} detail={`${analytics.uniqueStaff} staff member${analytics.uniqueStaff === 1 ? "" : "s"} represented`} tone="blue" />
        <MetricCard icon={CheckCircle2} label="Approval rate" value={`${analytics.approvalRate.toFixed(0)}%`} detail={`${analytics.approved} approved, ${analytics.declined} declined`} tone="green" />
        <MetricCard icon={Clock3} label="Pending backlog" value={analytics.pending} detail={`${analytics.backlogHours.toFixed(1)} hours awaiting decision`} tone="amber" />
        <MetricCard icon={BarChart3} label="Booked hours" value={analytics.totalHours.toFixed(1)} detail={`${analytics.averageDuration.toFixed(1)}h average duration`} tone="indigo" />
        <MetricCard icon={PieChartIcon} label="Decline rate" value={`${analytics.declineRate.toFixed(0)}%`} detail="Watch for access constraints" tone="red" />
        <MetricCard icon={Clock} label="Peak demand hour" value={analytics.peakHour.name || "N/A"} detail={`${analytics.peakHour.count || 0} booking${analytics.peakHour.count === 1 ? "" : "s"} start then`} tone="indigo" />
        <MetricCard icon={MapPin} label="Top location" value={analytics.topLocation.name || "N/A"} detail={`${analytics.topLocation.count || 0} booking${analytics.topLocation.count === 1 ? "" : "s"}`} tone="green" />
        <MetricCard icon={UsersRound} label="Bookings per staff" value={analytics.avgPerStaff.toFixed(1)} detail="Average requests per staff" tone="blue" />
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
            <button type="button" onClick={exportToCSV} className="inline-flex items-center gap-2 rounded-xl bg-[#1469e1] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#115cc7]" data-ga-button="reports_export_csv">
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
            <AreaChart data={dailyUsage} margin={{ left: -12 }}>
              <defs>
                <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1768db" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#1768db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip valueLabel="hours booked" />} cursor={{ stroke: "#1768db", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="hours" stroke="#1768db" strokeWidth={2} fill="url(#hoursFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} dot={{ r: 3, strokeWidth: 0, fill: "#1768db" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Decision mix" subtitle="Approval, pending, and decline distribution">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3} stroke="#fff" strokeWidth={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip total={analytics.total} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 top-0 flex h-[220px] flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#11233f]">{analytics.total}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {statusData.map((entry) => (
              <span key={entry.status} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] }} />
                {entry.name}
                <span className="text-slate-400">
                  {entry.value} · {analytics.total ? Math.round((entry.value / analytics.total) * 100) : 0}%
                </span>
              </span>
            ))}
          </div>
        </ChartPanel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Top booking purposes" subtitle="Use this to identify recurring vehicle demand">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purposeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={135} tick={{ fontSize: 12, fill: "#374151" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip valueLabel="requests" />} cursor={{ fill: "rgba(23,104,219,0.06)" }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#1768db" maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Bookings by department" subtitle="Compare demand across teams">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} margin={{ left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
              <Tooltip content={<ChartTooltip valueLabel="bookings" />} cursor={{ fill: "rgba(23,104,219,0.06)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {departmentData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="mt-5">
        <ChartPanel title="Demand by time of day" subtitle="When bookings start — use this to plan driver and vehicle coverage windows">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyDemand} margin={{ left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7b8ba5" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 12, fill: "#7b8ba5" }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
              <Tooltip content={<ChartTooltip valueLabel="bookings" />} cursor={{ fill: "rgba(23,104,219,0.06)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#7c3aed" maxBarSize={28} />
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

        <div className="rounded-[22px] border border-slate-200 overflow-hidden">
          <table className="w-full table-fixed border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[10%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Date</th>
                <th className="w-[15%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff</th>
                <th className="hidden w-[12%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500 lg:table-cell">Department</th>
                <th className="w-[13%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Time</th>
                <th className="hidden w-[7%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500 lg:table-cell">Hours</th>
                <th className="w-[20%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Purpose</th>
                <th className="hidden w-[13%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500 md:table-cell">Location</th>
                <th className="w-[10%] border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{formatShortDate(booking.bookingDate)}</td>
                  <td className="truncate border-b border-slate-100 px-4 py-[18px] text-sm font-semibold text-[#11233f]">{booking.staffName}</td>
                  <td className="hidden truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600 lg:table-cell">{booking.department}</td>
                  <td className="truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.startTime} - {booking.endTime}</td>
                  <td className="hidden truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600 lg:table-cell">{durationHours(booking.startTime, booking.endTime).toFixed(1)}</td>
                  <td className="truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{booking.purpose}</td>
                  <td className="hidden truncate border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600 md:table-cell">{booking.location}</td>
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

        <Pagination currentPage={tablePage} onPageChange={setTablePage} pageSize={TABLE_PAGE_SIZE} totalItems={filteredBookings.length} />
      </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ detail, icon: Icon, label, tone, value }) {
  const toneStyles = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30" },
    green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/30" },
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
        <h3 className="text-2xl font-bold leading-none text-slate-800">{value}</h3>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
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

function ChartTooltip({ active, label, payload, valueLabel }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-400">{label ?? entry.payload?.name}</p>
      <p className="m-0 mt-1 flex items-center gap-1.5 text-sm font-bold text-[#11233f]">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.payload?.fill || entry.color || entry.fill }} />
        {entry.value} {valueLabel}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const percent = total ? Math.round((entry.value / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.payload.status] }} />
        {entry.name}
      </p>
      <p className="m-0 mt-1 text-sm font-bold text-[#11233f]">
        {entry.value} booking{entry.value === 1 ? "" : "s"} <span className="font-medium text-slate-400">· {percent}%</span>
      </p>
    </div>
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
  const selector = typeof key === "function" ? key : (item) => item[key];
  const grouped = items.reduce((acc, item) => {
    const label = selector(item) || "Not specified";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function hourBucketLabel(startTime) {
  const minutes = timeToMinutes(startTime);
  if (minutes === null) return null;
  const hour = Math.floor(minutes / 60);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
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
