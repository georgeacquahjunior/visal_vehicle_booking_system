import React, { useState } from "react";
import "./RegisterStaff.css";
import BookingModal from "../../../components/bookingModal/BookingModal";

export default function RegisterStaff() {
  const [formData, setFormData] = useState({
    staff_id: "",
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    department: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("https://visal-vehicle-booking-system.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // important!
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(data.message || "Staff registered successfully!");
        setFormData({
          staff_id: "",
          full_name: "",
          email: "",
          password: "",
          phone_number: "",
          department: "",
          role: "staff",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <main className="main">
        <header className="page-header">
          <h2>Register New Staff</h2>
          <p>Create a new staff or admin account.</p>
        </header>

        <div className="card">
          <form className="form" onSubmit={handleSubmit}>
            {/* Staff ID */}
            <div className="form-group">
              <label>Staff ID</label>
              <input
                type="text"
                name="staff_id"
                placeholder="101"
                value={formData.staff_id}
                onChange={handleChange}
                required
              />
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Sarah Connor"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="sarah@fleet.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Side-by-side: Phone + Department */}
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="+233 50 123 4567"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="Operations"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Side-by-side: Role */}
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

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

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Registering..." : "Register Staff"}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
