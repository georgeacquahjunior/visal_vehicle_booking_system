import logo from "../../assets/visal_logo.webp";
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ScrollText,
  Settings,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { colorForName, letterFor } from "../../utils/avatar.js";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin-dashboard", end: true, icon: LayoutDashboard, label: "Overview" },
      { to: "approvals", icon: ClipboardCheck, label: "Approvals" },
      { to: "schedule", icon: CalendarDays, label: "View Schedule", isNew: true },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "register-staff", icon: UserPlus, label: "Register Staff" },
      { to: "staff-members", icon: UsersRound, label: "Staff Members" },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "reports", icon: FileText, label: "Reports", isNew: true },
      { to: "audit-log", icon: ScrollText, label: "Audit Log", isNew: true },
      { to: "support", icon: LifeBuoy, label: "Support", isNew: true },
      { to: "broadcast", icon: Megaphone, label: "Broadcast Email", isNew: true },
    ],
  },
];

const PROFILE_MENU_ITEMS = [
  { to: "settings", icon: Settings, label: "Settings", isNew: true },
  { to: "notifications", icon: Bell, label: "Notifications", isNew: true },
  { to: "audit-log", icon: ScrollText, label: "Audit Log" },
];

function AdminNavbar({ collapsed, userName, userRole }) {
  const displayName = userName || "Admin User";
  const displayRole = userRole || "Administrator";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  useEffect(() => {
    if (collapsed) setMenuOpen(false);
  }, [collapsed]);

  const labelClass =
    "inline-block whitespace-nowrap transition-all duration-200 max-[900px]:!w-auto max-[900px]:!opacity-100" +
    (collapsed ? " w-0 overflow-hidden opacity-0" : "");

  return (
    <aside
      className={`fixed left-0 top-0 z-[100] flex h-screen flex-col border-r border-slate-200 bg-white transition-[width,padding] duration-300 ease-in-out max-[900px]:!h-auto max-[900px]:!w-full max-[900px]:!static max-[900px]:!p-4 ${
        collapsed ? "w-[90px] p-4" : "w-[250px] p-4"
      }`}
    >
      <div className={`flex items-center gap-3 pb-4 ${collapsed ? "justify-center" : "px-1"}`}>
        <img src={logo} alt="Visal logo" className="h-10 w-10 shrink-0 rounded-xl object-contain ring-1 ring-slate-200" />
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold leading-tight text-[#11233f]">Visal - Re</h2>
            <p className="truncate text-xs text-slate-500">Admin Portal</p>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100" />

      <nav className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-3">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, end, icon: Icon, label, isNew }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[13.5px] no-underline transition-colors duration-150 max-[900px]:!justify-start ${
                      isActive ? "bg-blue-50 font-semibold text-blue-700" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-[#11233f]"
                    } ${collapsed ? "justify-center px-0" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600 transition-opacity duration-150 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <Icon size={18} className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                      <span className={`flex-1 ${labelClass}`}>{label}</span>
                      {isNew && !collapsed && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 max-[900px]:inline-flex">
                          New
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative mt-4 border-t border-slate-100 pt-4" ref={menuRef}>
        {menuOpen && !collapsed && (
          <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-slideUpFade">
            {PROFILE_MENU_ITEMS.map(({ to, icon: Icon, label, isNew }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-50 hover:text-[#11233f]"
              >
                <Icon size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1">{label}</span>
                {isNew && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    New
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => !collapsed && setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Open profile menu"
          className={`flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white text-left ${
            collapsed ? "justify-center p-2" : "p-[11px]"
          }`}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-[2.5px] ${
              collapsed ? "h-[46px] w-[46px]" : "h-11 w-11"
            }`}
          >
            <div
              className="flex h-full w-full items-center justify-center rounded-full text-sm font-bold tracking-[0.02em] text-white"
              style={{ background: `linear-gradient(145deg, ${colorForName(displayName)}, ${colorForName(displayName)}cc)` }}
            >
              {letterFor(displayName) || "A"}
            </div>
          </div>
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="truncate text-[13px] font-bold leading-tight text-gray-900">{displayName}</div>
                <div className="inline-flex w-fit max-w-full items-center truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold capitalize text-[#4b607c]">
                  {displayRole}
                </div>
              </div>
              <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;
