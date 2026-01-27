import React, { useState } from "react";
import "./Reports.css";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import { format, parseISO, subDays, isAfter, isBefore } from "date-fns";
// import { mockBookings } from "./mockData"; // adjust path

function Reports() {
  const [dateRange, setDateRange] = useState("month");

  const endDate = new Date();
  const startDate = subDays(
    endDate,
    dateRange === "week" ? 7 : dateRange === "month" ? 30 : 90
  );

  const rangeBookings = mockBookings.filter((b) => {
    const bookingDate = parseISO(b.date);
    return isAfter(bookingDate, startDate) && isBefore(bookingDate, endDate);
  });

  const totalBookings = rangeBookings.length;
  const approvedBookings = rangeBookings.filter(b => b.status === "approved").length;
  const pendingBookings = rangeBookings.filter(b => b.status === "pending").length;
  const declinedBookings = rangeBookings.filter(b => b.status === "declined").length;
  const cancelledBookings = rangeBookings.filter(b => b.status === "cancelled").length;

  const statusData = [
    { name: "Approved", value: approvedBookings, color: "#16a34a" },
    { name: "Pending", value: pendingBookings, color: "#f59e0b" },
    { name: "Declined", value: declinedBookings, color: "#dc2626" },
    { name: "Cancelled", value: cancelledBookings, color: "#6b7280" },
  ];

  const dailyUsage = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(endDate, 6 - i);
    return {
      day: format(date, "EEE"),
      bookings: rangeBookings.filter(
        b => format(parseISO(b.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length,
    };
  });

  return (
    <div className="reports-page">
      {/* Header */}
      <header className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Fleet usage statistics and booking reports</p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 90 days</option>
        </select>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{totalBookings}</h2>
          <span>Total Bookings</span>
        </div>

        <div className="stat-card">
          <h2>{approvedBookings}</h2>
          <span>Approved</span>
        </div>

        <div className="stat-card">
          <h2>
            {totalBookings
              ? Math.round((approvedBookings / totalBookings) * 100)
              : 0}
            %
          </h2>
          <span>Approval Rate</span>
        </div>

        <div className="stat-card">
          <h2>{new Set(rangeBookings.map(b => b.userId)).size}</h2>
          <span>Active Users</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3>Daily Booking Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
              >
                {statusData.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h3>Recent Bookings</h3>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Purpose</th>
              <th>Location</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rangeBookings.slice(0, 10).map((b) => (
              <tr key={b.id}>
                <td>{format(parseISO(b.date), "MMM d, yyyy")}</td>
                <td>
                  <strong>{b.userName}</strong>
                  <br />
                  <small>{b.userDepartment}</small>
                </td>
                <td>{b.purpose}</td>
                <td>{b.location}</td>
                <td>{b.startTime} – {b.endTime}</td>
                <td className={`status ${b.status}`}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
