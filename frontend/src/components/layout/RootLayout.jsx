import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import NotificationBell from "../notifications/NotificationBell";
import { Menu, LogOut, RefreshCcw } from "lucide-react";

function RootLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("full_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");

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

  useEffect(() => {
    const storedName = localStorage.getItem("full_name");
    const storedRole = localStorage.getItem("role");
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("staff_id");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Navbar collapsed={collapsed} userName={userName} userRole={userRole} />

      <div className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={18} />
            </button>

            <div className="topbar-title">
              <div className="topbar-title-header" >Staff Dashboard</div>
              <span>Fleet booking, schedule and approvals in one place</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" type="button" onClick={handleRefresh} aria-label="Refresh dashboard">
              <RefreshCcw size={18} />
            </button>
            <NotificationBell />
            <button className="logout-btn" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
