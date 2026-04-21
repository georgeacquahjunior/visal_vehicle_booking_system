import "./AdminNavbar.css";
import logo from "../../../assets/visal_logo.webp";
import React from "react";
import { NavLink } from "react-router-dom";
import { ClipboardCheck, FileText, LayoutDashboard, UserPlus } from "lucide-react";

function AdminNavbar({ collapsed, userName, userRole }) {
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

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Visal logo" />
        {!collapsed && (
          <div className="brand-text">
            <h2>Visal - Re </h2>
            <p>Admin Portal</p>
          </div>
        )}
      </div>

      <nav className="nav-login">
        <NavLink to="/admin-dashboard" end className={({ isActive }) => (isActive ? "active" : "")}>
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="approvals" className={({ isActive }) => (isActive ? "active" : "")}>
          <ClipboardCheck size={18} />
          <span>Approvals</span>
        </NavLink>
        <NavLink to="register-staff" className={({ isActive }) => (isActive ? "active" : "")}>
          <UserPlus size={18} />
          <span>Register Staff</span>
        </NavLink>
        <NavLink to="reports" className={({ isActive }) => (isActive ? "active" : "")}>
          <FileText size={18} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-user">
          <div className="avatar" style={{ backgroundColor: colorForName(userName) }}>
            {letterFor(userName) || "A"}
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{userName || "Admin User"}</div>
              <div className="user-role">{userRole || "Administrator"}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AdminNavbar;
