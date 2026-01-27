import React, { useState } from "react";
import "./Booking.css";

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

  const validateBooking = () => {
      if (!startTime) return "Start time is required";
      if (!endTime) return "End time is required";

      if (startTime >= endTime) {
        return "End time must be after start time";
      }

      if (!location.trim()) return "Destination is required";
      if (!purpose.trim()) return "Purpose is required";

      const user_id = Number(localStorage.getItem("staff_id"));
      if (!user_id) return "You must be logged in to create a booking";

      return null; // ✅ means validation passed
};


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
      setSuccess("Booking request submitted successfully!");
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
        <header className="header">
          <h1>New Booking Request</h1>
          <p>Fill in the details below to request a vehicle.</p>
        </header>

        <form className="card" onSubmit={handleSubmit}>
          <section>
            <h3>Schedule</h3>

            <div className="grid-3">
              <div>
                <label>Booking Date</label>
                <input type="date" value={bookingDate} readOnly />
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
              </div>

              <div>
                <label>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
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
            </div><br />

            <div>
              <label>Additional Notes</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <div className="actions">
            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <footer className="footer">
          © 2026 Visal Vehicle System. All rights reserved. | Vaarde Consult
        </footer>
      </main>
    </div>
  );
}

export default Booking;
