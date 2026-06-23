import "./Navbar.css";
import logo from "../../assets/visal_logo.webp";
import { NavLink } from "react-router-dom";
import React from "react";
import { CalendarCheck, CalendarDays, ListChecks } from "lucide-react";

function Navbar({ collapsed, userName, userRole }) {
  const letterFor = (name) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  const colorForName = (name) => {
    if (!name) return "#6c7ae0";
    const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colors = ["#6c7ae0", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#0ea5e9"];
    return colors[code % colors.length];
  };

  const displayName = userName || "Guest User";
  const displayRole = userRole || "Visitor";

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Visal logo" />
        {!collapsed && (
          <div className="brand-text">
            <h2>Visal - Re </h2>
            <p>Vehicle Booking</p>
          </div>
        )}
      </div>

      <nav className="nav-login">
        <NavLink to="/booking" end className={({ isActive }) => (isActive ? "active" : "") }>
          <CalendarCheck size={18} />
          <span>New Booking</span>
        </NavLink>
        <NavLink to="/booking/scheduleview" className={({ isActive }) => (isActive ? "active" : "") }>
          <CalendarDays size={18} />
          <span>View Schedule</span>
        </NavLink>
        <NavLink to="/booking/viewbookings" className={({ isActive }) => (isActive ? "active" : "") }>
          <ListChecks size={18} />
          <span>My Bookings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-user profile-card">
          <div className="avatar-ring">
            <div className="avatar" style={{ backgroundColor: colorForName(displayName) }}>
              {letterFor(displayName) || "G"}
            </div>
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-role">
                <span className="role-dot" />
                {displayRole}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Navbar;
