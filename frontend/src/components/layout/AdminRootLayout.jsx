import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, RefreshCcw } from "lucide-react";
import AdminNavbar from "../../pages/admin/adminNavbar/AdminNavbar";

function AdminRootLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("full_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");

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
      <AdminNavbar collapsed={collapsed} userName={userName} userRole={userRole} />

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
              <div className="topbar-title-header">Admin Dashboard</div>
              <span>Manage approvals, staff accounts and reports in one place</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" type="button" onClick={handleRefresh} aria-label="Refresh admin dashboard">
              <RefreshCcw size={18} />
            </button>
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

export default AdminRootLayout;
