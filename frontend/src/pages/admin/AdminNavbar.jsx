import logo from "../../../assets/visal_logo.webp";
import React from "react";
import { NavLink } from "react-router-dom";
import { CalendarDays, ClipboardCheck, FileText, LayoutDashboard, UserPlus, UsersRound } from "lucide-react";
import { colorForName, letterFor } from "../../utils/avatar.js";

function AdminNavbar({ collapsed, userName, userRole }) {
  const displayName = userName || "Admin User";
  const displayRole = userRole || "Administrator";

  const linkBaseClass =
    "flex h-12 items-center gap-3.5 rounded-2xl border border-transparent bg-white/85 px-4 font-medium text-gray-800 no-underline transition-all duration-[180ms] hover:border-blue-500/20 hover:bg-blue-500/[0.12] hover:text-[#0f4987] [&_svg]:text-blue-600 max-[900px]:!justify-start" +
    (collapsed ? " justify-center" : "");

  const linkClass = ({ isActive }) =>
    `${linkBaseClass}${isActive ? " border-blue-500/[0.35] bg-blue-500/[0.16] text-[#0f4987]" : ""}`;

  const labelClass =
    "inline-block whitespace-nowrap transition-all duration-200 max-[900px]:!w-auto max-[900px]:!opacity-100" +
    (collapsed ? " w-0 overflow-hidden opacity-0" : "");

  return (
    <aside
      className={`fixed left-0 top-0 z-[100] flex h-screen flex-col border-r border-[rgba(15,23,42,0.08)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-[width,padding] duration-300 ease-in-out max-[900px]:!h-auto max-[900px]:!w-full max-[900px]:!static max-[900px]:!p-[18px_16px] ${
        collapsed ? "w-[90px] p-[20px_12px]" : "w-[250px] p-[24px_10px]"
      }`}
    >
      <div className="flex items-center gap-3.5 rounded-[20px] border border-[#e5e7e7] p-[12px_10px]">
        <img src={logo} alt="Visal logo" className="h-11 w-11 rounded-[14px] bg-white object-contain p-1.5" />
        {!collapsed && (
          <div>
            <h2 className="m-0 text-center text-lg font-semibold text-[#134895]">Visal - Re </h2>
            <p className="mt-1 text-[13px] tracking-[0.01em] text-slate-600">Admin Portal</p>
          </div>
        )}
      </div>

      <nav className="mt-[30px] flex flex-col gap-2.5">
        <NavLink to="/admin-dashboard" end className={linkClass}>
          <LayoutDashboard size={18} />
          <span className={labelClass}>Overview</span>
        </NavLink>
        <NavLink to="approvals" className={linkClass}>
          <ClipboardCheck size={18} />
          <span className={labelClass}>Approvals</span>
        </NavLink>
        <NavLink to="schedule" className={linkClass}>
          <CalendarDays size={18} />
          <span className={labelClass}>View Schedule</span>
        </NavLink>
        <NavLink to="register-staff" className={linkClass}>
          <UserPlus size={18} />
          <span className={labelClass}>Register Staff</span>
        </NavLink>
        <NavLink to="staff-members" className={linkClass}>
          <UsersRound size={18} />
          <span className={labelClass}>Staff Members</span>
        </NavLink>
        <NavLink to="reports" className={linkClass}>
          <FileText size={18} />
          <span className={labelClass}>Reports</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-[rgba(15,23,42,0.08)] pt-3.5">
        <div className={`flex w-full min-w-0 items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div
            className={`rounded-[18px] border border-[rgba(17,74,157,0.1)] bg-gradient-to-b from-[#f8fbff] to-[#eef5ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_16px_rgba(17,74,157,0.14)] flex items-center gap-3 min-w-0 ${
              collapsed ? "p-2" : "p-[11px]"
            }`}
          >
            <div
              className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#cfe0fb] to-white p-[2.5px] shadow-[0_2px_6px_rgba(17,74,157,0.16)] ${
                collapsed ? "h-[46px] w-[46px]" : "h-12 w-12"
              }`}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full text-base font-bold tracking-[0.02em] text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12)]"
                style={{ background: `linear-gradient(145deg, ${colorForName(displayName)}, ${colorForName(displayName)}cc)` }}
              >
                {letterFor(displayName) || "A"}
              </div>
              <span className="absolute -bottom-px -right-px h-3 w-3 rounded-full border-[2.5px] border-[#f8fbff] bg-emerald-500 shadow-[0_0_0_2px_rgba(34,197,94,0.18)]" title="Online" />
            </div>
            {!collapsed && (
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="truncate text-[13px] font-bold leading-tight text-gray-900">{displayName}</div>
                <div className="inline-flex w-fit max-w-full items-center gap-1.5 truncate rounded-full border border-[rgba(15,23,42,0.07)] bg-white px-2 py-1 text-[11px] font-bold capitalize text-[#4b607c]">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.14)]" />
                  {displayRole}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminNavbar;
