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

function BottomNav({ displayName = "Guest User", displayRole = "Visitor", navLayout = "bottom", setNavLayout = () => {} }) {
  const isSidebar = navLayout === "sidebar";

  return (
    <>
      <div className="fixed left-4 top-4 z-[100] flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <img src={logo} alt="Visal logo" className="h-10 w-10 shrink-0 rounded-xl object-contain ring-1 ring-slate-200" />
        <div className="min-w-0 max-[640px]:hidden">
          <h2 className="truncate text-[15px] font-bold leading-tight text-[#11233f]">Visal - Re</h2>
          <p className="truncate text-xs text-slate-500">Vehicle Booking</p>
        </div>

        <div className="h-8 w-px bg-slate-200 max-[640px]:hidden" />

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

      <Link
        to="/booking/account"
        className="fixed left-4 bottom-4 z-[100] flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 no-underline shadow-sm transition-colors hover:border-[#1469e1] max-[640px]:hidden"
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

      <nav className="fixed inset-x-0 bottom-0 z-[100] overflow-x-auto bg-transparent p-4">
        <div className="mx-auto flex w-fit items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
          {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-[11px] font-medium no-underline transition-colors duration-150 max-[480px]:px-3 ${
                  isActive ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-[#11233f]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                  <span className="whitespace-nowrap max-[480px]:hidden">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export default BottomNav;
