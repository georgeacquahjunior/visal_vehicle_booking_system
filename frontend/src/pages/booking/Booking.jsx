import React from "react";
import "./Booking.css";
import logo from '../../assets/visal_logo.webp'

function Booking() {
    
    const today = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="" />
          <div>
            <h2>Visal Vehicle Booking</h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <nav className="nav">
          <a href="#" className="active">New Booking</a>
          <a href="#">View Schedule</a>
          <a href="#">My Bookings</a>
          <a href="#" className="logout">Log Out</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="header">
          <h1>New Booking Request</h1>
          <p>Fill in the details below to request a vehicle.</p>
        </header>

        <form className="card">
          <section>
            <h3>Schedule</h3>

            <div className="grid-3">
              <div>
                <label>Booking Date</label>
                <input type="date" defaultValue={today} readOnly />
                <p><i class="fa-solid fa-circle-info"></i> automatically selected date</p>
              </div>

              <div>
                <label>Start Time</label>
                <input 
                    type="time" />
              </div>

              <div>
                <label>End Time</label>
                <input type="time" />
              </div>
            </div>
          </section>

          <section>
            <h3>Trip Details</h3>

            <div className="grid-2">
              <div>
                <label>Destination</label>
                <input type="text" placeholder="Enter destination" />
              </div>

              <div>
                <label>Purpose</label>
                <select>
                  <option>Client Meeting</option>
                  <option>Site Visit</option>
                </select>
              </div>
            </div><br />

            <div>
              <label>Additional Notes</label>
              <textarea rows="3"></textarea>
            </div>
          </section>

          <div className="actions">
            <button type="button" className="cancel">Cancel</button>
            <button type="button" className="submit">Submit Request</button>
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
