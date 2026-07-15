import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  CalendarX2,
  Clock,
  Eye,
  FileText,
  Info,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { timeWindowValidation } from "../utils/bookings.js";
import BookingModal from "../components/BookingModal";
import InfoButton from "../components/InfoButton";
import { API_BASE_URL } from "../config.js";
import { useSettings } from "../hooks/useSettings.js";
import useGreeting from "../hooks/useGreeting.js";

const fieldClass = "w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-[#11233f] outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";

const labelClass = "text-sm font-bold text-[#11233f]";

const UPCOMING_STATUS_CLASS = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

function Booking() {
  const { settings } = useSettings();
  const { greeting, todayLabel } = useGreeting();
  const today = new Date().toISOString().split("T")[0];
  const requesterName = (localStorage.getItem("full_name") || "there").split(" ")[0];

  const [bookingDate, setBookingDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState(
    "Client Business Development Meeting"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [upcoming, setUpcoming] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  const loadUpcoming = async () => {
    const staffId = (localStorage.getItem("staff_id") || "").trim();
    if (!staffId) return;

    setUpcomingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/staff/${staffId}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const remote = Array.isArray(data.bookings) ? data.bookings : [];
      const todayDate = new Date().toISOString().split("T")[0];

      const mapped = remote
        .filter((b) => {
          const status = (b.status || "").toLowerCase();
          return (status === "approved" || status === "pending") && b.booking_date >= todayDate;
        })
        .sort((a, b) => (a.booking_date + a.start_time).localeCompare(b.booking_date + b.start_time))
        .slice(0, 3)
        .map((b) => ({
          id: b.booking_id,
          date: b.booking_date,
          startTime: b.start_time,
          endTime: b.end_time,
          purpose: b.purpose,
          location: b.location,
          status: (b.status || "").toLowerCase(),
        }));

      setUpcoming(mapped);
    } catch {
      // silently skip — this is a convenience widget, not critical path
    } finally {
      setUpcomingLoading(false);
    }
  };

  useEffect(() => {
    loadUpcoming();
  }, []);

  const maxAdvanceDate = useMemo(() => {
    if (settings.max_advance_days === null || settings.max_advance_days === undefined) return undefined;
    const date = new Date();
    date.setDate(date.getDate() + Number(settings.max_advance_days));
    return date.toISOString().split("T")[0];
  }, [settings.max_advance_days]);

  const liveDuration = useMemo(() => durationMinutes(startTime, endTime), [startTime, endTime]);
  const durationExceedsMax = Boolean(
    liveDuration && settings.max_booking_duration_minutes && liveDuration > settings.max_booking_duration_minutes
  );

  // Validation
  const validateBooking = () => {
    const timeError = timeWindowValidation(startTime, endTime, settings.booking_start_time, settings.booking_end_time);
    if (timeError) return timeError;

    if (!bookingDate) return "Booking date is required";

    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    const dayOfWeek = selectedDate.getDay();
    if (!settings.allow_weekend_bookings && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return "Weekend bookings are not allowed";
    }

    if (settings.max_advance_days !== null && settings.max_advance_days !== undefined) {
      const latestAllowed = new Date();
      latestAllowed.setDate(latestAllowed.getDate() + Number(settings.max_advance_days));
      if (selectedDate > latestAllowed) {
        return `Bookings cannot be made more than ${settings.max_advance_days} day${Number(settings.max_advance_days) === 1 ? "" : "s"} in advance`;
      }
    }

    if (settings.min_lead_time_minutes) {
      const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
      const earliestAllowed = new Date(Date.now() + settings.min_lead_time_minutes * 60000);
      if (startDateTime < earliestAllowed) {
        return `Bookings require at least ${formatMinutes(settings.min_lead_time_minutes)} advance notice`;
      }
    }

    if (settings.max_booking_duration_minutes && liveDuration > settings.max_booking_duration_minutes) {
      return `Bookings cannot exceed ${formatMinutes(settings.max_booking_duration_minutes)}`;
    }

    if (!location.trim()) return "Destination is required";
    if (!purpose.trim()) return "Purpose is required";

    const staffId = (localStorage.getItem("staff_id") || "").trim();
    if (!staffId) return "You must be logged in to create a booking";

    return null; // validation passed
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateBooking();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/create_booking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            location,
            purpose,
            notes,
          }),
        }
      );

      const data = await response.json();
      console.log("Booking create response:", response.status, data);

      if (!response.ok) {
        if (
          response.status === 422 &&
          typeof data?.msg === "string" &&
          data.msg.toLowerCase().includes("subject must be a string")
        ) {
          localStorage.removeItem("access_token");
          setError("Your session is outdated. Please sign in again.");
          return;
        }

        const serverError = data.error || data.msg || data.message || response.statusText;
        setError(serverError || "Failed to create booking");
      } else {
        setSuccess("Booking request submitted successfully for approval!");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setPurpose("Client Business Development Meeting");
        setNotes("");
        loadUpcoming();
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasPreviewCore = Boolean(bookingDate && startTime && endTime && location.trim() && purpose.trim());

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <CalendarPlus size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <p className="m-0 text-lg font-semibold text-[#6b7f9e]">{greeting}, {requesterName} 👋</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">New booking request</h1>
            <InfoButton text="Fill in the details below to request a vehicle for travel, meetings, or client visits." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <CalendarClock size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CalendarClock size={18} />
            </div>
            {upcoming.length > 0 ? (
              <p className="m-0 text-[15px] text-[#11233f]">
                <strong className="font-bold">{upcoming.length} upcoming</strong>
                <span className="text-[#7b8ba5]"> request{upcoming.length === 1 ? "" : "s"} on your calendar</span>
              </p>
            ) : (
              <p className="m-0 text-[15px] text-[#7b8ba5]">No upcoming requests — you're all clear.</p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <form className="flex flex-col rounded-3xl border border-slate-200 bg-white" onSubmit={handleSubmit}>
          <div className="p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Clock size={18} />
              </div>
              <h3 className="m-0 text-xl font-bold text-[#11233f]">Schedule</h3>
            </div>
            <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className={labelClass}>Booking Date</label>
                  <InfoButton text="Select the date for pickup." />
                </div>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={today}
                  max={maxAdvanceDate}
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className={labelClass}>Start Time</label>
                  <InfoButton text={`Booking starts no earlier than ${formatHourLabel(settings.booking_start_time)}.`} />
                </div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className={labelClass}>End Time</label>
                  <InfoButton text={`Booking ends by ${formatHourLabel(settings.booking_end_time)} at the latest.`} />
                </div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            {liveDuration > 0 && (
              <p className={`m-0 mt-4 inline-flex items-center gap-2 text-[13px] font-semibold ${durationExceedsMax ? "text-rose-600" : "text-[#1469e1]"}`}>
                <Info size={14} />
                Duration: {formatMinutes(liveDuration)}
                {settings.max_booking_duration_minutes ? ` (max ${formatMinutes(settings.max_booking_duration_minutes)})` : ""}
                {durationExceedsMax ? " — exceeds the allowed maximum" : ""}
              </p>
            )}

            {(settings.min_lead_time_minutes > 0 || settings.max_advance_days !== null || !settings.allow_weekend_bookings) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {settings.min_lead_time_minutes > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Requires {formatMinutes(settings.min_lead_time_minutes)} notice
                  </span>
                )}
                {settings.max_advance_days !== null && settings.max_advance_days !== undefined && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Up to {settings.max_advance_days} day{Number(settings.max_advance_days) === 1 ? "" : "s"} ahead
                  </span>
                )}
                {!settings.allow_weekend_bookings && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <CalendarX2 size={12} /> Weekdays only
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <MapPin size={18} />
              </div>
              <h3 className="m-0 text-xl font-bold text-[#11233f]">Trip details</h3>
            </div>
            <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
              <div>
                <label className={`${labelClass} mb-2 block`}>Destination</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={`${labelClass} mb-2 block`}>Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>Select a booking reason</option>
                  <option>Client Business Development Meeting</option>
                  <option>Client Relations Visit</option>
                  <option>Insurance Company Visit - Commission Follow-Up</option>
                  <option>Insurance Company Visit - Outstanding Claim Follow-Up</option>
                  <option>Reinsurance Marketing Round</option>
                  <option>Bank Visit - Company Cheque Deposit/Withdrawal</option>
                  <option>Reinsurance Gifts Delivery to Clients</option>
                  <option>Official Document Collection/Delivery (Visal/Visal Re)</option>
                  <option>Corporate Event Meeting/ Representation</option>
                  <option>Purchase of Ordered Items/Equipment Pickup</option>
                  <option>Staff airport Drop Off/Pick up</option>
                  <option>Purchase of Office Items/Provision</option>
                </select>
              </div>
            </div>

            <div className="mt-[18px]">
              <div className="mb-2 flex items-center gap-2">
                <label className={labelClass}>Additional Notes</label>
                <InfoButton text="Optional — add anything the admin should know before approving." />
              </div>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any additional instructions or details"
                maxLength={500}
                className={fieldClass}
              />
              <span className="mt-1.5 block text-right text-xs text-slate-400">{notes.length}/500</span>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 p-6">
            <p className="inline-flex items-center gap-2 text-xs text-slate-500"><Info size={14} /> Submitted bookings are sent for admin approval.</p>
            <button
              type="submit"
              className="min-h-12 cursor-pointer rounded-xl border-none bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <Eye size={18} className="text-[#1469e1]" />
              <h2 className="m-0 text-lg font-bold text-[#11233f]">Preview</h2>
            </div>

            {!hasPreviewCore ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50 p-6 text-center">
                <ClipboardList size={28} className="text-slate-300" />
                <p className="m-0 text-sm text-slate-500">Fill in the form to see a live preview of your request.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#11233f]">{formatPreviewDate(bookingDate)}</span>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Pending</span>
                </div>
                <p className="m-0 mt-2 text-base font-semibold leading-snug text-[#11233f]">{purpose}</p>
                <div className="mt-3.5 space-y-2.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-slate-400" />
                    {startTime}–{endTime}
                    {liveDuration > 0 && <span className="text-slate-400">· {formatMinutes(liveDuration)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{location}</span>
                  </div>
                  {notes.trim() && (
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {!upcomingLoading && upcoming.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CalendarClock size={18} className="text-[#1469e1]" />
                  <h2 className="m-0 text-lg font-bold text-[#11233f]">Upcoming</h2>
                </div>
                <Link to="/booking/viewbookings" className="inline-flex items-center gap-1 text-sm font-bold text-[#1469e1] hover:text-[#115cc7]">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {upcoming.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#11233f]">{formatShortDate(booking.date)}</span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${UPCOMING_STATUS_CLASS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="m-0 mt-1.5 truncate text-sm text-slate-600" title={booking.purpose}>{booking.purpose}</p>
                    <p className="m-0 mt-1 text-xs text-slate-400">{booking.startTime} - {booking.endTime} · {booking.location}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <BookingModal
        message={error}
        onClose={() => setError("")}
        type="error"
      />

      <BookingModal
        message={success}
        onClose={() => setSuccess("")}
        type="success"
      />

      <footer className="mt-10 text-center text-[13px] text-slate-500">
        © {new Date().getFullYear()} Visal Vehicle System. All rights reserved. |{" "}
        <a href="http://www.vaarde.com" target="_blank" rel="noreferrer" className="hover:text-[#1469e1] transition-colors">
          {settings.org_name}
        </a>
      </footer>
    </div>
  );
}

function formatHourLabel(value) {
  if (!value) return "N/A";
  const [hourStr, minuteStr] = value.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatShortDate(value) {
  if (!value) return "N/A";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPreviewDate(value) {
  if (!value) return "N/A";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function durationMinutes(start, end) {
  if (!start || !end) return 0;
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  if ([startHour, startMin, endHour, endMin].some((n) => Number.isNaN(n))) return 0;
  const diff = endHour * 60 + endMin - (startHour * 60 + startMin);
  return diff > 0 ? diff : 0;
}

function formatMinutes(minutes) {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

export default Booking;
