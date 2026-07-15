import logo from "../assets/visal_logo.webp";
import { NavLink, Link } from "react-router-dom";
import React from "react";
import { CalendarCheck, CalendarDays, LifeBuoy, ListChecks, PanelBottom, PanelLeft } from "lucide-react";
import { colorForName, letterFor } from "../utils/avatar.js";

const NAV_ITEMS = [
  { to: "/booking", end: true, icon: CalendarCheck, label: "New Booking" },
  { to: "/booking/scheduleview", icon: CalendarDays, label: "View Schedule" },
  { to: "/booking/viewbookings", icon: ListChecks, label: "My Bookings" },
  { to: "/booking/help", icon: LifeBuoy, label: "Help & Support" },
];

function SidebarNav({ displayName = "Guest User", displayRole = "Visitor", navLayout = "sidebar", setNavLayout = () => {} }) {
  const isSidebar = navLayout === "sidebar";

  return (
    <aside className="fixed left-0 top-0 z-[100] flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white p-4 max-[900px]:!h-auto max-[900px]:!w-full max-[900px]:!static">
      <div className="flex items-center gap-2 px-1 pb-4">
        <img src={logo} alt="Visal logo" className="h-10 w-10 shrink-0 rounded-xl object-contain ring-1 ring-slate-200" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-bold leading-tight text-[#11233f]">Visal - Re</h2>
          <p className="truncate text-xs text-slate-500">Vehicle Booking</p>
        </div>
        <div className="flex shrink-0 rounded-[10px] border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              !isSidebar ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:text-[#11233f]"
            }`}
            onClick={() => setNavLayout("bottom")}
            aria-label="Use bottom navigation"
            aria-pressed={!isSidebar}
            title="Bottom navigation"
          >
            <PanelBottom size={14} />
          </button>
          <button
            type="button"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              isSidebar ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:text-[#11233f]"
            }`}
            onClick={() => setNavLayout("sidebar")}
            aria-label="Use sidebar navigation"
            aria-pressed={isSidebar}
            title="Sidebar navigation"
          >
            <PanelLeft size={14} />
          </button>
        </div>
      </div>
      <div className="border-t border-slate-100" />

      <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[13.5px] no-underline transition-colors duration-150 ${
                isActive ? "bg-blue-50 font-semibold text-blue-700" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-[#11233f]"
              }`
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
                <span className="inline-block whitespace-nowrap">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 pt-3">
        <Link
          to="/booking/account"
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 no-underline shadow-sm transition-colors hover:border-[#1469e1]"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: `linear-gradient(145deg, ${colorForName(displayName)}, ${colorForName(displayName)}cc)` }}
          >
            {letterFor(displayName) || "G"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-bold leading-tight text-gray-900">{displayName}</div>
            <div className="truncate text-[10px] font-bold capitalize leading-tight text-[#4b607c]">{displayRole}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default SidebarNav;
