import './Navbar.css';
import logo from '../../assets/visal_logo.webp';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import NotificationBell from '../notifications/NotificationBell';

function Navbar() {
  const navigate = useNavigate(); // react-router hook for redirection
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const API_BASE = 'https://visal-vehicle-booking-system.onrender.com';

  const letterFor = (name) => {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  };

  const colorForName = (name) => {
    // simple deterministic color from name
    if (!name) return '#6c7ae0';
    const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colors = ['#6c7ae0', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#0ea5e9'];
    return colors[code % colors.length];
  };

  useEffect(() => {
    // try localStorage first
    const storedName = localStorage.getItem('full_name');
    const storedRole = localStorage.getItem('role');
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);

    // if missing, fetch by staff_id (public endpoint)
    if ((!storedName || !storedRole) && localStorage.getItem('staff_id')) {
      const staffId = localStorage.getItem('staff_id');
      fetch(`${API_BASE}/bookings/staff/${encodeURIComponent(staffId)}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((data) => {
          if (data && data.staff) {
            if (!storedName && data.staff.full_name) setUserName(data.staff.full_name);
            if (!storedRole && data.staff.role) setUserRole(data.staff.role);
          }
        })
        .catch(() => {});
    }
  }, []);

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
        <div className="brand-login">
          <img src={logo} alt="Logo" />
          <div>
            <h2>Visal Vehicle Booking</h2>
            <p>Staff Portal</p>
          </div>
          {/* notification bell in sidebar header */}
          <NotificationBell />
        </div>

        <nav className="nav-login">
          <NavLink to="/booking" end>
            <i className="far fa-calendar-check"></i> New Booking
          </NavLink>
          <NavLink to="scheduleview">
            <i className="fas fa-calendar-alt"></i> View Schedule
          </NavLink>
          <NavLink to="viewbookings">
            <i className="fas fa-list"></i> My Bookings
          </NavLink>
          <button 
            className="logout" 
            onClick={handleLogout}
          >
            <i className="fas fa-door-open"></i> Log Out
          </button>
        </nav>
        {/* sidebar footer: user info */}
        <div className="sidebar-footer">
          <div className="avatar" style={{ backgroundColor: colorForName(userName) }}>
            {letterFor(userName)}
          </div>
          <div className="user-info">
            <div className="user-name">{userName || 'Guest'}</div>
            <div className="user-role">{userRole || 'Visitor'}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Navbar;