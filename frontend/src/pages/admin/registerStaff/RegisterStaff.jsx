import "./RegisterStaff.css";

export default function RegisterStaff() {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="material-symbols-outlined icon">local_taxi</span>
          <div>
            <h1>FleetAdmin</h1>
            <p>Vehicle Booking App</p>
          </div>
        </div>

        <nav className="nav">
          <a className="nav-item">Dashboard</a>
          <a className="nav-item active">Staff Management</a>
          <a className="nav-item">Vehicles</a>
          <a className="nav-item">Reports</a>
          <a className="nav-item">Settings</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="page-header">
          <h2>Register New Staff</h2>
          <p>Create a new staff or admin account.</p>
        </header>

        <div className="card">
          <form className="form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Sarah Connor" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="sarah@fleet.com" />
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input type="text" placeholder="Operations Manager" />
            </div>

            <div className="actions">
              <button type="button" className="btn-secondary">
                Cancel
              </button>
              <button type="button" className="btn-primary">
                Register Staff
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
