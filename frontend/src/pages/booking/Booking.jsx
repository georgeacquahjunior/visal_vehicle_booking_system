import React, { useState } from "react";
import "./Booking.css";
import { Info, Clock2, MapPin, ClipboardList } from "lucide-react";
import { timeWindowValidation } from "../../utils/bookings";
import BookingModal from "../../components/bookingModal/BookingModal";
import { API_BASE_URL } from "../../config.js";


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
    <div className="booking-page">
      <main className="main-booking">
        <div className="booking-top">
          <div className="booking-header">
            <div>
              <h1>New Booking Request</h1>
              <p>Fill in the details below to request a vehicle for travel, meetings, or client visits.</p>
            </div>
          </div>

          <div className="booking-summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <Clock2 size={20} />
              </div>
              <div>
                <span>Flexible schedule</span>
                <strong>Choose date and time</strong>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon accent">
                <MapPin size={20} />
              </div>
              <div>
                <span>Destination ready</span>
                <strong>Any location within city</strong>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">
                <ClipboardList size={20} />
              </div>
              <div>
                <span>Approval workflow</span>
                <strong>Pending review by admin</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-grid">
          <form className="booking-form card" onSubmit={handleSubmit}>
            <section className="form-section">
              <div className="section-header">
                <h3>Schedule</h3>
                {/* <p>Set the date and time for your travel request.</p> */}
              </div>
              <div className="grid-3">
                <div>
                  <label>Booking Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={today}
                    required
                  />
                  <p className="field-note"><Info size={14} /> Select the date for pickup.</p>
                </div>

                <div>
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <p className="field-note"><Info size={14} /> Booking starts no earlier than 06:00 AM.</p>
                </div>

                <div>
                  <label>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                  <p className="field-note"><Info size={14} /> Booking ends before 06:00 PM by default.</p>
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-header">
                <h3>Trip Details</h3>
                {/* <p>Provide the destination, purpose, and any notes for the team.</p> */}
              </div>
              <div className="grid-2">
                <div>
                  <label>Destination</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
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
                <label className="text-center mt-10">Additional Notes</label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide any additional instructions or details"
                />
              </div>
            </section>

            <div className="actions-bookings">
              <p className="booking-info"><Info size={14} /> Submitted bookings will be sent as Pending for approval.</p>
              <button type="submit" className="submit" disabled={loading}>
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

        <footer className="footer">
          © 2026 Visal Vehicle System. All rights reserved. | Vaarde Consult Ltd.
        </footer>
      </main>
    </div>
  );
}

export default Booking;
