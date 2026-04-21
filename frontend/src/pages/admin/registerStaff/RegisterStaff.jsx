import React, { useState } from "react";
import "./RegisterStaff.css";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  Building,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { API_BASE_URL } from "../../../config.js";

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
  const [statusModal, setStatusModal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusModal(null);

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusModal({
          type: 'error',
          title: 'Registration failed',
          message: data.error || 'Unable to register staff. Please try again.',
        });
      } else {
        setStatusModal({
          type: 'success',
          title: 'Staff Registered',
          message: data.message || 'A new staff account has been created successfully.',
        });
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
      setStatusModal({
        type: 'error',
        title: 'Network error',
        message: 'Unable to connect. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-staff">
      {statusModal && (
        <div className="status-modal-overlay" onClick={() => setStatusModal(null)}>
          <div
            className={`status-modal ${statusModal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="status-modal-icon">
              {statusModal.type === 'success' ? (
                <CheckCircle2 size={30} color="#10b981" />
              ) : (
                <AlertCircle size={30} color="#ef4444" />
              )}
            </div>
            <h2>{statusModal.title}</h2>
            <p>{statusModal.message}</p>
            <button className="status-modal-button" onClick={() => setStatusModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="register-hero">
        <div className="register-hero-copy">
          <div className="register-kicker">Staff Management</div>
          <h1 className="register-title">Register New Staff Member</h1>
          <p className="register-subtitle">
            Add new team members to your organization with secure account creation
            and role-based access control for efficient fleet management.
          </p>
        </div>

        <div className="register-hero-highlight">
          <div className="hero-highlight-header">
            <span className="hero-highlight-label">Account Creation</span>
            <UserPlus size={18} />
          </div>
          <strong>Secure Registration</strong>
          <p>Create staff accounts with proper authentication and authorization.</p>
          <span>Role-based access control included</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="register-main">
        <div className="register-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Account Details</p>
              <h2>Staff Information</h2>
            </div>
            <div className="panel-pill">
              <Shield size={16} />
              <span>Secure Registration</span>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <UserPlus size={20} />
                Personal Information
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Staff ID</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="staff_id"
                      placeholder="Enter staff ID (e.g., ST001)"
                      value={formData.staff_id}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="staff@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone_number"
                      placeholder="+233 50 123 4567"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="form-section">
              <h3 className="section-title">
                <Lock size={20} />
                Account Security
              </h3>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* <p className="input-hint">
                    Password must be at least 8 characters long with numbers and special characters
                  </p> */}
                </div>
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="form-section">
              <h3 className="section-title">
                <Building size={20} />
                Role & Department
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <div className="input-wrapper">
                    <Building size={18} className="input-icon" />
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g., Operations, IT, HR"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="input-wrapper">
                    <Shield size={18} className="input-icon" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rs-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Register Staff Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}