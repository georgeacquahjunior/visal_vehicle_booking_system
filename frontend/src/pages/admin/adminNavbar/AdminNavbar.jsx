import './AdminNavbar.css'
import logo from '../../../assets/visal_logo.webp'
import { NavLink, useNavigate } from 'react-router-dom';

function AdminNavbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove JWT & any user info from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('staff_id');
    // Redirect to login page
    navigate('/');
  };

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
            <NavLink to="register_staff">Register Staff</NavLink>
            {/* <NavLink to="reports">Reports</NavLink> */}
            <button 
            className="logout" 
            onClick={handleLogout}
          >
            <i className="fas fa-door-open"></i> Log Out
          </button>
        </nav>
      </aside>
    </div>
  )
}

export default AdminNavbar