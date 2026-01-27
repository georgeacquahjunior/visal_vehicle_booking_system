import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="admin-dashboard">
      {/* Page Title */}
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Staff</h3>
          <p>24</p>
        </div>

        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>120</p>
        </div>

        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>5</p>
        </div>

        <div className="stat-card">
          <h3>Approved Today</h3>
          <p>8</p>
        </div>
      </div>

      {/* Vehicle Status */}
      <div className="vehicle-status">
        <h2>Vehicle Status</h2>
        <p><strong>Vehicle:</strong> Company Car</p>
        <p><strong>Status:</strong> In Use</p>
        <p><strong>Current User:</strong> John Doe</p>
        <p><strong>Return Time:</strong> 4:00 PM</p>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h2>Recent Booking Requests</h2>

        <table>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Jane Smith</td>
              <td>2026-01-22</td>
              <td>10:00 - 2:00</td>
              <td className="pending">Pending</td>
              <td>
                <button className="approve-btn">Approve</button>
              </td>
            </tr>

            <tr>
              <td>Mark Brown</td>
              <td>2026-01-22</td>
              <td>3:00 - 6:00</td>
              <td className="approved">Approved</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
