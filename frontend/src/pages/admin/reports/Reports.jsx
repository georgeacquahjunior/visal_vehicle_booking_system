import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import "./Reports.css";

// Sample mock data
const mockBookings = [
  {
    id: 1,
    bookingDate: "2026-01-20",
    staffName: "John Doe",
    startTime: "09:00",
    endTime: "11:00",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "Approved",
    adminComments: "On time",
  },
  {
    id: 2,
    bookingDate: "2026-01-21",
    staffName: "Jane Smith",
    startTime: "10:00",
    endTime: "12:00",
    location: "Site Visit",
    purpose: "Site Inspection",
    status: "Pending",
    adminComments: "",
  },
  {
    id: 3,
    bookingDate: "2026-01-22",
    staffName: "Bob Johnson",
    startTime: "13:00",
    endTime: "15:00",
    location: "Client Office",
    purpose: "Official Duty",
    status: "Declined",
    adminComments: "Vehicle unavailable",
  },
  {
    id: 4,
    bookingDate: "2026-01-22",
    staffName: "John Doe",
    startTime: "09:30",
    endTime: "10:30",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "Approved",
    adminComments: "",
  },
  {
    id: 5,
    bookingDate: "2026-01-23",
    staffName: "Jane Smith",
    startTime: "11:00",
    endTime: "12:00",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "Pending",
    adminComments: "",
  },
  {
    id: 6,
    bookingDate: "2026-01-24",
    staffName: "Bob Johnson",
    startTime: "09:00",
    endTime: "11:30",
    location: "Head Office",
    purpose: "Site Inspection",
    status: "Approved",
    adminComments: "Completed",
  },
  {
    id: 7,
    bookingDate: "2026-01-25",
    staffName: "John Doe",
    startTime: "14:00",
    endTime: "16:00",
    location: "Client Office",
    purpose: "Official Duty",
    status: "Approved",
    adminComments: "",
  },
  {
    id: 8,
    bookingDate: "2026-01-26",
    staffName: "Jane Smith",
    startTime: "09:30",
    endTime: "12:00",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "Declined",
    adminComments: "Scheduling conflict",
  },
  {
    id: 9,
    bookingDate: "2026-01-27",
    staffName: "Bob Johnson",
    startTime: "10:00",
    endTime: "11:00",
    location: "Site Visit",
    purpose: "Site Inspection",
    status: "Pending",
    adminComments: "",
  },
  {
    id: 10,
    bookingDate: "2026-01-28",
    staffName: "John Doe",
    startTime: "08:30",
    endTime: "10:00",
    location: "Head Office",
    purpose: "Client Meeting",
    status: "Approved",
    adminComments: "",
  },
];

const statusColors = {
  Approved: "#4caf50",
  Declined: "#f44336",
  Pending: "#ff9800",
};

// CSV Export function
const exportToCSV = () => {
  if (filteredBookings.length === 0) return alert("No data to export!");

  const headers = [
    "Booking Date",
    "Staff Name",
    "Start Time",
    "End Time",
    "Duration (hrs)",
    "Location",
    "Purpose",
    "Status",
    "Admin Comments",
  ];

  const rows = filteredBookings.map(b => [
    b.bookingDate,
    b.staffName,
    b.startTime,
    b.endTime,
    calculateDuration(b.startTime, b.endTime),
    b.location,
    b.purpose,
    b.status,
    b.adminComments,
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const now = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `bookings_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


function Reports() {
  const [bookings, setBookings] = useState(mockBookings);
  const [filteredBookings, setFilteredBookings] = useState(mockBookings);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffFilter, setStaffFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Calculate duration in hours
  const calculateDuration = (start, end) => {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    return (eH + eM / 60 - (sH + sM / 60)).toFixed(2);
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...bookings];

    if (startDate) filtered = filtered.filter(b => b.bookingDate >= startDate);
    if (endDate) filtered = filtered.filter(b => b.bookingDate <= endDate);
    if (staffFilter !== "All") filtered = filtered.filter(b => b.staffName === staffFilter);
    if (statusFilter !== "All") filtered = filtered.filter(b => b.status === statusFilter);

    setFilteredBookings(filtered);
  };

  // Summary cards calculations
  const totalBookings = filteredBookings.length;
  const approved = filteredBookings.filter(b => b.status === "Approved").length;
  const declined = filteredBookings.filter(b => b.status === "Declined").length;
  const pending = filteredBookings.filter(b => b.status === "Pending").length;
  const averageDuration =
    filteredBookings.reduce((sum, b) => sum + parseFloat(calculateDuration(b.startTime, b.endTime)), 0) /
    (filteredBookings.length || 1);
  const mostFrequentPurpose =
    filteredBookings
      .reduce((acc, b) => {
        acc[b.purpose] = (acc[b.purpose] || 0) + 1;
        return acc;
      }, {});
  const mostPurpose = Object.entries(mostFrequentPurpose).reduce((a, b) => (b[1] > (a[1] || 0) ? b : a), [null, 0])[0];

  // Chart data
  const bookingsByStaff = Object.entries(
    filteredBookings.reduce((acc, b) => {
      acc[b.staffName] = (acc[b.staffName] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const bookingsByPurpose = Object.entries(
    filteredBookings.reduce((acc, b) => {
      acc[b.purpose] = (acc[b.purpose] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const bookingsByStatus = Object.entries(
    filteredBookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const dailyUsage = Object.entries(
    filteredBookings.reduce((acc, b) => {
      acc[b.bookingDate] = (acc[b.bookingDate] || 0) + parseFloat(calculateDuration(b.startTime, b.endTime));
      return acc;
    }, {})
  ).map(([date, hours]) => ({ date, hours }));

  // Get unique staff for filter dropdown
  const uniqueStaff = ["All", ...new Set(bookings.map(b => b.staffName))];

  return (
    <div className="reports-page">
      <h1>Vehicle Booking Reports</h1>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h3>Total Bookings</h3>
          <p>{totalBookings}</p>
        </div>
        <div className="card approved">
          <h3>Approved</h3>
          <p>{approved}</p>
        </div>
        <div className="card declined">
          <h3>Declined</h3>
          <p>{declined}</p>
        </div>
        <div className="card pending">
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>
        <div className="card">
          <h3>Average Duration</h3>
          <p>{averageDuration.toFixed(2)} hrs</p>
        </div>
        <div className="card">
          <h3>Most Frequent Purpose</h3>
          <p>{mostPurpose || "N/A"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div>
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Staff</label>
          <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
            {uniqueStaff.map(staff => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
        <div>
          <button onClick={exportToCSV} style={{ backgroundColor: "#4caf50" }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Booking Date</th>
              <th>Staff Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration (hrs)</th>
              <th>Location</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Admin Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td>{b.bookingDate}</td>
                <td>{b.staffName}</td>
                <td>{b.startTime}</td>
                <td>{b.endTime}</td>
                <td>{calculateDuration(b.startTime, b.endTime)}</td>
                <td>{b.location}</td>
                <td>{b.purpose}</td>
                <td style={{ color: statusColors[b.status] }}>{b.status}</td>
                <td>{b.adminComments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart">
          <h3>Bookings by Staff</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByStaff}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Bookings by Purpose</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookingsByPurpose}
                dataKey="count"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {bookingsByPurpose.map((entry, index) => (
                  <Cell key={index} fill={["#1976d2", "#ff9800", "#4caf50", "#f44336"][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Booking Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" stackId="a">
                {bookingsByStatus.map((entry, index) => (
                  <Cell key={index} fill={statusColors[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Daily Usage (hrs booked)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyUsage}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#1976d2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Reports;
