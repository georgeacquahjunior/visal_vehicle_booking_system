import React, { useState } from "react";
import "./Login.css";
import logo from '../../assets/visal_logo.webp';
import arrow_forward from '../../assets/arrow_forward.svg';
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";

function Login() {
  const navigate = useNavigate();


  // Form state
  const [staff_id, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_id,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
    } else {
      console.log("Login success:", data);

      localStorage.setItem("staff_id", data.staff_id);
      localStorage.setItem("role", data.role);

      //Role-based navigation
      if (data.role === "admin") {
        navigate("/admin_dashboard");
      } else {
        navigate("/booking");
      }
    }
  } catch (err) {
    console.error("Error logging in:", err);
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="login-wrapper">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="logo-box">
            <img src={logo} alt="visal logo" />
          </div>
          <h1>VISAL VEHICLE BOOKING</h1>
          <p>Please enter your details to sign in to vehicle booking portal.</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff/Admin ID</label>
            <input
              type="text"
              placeholder="101"
              value={staff_id}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}{" "}
            <img src={arrow_forward} alt="arrow forward" />
          </button>
        </form>

        <Footer />
        
      </div>
    </main>
  );
}

export default Login;
