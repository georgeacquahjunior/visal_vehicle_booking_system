import React, { useState } from "react";
import { Info, Clock2, MapPin, ClipboardList } from "lucide-react";
import { timeWindowValidation } from "../utils/bookings.js";
import BookingModal from "../components/BookingModal";
import { API_BASE_URL } from "../config.js";

const fieldClass =
  "w-full rounded-2xl border border-[#e9eaec] bg-white p-[14px_16px] text-[15px] outline-none focus:border-[#289aff]";
const labelClass = "mb-2.5 block text-sm font-bold text-gray-900";

function Booking() {
  const today = new Date().toISOString().split("T")[0];

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

  // Validation
  const validateBooking = () => {
    const timeError = timeWindowValidation(startTime, endTime);
    if (timeError) return timeError;

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
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfb]">
      <main className="mx-auto max-w-[1280px] overflow-y-auto px-9 pb-12 pt-3">
        <div className="mb-7 grid grid-cols-[1.6fr_1fr] items-stretch gap-6 max-[1100px]:grid-cols-1">
          <div className="flex flex-col justify-center rounded-3xl border border-blue-500/[0.15] bg-gradient-to-br from-white to-[#eef3ff] p-[30px_36px] max-md:rounded-[20px] max-md:p-5">
            <div>
              <h1 className="m-0 mb-3 text-center text-[36px] leading-[1.1] text-[#102a55] max-md:text-[28px]">New Booking Request</h1>
              <p className="m-0 text-center leading-[1.75] text-gray-600">Fill in the details below to request a vehicle for travel, meetings, or client visits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-2.5 max-md:rounded-[20px] max-md:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-blue-50 text-blue-600">
                <Clock2 size={20} />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] text-gray-500">Flexible schedule</span>
                <strong className="text-[15px] text-gray-900">Choose date and time</strong>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-2.5 max-md:rounded-[20px] max-md:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e0f2fe] text-[#0c4a6e]">
                <MapPin size={20} />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] text-gray-500">Destination ready</span>
                <strong className="text-[15px] text-gray-900">Any location within city</strong>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-2.5 max-md:rounded-[20px] max-md:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-blue-50 text-blue-600">
                <ClipboardList size={20} />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] text-gray-500">Approval workflow</span>
                <strong className="text-[15px] text-gray-900">Pending review by admin</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form className="w-full rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-7" onSubmit={handleSubmit}>
            <section className="mb-[22px] rounded-[20px] border border-[rgba(146,147,148,0.12)] bg-white p-6 max-md:rounded-[20px] max-md:p-5">
              <div className="mb-5 flex justify-between gap-[18px]">
                <h3 className="m-0 text-[25px] text-[#102a55]">Schedule</h3>
              </div>
              <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
                <div>
                  <label className={labelClass}>Booking Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={today}
                    required
                    className={fieldClass}
                  />
                  <p className="mt-2.5 inline-flex items-center gap-2 text-[11px] text-slate-700 [&_svg]:text-blue-600"><Info size={14} /> Select the date for pickup.</p>
                </div>

                <div>
                  <label className={labelClass}>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className={fieldClass}
                  />
                  <p className="mt-2.5 inline-flex items-center gap-2 text-[11px] text-slate-700 [&_svg]:text-blue-600"><Info size={14} /> Booking starts no earlier than 06:00 AM.</p>
                </div>

                <div>
                  <label className={labelClass}>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className={fieldClass}
                  />
                  <p className="mt-2.5 inline-flex items-center gap-2 text-[11px] text-slate-700 [&_svg]:text-blue-600"><Info size={14} /> Booking ends before 06:00 PM by default.</p>
                </div>
              </div>
            </section>

            <section className="mb-[22px] rounded-[20px] border border-[rgba(146,147,148,0.12)] bg-white p-6 max-md:rounded-[20px] max-md:p-5">
              <div className="mb-5 flex justify-between gap-[18px]">
                <h3 className="m-0 text-[25px] text-[#102a55]">Trip Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
                <div>
                  <label className={labelClass}>Destination</label>
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
                  <label className={labelClass}>Purpose</label>
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

              <div>
                <label className={`${labelClass} mt-10 text-center`}>Additional Notes</label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide any additional instructions or details"
                  className={fieldClass}
                />
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-blue-500/[0.14] bg-[#eef4ff] p-[22px]">
              <p className="inline-flex items-center gap-2 text-[13px] text-[#1469e1] [&_svg]:text-blue-600"><Info size={14} /> Submitted bookings will be sent as Pending for approval.</p>
              <button
                type="submit"
                className="min-h-12 cursor-pointer rounded-2xl border-none bg-[#1b80f5] px-7 py-3.5 text-[15px] font-bold text-white hover:bg-[#1469e1] disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)_brightness(0.9)]"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
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
          © 2026 Visal Vehicle System. All rights reserved. | Vaarde Consult Ltd.
        </footer>
      </main>
    </div>
  );
}

export default Booking;
