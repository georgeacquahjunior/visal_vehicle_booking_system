import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../BottomNav";
import SidebarNav from "../SidebarNav";
import NotificationBell from "../NotificationBell";
import OnlineUsers from "../OnlineUsers";
import Breadcrumb from "../Breadcrumb";
import { LogOut, RefreshCcw, Settings as SettingsIcon } from "lucide-react";
import { clearSession, logoutRequest, startSessionWatcher } from "../../utils/session.js";
import { useSettings } from "../../hooks/useSettings.js";
import useNavLayout from "../../hooks/useNavLayout.js";

const PAGE_LABELS = {
  "": "New Booking",
  scheduleview: "View Schedule",
  viewbookings: "My Bookings",
  help: "Help & Support",
  account: "My Account",
  notifications: "Notifications",
};

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState(() => localStorage.getItem("full_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");
  const { refetch: refetchSettings } = useSettings();
  const [navLayout, setNavLayout] = useNavLayout();
  const isSidebar = navLayout === "sidebar";

  const currentSegment = location.pathname.replace(/^\/booking\/?/, "").replace(/\/$/, "");
  const pageLabel = PAGE_LABELS[currentSegment] || "New Booking";

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

  const displayName = userName || "Guest User";
  const displayRole = userRole || "Visitor";

  return (
    <div className="min-h-screen bg-white">
      {isSidebar ? (
        <SidebarNav displayName={displayName} displayRole={displayRole} navLayout={navLayout} setNavLayout={setNavLayout} />
      ) : (
        <BottomNav displayName={displayName} displayRole={displayRole} navLayout={navLayout} setNavLayout={setNavLayout} />
      )}

      <header
        className={`fixed inset-x-0 top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 bg-transparent py-2.5 pr-7 max-[640px]:pr-4 ${
          isSidebar ? "left-[250px] pl-7 max-[900px]:!left-0" : "pl-80 max-[640px]:pl-40"
        }`}
      >
        <div className="min-w-0 rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Breadcrumb items={[{ label: "Dashboard", to: "/booking" }, { label: pageLabel }]} />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <OnlineUsers />
          <button className={iconBtnClass} type="button" onClick={handleRefresh} aria-label="Refresh dashboard">
            <RefreshCcw size={18} />
          </button>
          <NotificationBell />
          <button
            className={iconBtnClass}
            type="button"
            onClick={() => navigate("/booking/account")}
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

      <div
        className={`relative z-[1] min-h-[calc(100vh-76px)] px-7 pt-[104px] max-[480px]:px-4 ${
          isSidebar ? "ml-[250px] pb-7 max-[900px]:!ml-0" : "pb-28"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
