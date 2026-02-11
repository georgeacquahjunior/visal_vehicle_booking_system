import React, { useState } from "react";
import "./Booking.css";
import { timeWindowValidation } from "../../utils/bookings";
import BookingModal from "../../components/bookingModal/BookingModal";


function Booking() {
  const today = new Date().toISOString().split("T")[0];

  const [bookingDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("Client Meeting");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to format full date
  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

    const user_id = Number(localStorage.getItem("staff_id"));

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/bookings/create_booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
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
        setPurpose("Client Meeting");
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
          <section>
            <h3>Schedule</h3>
            <div className="grid-3">
              <div>
                <label>Booking Date</label>
                <input type="text" value={formatFullDate(bookingDate)} readOnly />
                <p><i className="fa-solid fa-circle-info"></i> automatically selected date</p>
              </div>

              <div>
                <label>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <p><i className="fa-solid fa-circle-info"></i> start time is 09:00 AM by default</p>
              </div>

              <div>
                <label>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
                <p><i className="fa-solid fa-circle-info"></i> end time is 4:00 PM by default</p>
              </div>
            </div>
          </section>

          <section>
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
                  <option>Client Meeting</option>
                  <option>Site Visit</option>
                  <option>Official Duty</option>
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
