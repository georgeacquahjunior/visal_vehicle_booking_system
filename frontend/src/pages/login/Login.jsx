import React, { useState } from "react";
import "./Login.css";
import logo from '../../assets/visal_logo.webp';
import arrow_forward from '../../assets/arrow_forward.svg';
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import { loginUser } from "../../utils/login";

function Login() {
  const navigate = useNavigate();

  // Form state
  const [staff_id, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission using the helper
  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(staff_id, password, setError, setLoading, navigate);
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
          <p>Please enter your details to sign in to the vehicle booking portal.</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group-login">
            <label>Staff/Admin ID</label>
            <input
              type="text"
              placeholder="VISAL101"
              value={staff_id}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </div>

          <div className="form-group-login">
            <label>Password</label>
            <input
              type="password"
              placeholder="************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text-login"><i className="fa-solid fa-circle-info"></i>  {error}</p>}

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
