import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, RefreshCcw, Settings as SettingsIcon } from "lucide-react";
import AdminNavbar from "../../pages/admin/AdminNavbar";
import OnlineUsers from "../OnlineUsers";
import NotificationBell from "../NotificationBell";
import Breadcrumb from "../Breadcrumb";
import { clearSession, logoutRequest, startSessionWatcher } from "../../utils/session.js";
import { useSettings } from "../../hooks/useSettings.js";

const PAGE_LABELS = {
  "": "Overview",
  approvals: "Approvals",
  schedule: "View Schedule",
  "register-staff": "Register Staff",
  "staff-members": "Staff Members",
  reports: "Reports",
  "audit-log": "Audit Log",
  support: "Support",
  broadcast: "Broadcast Email",
  settings: "Settings",
  notifications: "Notifications",
};

function AdminRootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("full_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");
  const { refetch: refetchSettings } = useSettings();

  const currentSegment = location.pathname.replace(/^\/admin-dashboard\/?/, "").replace(/\/$/, "");
  const pageLabel = PAGE_LABELS[currentSegment] || "Overview";

  useEffect(() => {
    const storedName = localStorage.getItem("full_name");
    const storedRole = localStorage.getItem("role");
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
    refetchSettings();
  }, []);

  useEffect(() => {
    const stopWatching = startSessionWatcher(async () => {
      await logoutRequest();
      clearSession();
      navigate("/", { state: { sessionExpired: true } });
    });
    return stopWatching;
  }, [navigate]);

  const handleLogout = async () => {
    await logoutRequest();
    clearSession();
    navigate("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const iconBtnClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-[#0f4aa1] transition-all duration-200 hover:-translate-y-px hover:bg-slate-50";

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <AdminNavbar collapsed={collapsed} userName={userName} userRole={userRole} />

      <div
        className={`flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out max-[900px]:!ml-0 ${
          collapsed ? "ml-[90px]" : "ml-[250px]"
        }`}
      >
        <header
          className={`fixed top-0 right-0 z-20 flex min-h-[76px] items-center justify-between bg-transparent px-7 py-2.5 transition-[left] duration-300 ease-in-out max-[900px]:!sticky max-[900px]:!left-auto max-[900px]:!right-auto ${
            collapsed ? "left-[90px]" : "left-[250px]"
          }`}
        >
          <div className="flex items-center gap-[18px]">
            <button
              type="button"
              className={iconBtnClass}
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={18} />
            </button>

            <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Breadcrumb items={[{ label: "Admin", to: "/admin-dashboard" }, { label: pageLabel }]} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OnlineUsers />
            <button className={iconBtnClass} type="button" onClick={handleRefresh} aria-label="Refresh admin dashboard">
              <RefreshCcw size={18} />
            </button>
            <NotificationBell />
            <button
              className={iconBtnClass}
              type="button"
              onClick={() => navigate("/admin-dashboard/settings")}
              aria-label="Open settings"
            >
              <SettingsIcon size={18} />
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-[14px] border border-[#dcdddd] bg-white px-3 py-2.5 text-[13px] font-medium text-red-600 shadow-sm transition-colors duration-200 hover:border-red-600"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </header>

        <div className="relative z-[1] min-h-[calc(100vh-76px)] flex-1 bg-[#fcfbfb] px-7 pb-7 pt-[104px] max-[900px]:!p-7">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminRootLayout;
