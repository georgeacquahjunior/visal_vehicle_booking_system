import React, { useState } from "react";
import "./Booking.css";
import { timeWindowValidation } from "../../utils/bookings";
import BookingModal from "../../components/bookingModal/BookingModal";


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

    const user_id = Number(localStorage.getItem("staff_id"));
    if (!user_id) return "You must be logged in to create a booking";

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
        "http://127.0.0.1:5000/bookings/create_booking",
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

      if (!response.ok) {
        setError(data.error || "Failed to create booking");
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
      <main className="main">
        <header className="booking-header" >
          <h1>New Booking Request</h1>
          <p>Fill in the details below to request a vehicle.</p>
        </header>

        <form className="card" onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Schedule</h3>
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
                <p><i className="fa-solid fa-circle-info"></i> select your booking date</p>
              </div>

              <div>
                <label>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <p><i className="fa-solid fa-circle-info"></i> booking starts at 09:00 AM</p>
              </div>

              <div>
                <label>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
                <p><i className="fa-solid fa-circle-info"></i>booking ends at 4:00 PM</p>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Trip Details</h3>
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
                  <option>
                    Insurance Company Visit - Outstanding Claim Follow-Up
                  </option>
                  <option>Reinsurance Marketing Round</option>
                  <option>
                    Bank Visit - Company Cheque Deposit/Withdrawal
                  </option>
                  <option>Reinsurance Gifts Delivery to Clients</option>
                  <option>
                    Official Document Collection/Delivery (Visal/Visal Re)
                  </option>
                  <option>
                    Corporate Event Meeting/ Representation
                  </option>
                  <option>
                    Purchase of Ordered Items/Equipment Pickup
                  </option>
                  <option>Staff airport Drop Off/Pick up</option>
                </select>
              </div>
            </div>

            <div>
              <label>Additional Notes</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>

          <div className="actions-bookings">
            <p className="booking-info"><i className="fa-solid fa-circle-info"></i>
              Submitted bookings will be sent as Pending for approval
            </p>
            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Error Modal */}
        <BookingModal
          message={error}
          onClose={() => setError("")}
          type="error"
        />

        {/* Success Modal */}
        <BookingModal
          message={success}
          onClose={() => setSuccess("")}
          type="success"
        />


        <footer className="footer">
          © 2026 Visal Vehicle System. All rights reserved. | Vaarde Consult
        </footer>
      </main>
    </div>
  );
}

export default Booking;
