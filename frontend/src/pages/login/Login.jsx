import React, { useState } from "react";
import logo from "../../assets/visal_logo.webp";
import bgImage from "../../assets/bus.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import { loginUser } from "../../utils/login";

function Login() {
  const navigate = useNavigate();

  const [staff_id, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(staff_id, password, setError, setLoading, navigate);
  };

  return (
    <main className="h-screen flex bg-white">

      {/* LEFT SIDE */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-md">

          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <img src={logo} alt="logo" className="h-20" />
          </div>

          <h1 className="text-3xl font-medium text-center text-[#289aff] mb-2">
            Vehicle Booking Portal
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            Sign in to manage bookings, approvals and fleet operations.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* STAFF ID */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Staff / Admin ID
              </label>
              <input
                type="text"
                placeholder="Enter Staff ID"
                value={staff_id}
                onChange={(e) => setStaffId(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#289aff] outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#289aff] outline-none"
                />

                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500`}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#289aff] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#0a7cff] disabled:bg-blue-300 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Sign In"}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6">
            <Footer />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="hidden lg:flex flex-[2] relative items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Enhanced Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
        </div>

        {/* Modern Glass Card */}
        <div className="relative z-10 w-[85%] max-w-lg p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-1xl">

          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/10">
              <i className="fas fa-car text-white text-xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-[#1b80f5] mb-3 leading-tight">
              Smart Fleet Management
            </h2>
            <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
              Streamline your vehicle booking process with our comprehensive fleet management solution designed for modern organizations.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-3 rounded-xl bg-white/3 backdrop-blur-sm border border-white/10">
              <div className="text-lg text-cyan-300 font-bold mb-1">24/7</div>
              <div className="text-xs text-white/80">Access</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-lg text-green-300 font-bold mb-1">Fast</div>
              <div className="text-xs text-white/80">Booking</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-lg text-purple-300 font-bold mb-1">Secure</div>
              <div className="text-xs text-white/80">System</div>
            </div>
          </div>

          {/* Professional Stats */}
          {/* <div className="flex justify-between items-center pt-6 border-t border-white/20">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-white/70">Active Vehicles</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-white/70">Bookings Made</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-white/70">Uptime</div>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
}

export default Login;