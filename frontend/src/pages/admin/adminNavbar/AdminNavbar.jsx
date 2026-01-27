import './AdminNavbar.css'
import logo from '../../../assets/visal_logo.webp'
import { NavLink} from 'react-router-dom';

function AdminNavbar() {
  return (
    <div>
          {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="" />
          <div>
            <h2>Visal Vehicle Booking</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="nav">
            <NavLink to="/admin_dashboard" end>Dashboard</NavLink>
            <NavLink to="approvals">Approvals</NavLink>
            <NavLink to="reports">Reports</NavLink>
            <NavLink to="/" className="logout">Log Out</NavLink>
        </nav>
      </aside>
    </div>
  )
}

export default AdminNavbar