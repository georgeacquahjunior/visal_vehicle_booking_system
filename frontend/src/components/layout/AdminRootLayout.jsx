import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, RefreshCcw } from "lucide-react";
import AdminNavbar from "../../pages/admin/adminNavbar/AdminNavbar";
import OnlineUsers from "../onlineUsers/OnlineUsers";
import Breadcrumb from "../breadcrumb/Breadcrumb";

const PAGE_LABELS = {
  "": "Overview",
  approvals: "Approvals",
  schedule: "View Schedule",
  "register-staff": "Register Staff",
  "staff-members": "Staff Members",
  reports: "Reports",
};

function AdminRootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("full_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");

  const currentSegment = location.pathname.replace(/^\/admin-dashboard\/?/, "").replace(/\/$/, "");
  const pageLabel = PAGE_LABELS[currentSegment] || "Overview";

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

  const iconBtnClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-white text-[#0f4aa1] transition-all duration-200 hover:-translate-y-px hover:bg-slate-50";

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <AdminNavbar collapsed={collapsed} userName={userName} userRole={userRole} />

      <div
        className={`flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out max-[900px]:!ml-0 ${
          collapsed ? "ml-[90px]" : "ml-[250px]"
        }`}
      >
        <header
          className={`fixed top-0 right-0 z-10 flex min-h-[76px] items-center justify-between border-b border-[rgba(15,23,42,0.08)] bg-white px-7 py-2.5 transition-[left] duration-300 ease-in-out max-[900px]:!sticky max-[900px]:!left-auto max-[900px]:!right-auto ${
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

            <div className="flex flex-col gap-1">
              <Breadcrumb items={[{ label: "Admin", to: "/admin-dashboard" }, { label: pageLabel }]} />
              <div className="m-0 text-[25px] font-semibold text-[#142d57]">{pageLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OnlineUsers />
            <button className={iconBtnClass} type="button" onClick={handleRefresh} aria-label="Refresh admin dashboard">
              <RefreshCcw size={18} />
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-[14px] border border-[#dcdddd] bg-white px-3 py-2.5 text-[13px] font-medium text-red-600 transition-colors duration-200 hover:border-red-600"
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
