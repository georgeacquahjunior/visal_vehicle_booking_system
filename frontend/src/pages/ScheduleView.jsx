import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarDays,
  CalendarRange,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  List,
  Mail,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../config.js";
import { colorForName } from "../utils/avatar.js";
import InfoButton from "../components/InfoButton";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import useGreeting from "../hooks/useGreeting.js";
import { useSettings } from "../hooks/useSettings.js";

const VIEW_OPTIONS = [
  { value: "month", label: "Month", icon: CalendarRange },
  { value: "week", label: "Week", icon: CalendarDays },
  { value: "day", label: "Day", icon: Calendar },
  { value: "list", label: "List", icon: List },
];

const WEEKDAY_LABELS_MONDAY_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_LABELS_SUNDAY_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseTimeToMinutes(value, fallback) {
  if (!value) return fallback;
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback;
  return hour * 60 + minute;
}
const LIST_PAGE_SIZE = 8;

const STATUS_DOT_CLASS = { approved: "bg-emerald-500", pending: "bg-amber-500" };
const STATUS_BADGE_CLASS = { approved: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700" };
const BOOKING_CARD_CLASS = {
  approved: "bg-emerald-50 border-l-2 border-emerald-500 text-emerald-800",
  pending: "bg-amber-50 border-l-2 border-amber-500 text-amber-800",
};

function ScheduleView() {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [listPage, setListPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { todayLabel } = useGreeting();

  const weekStartsOnSunday = settings.week_start_day === "sunday";
  const WEEKDAY_LABELS = weekStartsOnSunday ? WEEKDAY_LABELS_SUNDAY_START : WEEKDAY_LABELS_MONDAY_START;
  const dayStartMinutes = parseTimeToMinutes(settings.booking_start_time, 6 * 60);
  const dayEndMinutes = parseTimeToMinutes(settings.booking_end_time, 18 * 60);

  const appliedDefaultView = useRef(false);
  useEffect(() => {
    if (!appliedDefaultView.current && settings.default_schedule_view) {
      appliedDefaultView.current = true;
      setView(settings.default_schedule_view);
    }
  }, [settings.default_schedule_view]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/schedule_view`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        const remote = Array.isArray(data.bookings) ? data.bookings : [];

        const mapped = remote
          .filter((b) => {
            const status = b.status ? b.status.toString().trim().toLowerCase() : "";
            return status !== "declined" && status !== "cancelled" && status !== "canceled";
          })
          .map((b) => {
            let duration = "";
            try {
              if (b.start_time && b.end_time) {
                const [sh, sm] = b.start_time.split(":").map(Number);
                const [eh, em] = b.end_time.split(":").map(Number);
                const diff = eh * 60 + em - (sh * 60 + sm);
                if (diff > 0) {
                  const h = Math.floor(diff / 60);
                  const m = diff % 60;
                  duration = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
                }
              }
            } catch {
              duration = "";
            }

            return {
              id: b.booking_id,
              vehicleName: b.vehicle_name || b.vehicle || `Booking ${b.booking_id}`,
              startTime: b.start_time,
              endTime: b.end_time,
              date: b.booking_date ? new Date(b.booking_date) : new Date(),
              purpose: b.purpose,
              location: b.location,
              status: b.status ? b.status.toString().trim().toLowerCase() : "",
              userName: b.staff_name || b.staff || "Staff",
              userDept: b.department || "",
              userEmail: b.staff_email || "",
              notes: b.notes || "",
              duration,
            };
          });

        setBookings(mapped);
      } catch (err) {
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    setListPage(1);
  }, [searchTerm, statusFilter, currentDate]);

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const filteredBookings = useMemo(
    () => (statusFilter === "all" ? bookings : bookings.filter((b) => (b.status || "").toLowerCase() === statusFilter)),
    [bookings, statusFilter]
  );

  const dayScopedBookings = useMemo(
    () => filteredBookings.filter((b) => isSameDay(b.date, currentDate)),
    [filteredBookings, currentDate]
  );

  const searchedBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return dayScopedBookings;
    return dayScopedBookings.filter((b) =>
      [b.userName, b.purpose, b.location, b.vehicleName, b.userDept].some((value) =>
        (value || "").toString().toLowerCase().includes(search)
      )
    );
  }, [dayScopedBookings, searchTerm]);

  const sortedListBookings = useMemo(() => {
    return [...searchedBookings].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [searchedBookings]);

  const listPageStart = (listPage - 1) * LIST_PAGE_SIZE;
  const visibleListBookings = sortedListBookings.slice(listPageStart, listPageStart + LIST_PAGE_SIZE);

  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diffToStart = weekStartsOnSunday ? -day : (day === 0 ? -6 : 1 - day);
    const weekStart = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + diffToStart);
    return Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i));
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = weekStartsOnSunday ? firstOfMonth.getDay() : (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  };

  const formatShort = (date) => `${MONTH_NAMES[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`;
  const formatWeekday = (date) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();

  const timeSlots = Array.from({ length: Math.max(1, Math.ceil((dayEndMinutes - dayStartMinutes) / 30)) }, (_, i) => {
    const totalMinutes = dayStartMinutes + i * 30;
    const hour = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  });

  const getBookingsForDay = (date) => filteredBookings.filter((b) => isSameDay(b.date, date));

  const getBookingsForSlot = (date, time) => {
    const dayBookings = getBookingsForDay(date);
    const [slotHour, slotMin] = time.split(":").map(Number);
    return dayBookings.filter((b) => {
      if (!b.startTime || !b.endTime) return false;
      const [startHour, startMin] = b.startTime.split(":").map(Number);
      const [endHour, endMin] = b.endTime.split(":").map(Number);
      const slotStart = slotHour * 60 + slotMin;
      const slotEnd = slotStart + 30;
      const bookingStart = startHour * 60 + startMin;
      const bookingEnd = endHour * 60 + endMin;
      return bookingStart < slotEnd && bookingEnd > slotStart;
    });
  };

  const getBookingStyle = (booking, slotTime) => {
    if (!booking.startTime || !booking.endTime) return {};
    const [startHour, startMin] = booking.startTime.split(":").map(Number);
    const [endHour, endMin] = booking.endTime.split(":").map(Number);
    const [slotHour, slotMin] = slotTime.split(":").map(Number);
    const bookingStart = startHour * 60 + startMin;
    const bookingEnd = endHour * 60 + endMin;
    const slotStart = slotHour * 60 + slotMin;
    const offsetMinutes = Math.max(0, bookingStart - slotStart);
    const topOffset = (offsetMinutes / 30) * 40;
    const durationMinutes = bookingEnd - bookingStart;
    const height = (durationMinutes / 30) * 40;
    return { top: `${topOffset}px`, height: `${Math.max(height - 4, 30)}px` };
  };

  const getBookingColumns = (dayBookings) => {
    if (dayBookings.length === 0) return [];
    const sorted = [...dayBookings].sort((a, b) => {
      const aStart = a.startTime.split(":").map(Number);
      const bStart = b.startTime.split(":").map(Number);
      return aStart[0] * 60 + aStart[1] - (bStart[0] * 60 + bStart[1]);
    });

    const columns = [];
    sorted.forEach((booking) => {
      const [startH, startM] = booking.startTime.split(":").map(Number);
      const [endH, endM] = booking.endTime.split(":").map(Number);
      const bookingStart = startH * 60 + startM;
      const bookingEnd = endH * 60 + endM;

      let placed = false;
      for (const col of columns) {
        const hasOverlap = col.some((b) => {
          const [bStartH, bStartM] = b.startTime.split(":").map(Number);
          const [bEndH, bEndM] = b.endTime.split(":").map(Number);
          const bStart = bStartH * 60 + bStartM;
          const bEnd = bEndH * 60 + bEndM;
          return bookingStart < bEnd && bookingEnd > bStart;
        });
        if (!hasOverlap) {
          col.push(booking);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([booking]);
    });
    return columns;
  };

  const getCurrentTimePosition = () => {
    if (!settings.show_current_time_indicator) return null;
    const now = currentTime;
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    if (totalMinutes < dayStartMinutes || totalMinutes > dayEndMinutes) return null;
    return ((totalMinutes - dayStartMinutes) / 30) * 40;
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToDay = (date) => {
    setCurrentDate(date);
    setView("day");
  };

  const headerLabel = () => {
    if (view === "month") return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "week") return `${formatShort(weekDays[0])} - ${formatShort(weekDays[6])}`;
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const currentTimePosition = getCurrentTimePosition();

  const renderBookingBlock = (booking, style, extra) => (
    <div
      key={booking.id}
      className={`absolute z-10 cursor-pointer overflow-hidden rounded-lg p-2 text-xs transition-all hover:-translate-y-px hover:shadow-md ${BOOKING_CARD_CLASS[booking.status] || BOOKING_CARD_CLASS.pending}`}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedBooking(booking);
      }}
      style={{ ...style, ...extra }}
    >
      <div className="truncate text-xs font-bold">{booking.purpose || booking.vehicleName}</div>
      <div className="truncate text-[10px] font-medium opacity-80">
        {booking.userName} • {booking.duration || `${booking.startTime} - ${booking.endTime}`}
      </div>
    </div>
  );

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[160px] flex-col justify-center gap-1 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <CalendarDays size={150} className="absolute -bottom-8 right-6 text-blue-700/[0.05]" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#11233f]">Schedule</h1>
          <InfoButton text="Browse bookings by month, week, or day, or switch to a flat list." />
        </div>
        <p className="relative z-10 m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
      </section>

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
          <AlertCircle size={18} />
          <span className="flex-1 text-sm font-semibold">{error}</span>
          <button type="button" className="rounded-lg p-1 hover:bg-black/5" onClick={() => setError(null)} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                  view === value ? "bg-white text-[#1469e1] shadow-sm" : "text-slate-500 hover:text-[#11233f]"
                }`}
                onClick={() => setView(value)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
                onClick={() => navigate("prev")}
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-bold text-[#11233f]">
                {headerLabel()}
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
                onClick={() => navigate("next")}
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
            </div>

            {view === "list" && (
              <div className="relative w-full max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1469e1]"
                  placeholder="Search this day's bookings..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill active={statusFilter === "all"} label="All" onClick={() => setStatusFilter("all")} />
            <StatusPill active={statusFilter === "approved"} label="Approved" onClick={() => setStatusFilter("approved")} />
            <StatusPill active={statusFilter === "pending"} label="Pending" onClick={() => setStatusFilter("pending")} />
          </div>
        </div>
      </section>

      <section className="mt-5">
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-sm font-medium text-slate-500">
            <Spinner />
            <span>Loading schedule...</span>
          </div>
        ) : (
          <>
            {view === "month" && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="border-r border-slate-200 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 last:border-r-0">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const dayBookings = getBookingsForDay(day).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
                    const visible = dayBookings.slice(0, 3);
                    const overflow = dayBookings.length - visible.length;

                    return (
                      <div
                        key={idx}
                        className={`min-h-[110px] cursor-pointer border-b border-r border-slate-100 p-2 transition-colors last:border-r-0 hover:bg-slate-50 [&:nth-child(7n)]:border-r-0 ${
                          isToday ? "bg-[#eef4ff]" : ""
                        }`}
                        onClick={() => goToDay(day)}
                      >
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isToday ? "bg-[#1469e1] text-white" : isCurrentMonth ? "text-[#11233f]" : "text-slate-300"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        <div className="mt-1.5 space-y-1">
                          {visible.map((booking) => (
                            <div
                              key={booking.id}
                              className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-[11px] font-semibold ${BOOKING_CARD_CLASS[booking.status] || BOOKING_CARD_CLASS.pending}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[booking.status] || "bg-slate-400"}`} />
                              <span className="truncate">{booking.startTime} {booking.purpose || booking.vehicleName}</span>
                            </div>
                          ))}
                          {overflow > 0 && <div className="px-1.5 text-[11px] font-bold text-slate-400">+{overflow} more</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="flex h-[calc(100vh-420px)] min-h-[480px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="grid shrink-0 grid-cols-[60px_1fr] border-b border-slate-200">
                  <div className="flex items-end justify-center border-r border-slate-200 p-3 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">GMT</span>
                  </div>
                  <div className="grid grid-cols-7">
                    {weekDays.map((day, idx) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div key={idx} className={`border-r border-slate-200 p-3 text-center last:border-r-0 ${isToday ? "bg-[#eef4ff]" : ""}`}>
                          <p className={`mb-1.5 text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-[#1469e1]" : "text-slate-400"}`}>{formatWeekday(day)}</p>
                          <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-[#1469e1] text-white" : "text-[#11233f]"}`}>
                            {day.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative flex-1 overflow-y-auto">
                  <div className="grid min-h-full grid-cols-[60px_1fr]">
                    <div className="flex flex-col border-r border-slate-200 text-xs font-medium text-slate-400">
                      {timeSlots.map((time, idx) => (
                        <div key={idx} className="relative flex h-10 items-start justify-center pt-2">
                          <span className="block -translate-y-1/2">{time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {weekDays.map((day, dayIdx) => (
                        <div key={dayIdx} className={`relative border-r border-slate-100 last:border-r-0 ${isSameDay(day, new Date()) ? "bg-[#f7faff]" : ""}`}>
                          {timeSlots.map((time, slotIdx) => {
                            const slotBookings = getBookingsForSlot(day, time);
                            const columns = getBookingColumns(slotBookings);
                            const columnCount = columns.length;

                            return (
                              <div key={slotIdx} className="relative border-b border-slate-100" style={{ height: "40px" }}>
                                {columns.map((column, colIdx) =>
                                  column.map((booking) => {
                                    const [bookingStartH, bookingStartM] = booking.startTime.split(":").map(Number);
                                    const [slotH, slotM] = time.split(":").map(Number);
                                    const bookingStartMin = bookingStartH * 60 + bookingStartM;
                                    const slotStartMin = slotH * 60 + slotM;
                                    if (bookingStartMin >= slotStartMin && bookingStartMin < slotStartMin + 30) {
                                      const style = getBookingStyle(booking, time);
                                      const width = columnCount > 1 ? `calc(${100 / columnCount}% - 4px)` : "calc(100% - 8px)";
                                      const left = columnCount > 1 ? `calc(${(colIdx * 100) / columnCount}% + 4px)` : "4px";
                                      return renderBookingBlock(booking, style, { width, left });
                                    }
                                    return null;
                                  })
                                )}
                              </div>
                            );
                          })}
                          {isSameDay(day, new Date()) && currentTimePosition !== null && (
                            <div className="pointer-events-none absolute left-0 right-0 z-20" style={{ top: `${currentTimePosition}px` }}>
                              <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
                              <div className="absolute left-0 right-0 h-0.5 w-full bg-rose-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "day" && (
              <div className="h-[calc(100vh-420px)] min-h-[480px] overflow-y-auto rounded-3xl border border-slate-200 bg-white">
                {timeSlots.map((time, idx) => {
                  const slotBookings = getBookingsForSlot(currentDate, time);
                  const columns = getBookingColumns(slotBookings);
                  const columnCount = columns.length;

                  return (
                    <div key={idx} className="flex min-h-[40px] border-b border-slate-100">
                      <div className="w-[60px] shrink-0 border-r border-slate-200 p-2 text-right text-xs font-medium text-slate-400">{time}</div>
                      <div className="relative flex-1">
                        {columns.map((column, colIdx) =>
                          column.map((booking) => {
                            const [bookingStartH, bookingStartM] = booking.startTime.split(":").map(Number);
                            const [slotH, slotM] = time.split(":").map(Number);
                            const bookingStartMin = bookingStartH * 60 + bookingStartM;
                            const slotStartMin = slotH * 60 + slotM;
                            if (bookingStartMin >= slotStartMin && bookingStartMin < slotStartMin + 30) {
                              const style = getBookingStyle(booking, time);
                              const width = columnCount > 1 ? `calc(${100 / columnCount}% - 8px)` : "calc(100% - 16px)";
                              const left = columnCount > 1 ? `calc(${(colIdx * 100) / columnCount}% + 8px)` : "8px";
                              return renderBookingBlock(booking, style, { width, left });
                            }
                            return null;
                          })
                        )}
                        {isSameDay(currentDate, new Date()) && currentTimePosition !== null && idx === 0 && (
                          <div className="pointer-events-none absolute left-0 right-0 z-20" style={{ top: `${currentTimePosition}px` }}>
                            <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
                            <div className="absolute left-0 right-0 h-0.5 w-full bg-rose-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === "list" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                {sortedListBookings.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-[#f7f9fc] to-[#eef4fb] p-5 text-center text-[#53657f]">
                    <Calendar size={40} />
                    <span>No bookings match your current filters.</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="w-[24%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Requester</th>
                            <th className="w-[24%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Purpose</th>
                            <th className="w-[18%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Date & time</th>
                            <th className="hidden w-[16%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500 md:table-cell">Location</th>
                            <th className="w-[12%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleListBookings.map((booking) => (
                            <tr
                              key={booking.id}
                              className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <td className="px-4 py-3.5 align-middle">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ backgroundColor: colorForName(booking.userName) }}
                                  >
                                    {nameInitials(booking.userName)}
                                  </div>
                                  <div className="min-w-0">
                                    <strong className="block truncate font-semibold text-[#11233f]">{booking.userName}</strong>
                                    <span className="block truncate text-xs text-slate-400">{booking.userDept || "No department"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 align-middle text-slate-600">
                                <span className="line-clamp-2">{booking.purpose}</span>
                              </td>
                              <td className="px-4 py-3.5 align-middle text-slate-600">
                                <div className="truncate font-semibold text-[#11233f]">{formatShort(booking.date)}</div>
                                <div className="mt-0.5 truncate text-xs text-slate-400">{booking.startTime} - {booking.endTime}</div>
                              </td>
                              <td className="hidden truncate px-4 py-3.5 align-middle text-slate-600 md:table-cell">{booking.location}</td>
                              <td className="px-4 py-3.5 align-middle">
                                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                                  {booking.status || "Unknown"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination currentPage={listPage} onPageChange={setListPage} pageSize={LIST_PAGE_SIZE} totalItems={sortedListBookings.length} />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {selectedBooking && <ScheduleDetailsDialog booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </div>
  );
}

function StatusPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
        active
          ? "border-[#1469e1] bg-[#1469e1] text-white"
          : "border-slate-200 bg-white text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ScheduleDetailsDialog({ booking, onClose }) {
  const detailRows = [
    { icon: CalendarDays, label: "Date", value: booking.date ? `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][booking.date.getDay()]}, ${MONTH_NAMES[booking.date.getMonth()]} ${booking.date.getDate()}` : null },
    { icon: Clock, label: "Time", value: `${booking.startTime} - ${booking.endTime}` },
    { icon: Clock3, label: "Duration", value: booking.duration },
    { icon: Car, label: "Vehicle", value: booking.vehicleName },
    { icon: MapPin, label: "Location", value: booking.location },
    { icon: Building2, label: "Department", value: booking.userDept },
    { icon: Mail, label: "Requester email", value: booking.userEmail },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between p-6 pb-0">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Booking details</span>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#11233f]" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3.5 p-6 pt-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: colorForName(booking.userName) }}>
            {nameInitials(booking.userName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate text-base font-bold text-[#11233f]">{booking.userName}</h2>
            <p className="m-0 mt-0.5 truncate text-sm text-slate-500">{booking.userDept || "No department"}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[booking.status] || "bg-slate-100 text-slate-600"}`}>
            {booking.status || "Unknown"}
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6">
          <p className="m-0 rounded-xl bg-slate-50 p-4 text-sm font-medium leading-relaxed text-[#11233f]">{booking.purpose || "N/A"}</p>

          <dl className="mt-2 divide-y divide-slate-100">
            {detailRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3">
                <dt className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon size={15} className="shrink-0 text-slate-400" />
                  {label}
                </dt>
                <dd className="m-0 truncate text-right text-sm font-semibold text-[#11233f]">{value || "N/A"}</dd>
              </div>
            ))}
          </dl>

          {booking.notes && (
            <div className="mb-5 border-t border-slate-100 pt-4">
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-400">Additional notes</span>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">{booking.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 p-6">
          <button type="button" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function nameInitials(value) {
  if (!value) return "U";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default ScheduleView;
