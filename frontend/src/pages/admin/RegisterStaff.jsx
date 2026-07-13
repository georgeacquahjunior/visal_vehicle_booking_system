import React, { useState } from "react";
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
import { API_BASE_URL } from "../../config.js";

const inputSharedClass =
  "w-full rounded-xl border border-[#ebebeb] bg-white/80 p-[14px_16px] text-sm text-[#11233f] backdrop-blur-[10px] focus:border-[#8ed4ff] focus:bg-white focus:outline-none";

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
    <div className="min-h-screen bg-[#fcfbfb] text-[#11233f]">
      {statusModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(17,24,39,0.65)] p-5" onClick={() => setStatusModal(null)}>
          <div
            className={`w-[min(96vw,420px)] rounded-3xl border bg-white p-[32px_28px] text-center shadow-[0_30px_90px_rgba(17,24,39,0.18)] ${
              statusModal.type === "success" ? "border-[rgba(31,143,99,0.2)]" : "border-[rgba(204,74,67,0.2)]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto mb-[18px] grid h-[70px] w-[70px] place-items-center rounded-full ${statusModal.type === "success" ? "bg-[rgba(31,143,99,0.12)]" : "bg-[rgba(239,68,68,0.12)]"}`}>
              {statusModal.type === 'success' ? (
                <CheckCircle2 size={30} color="#10b981" />
              ) : (
                <AlertCircle size={30} color="#ef4444" />
              )}
            </div>
            <h2 className="m-0 mb-3 text-2xl text-[#11233f]">{statusModal.title}</h2>
            <p className="m-0 mb-6 text-[0.95rem] leading-[1.7] text-[#53657f]">{statusModal.message}</p>
            <button
              className="inline-flex items-center justify-center rounded-[14px] border-none bg-gradient-to-br from-[#114a9d] to-[#1d62bf] px-6 py-3 text-[0.95rem] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,74,157,0.18)]"
              onClick={() => setStatusModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="m-7 grid grid-cols-[minmax(0,1.8fr)_minmax(280px,0.95fr)] gap-5 rounded-[28px] border border-[#bce4ff] bg-[radial-gradient(circle_at_top_right,rgba(80,133,214,0.22),transparent_28%),radial-gradient(circle_at_left_center,rgba(17,74,157,0.18),transparent_32%),#ffffff] p-7 max-[1200px]:m-6 max-[1200px]:grid-cols-1 max-[1200px]:p-6 max-[640px]:p-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Staff Management</div>
          <h1 className="mb-2.5 mt-3 max-w-[300px] text-[clamp(2rem,3vw,3rem)] leading-[1.05] text-[#11233f] max-[640px]:text-[2rem]">Register New Staff Member</h1>
          <p className="m-0 max-w-[65ch] text-[15px] leading-[1.7] text-[#53657f] max-[640px]:text-sm">
            Add new team members to your organization with secure account creation
            and role-based access control for efficient fleet management.
          </p>
        </div>

        <div className="flex min-h-[180px] flex-col justify-between gap-3 rounded-3xl bg-gradient-to-br from-[#113f82] to-[#1d62bf] p-[22px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Account Creation</span>
            <UserPlus size={18} />
          </div>
          <strong className="text-[1.45rem] font-bold">Secure Registration</strong>
          <p className="m-0 text-white/85">Create staff accounts with proper authentication and authorization.</p>
          <span className="text-white/85">Role-based access control included</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-7 pb-7 max-[1200px]:px-6 max-[1200px]:pb-6">
        <div className="mx-auto max-w-[1000px] rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-8 max-[860px]:p-6 max-[640px]:p-5">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Account Details</p>
              <h2 className="mb-0 mt-1.5 text-[1.8rem] text-[#11233f]">Staff Information</h2>
            </div>
            <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#edf4ff] px-3.5 py-2.5 text-[13px] font-semibold text-[#114a9d]">
              <Shield size={16} />
              <span>Secure Registration</span>
            </div>
          </div>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="rounded-2xl border border-[rgba(203,213,225,0.3)] bg-[rgba(241,245,249,0.5)] p-6 max-[640px]:p-5">
              <h3 className="mb-5 flex items-center gap-3 text-[1.2rem] font-semibold text-[#11233f] max-[640px]:text-[1.1rem]">
                <UserPlus size={20} />
                Personal Information
              </h3>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[860px]:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Staff ID</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="staff_id"
                      placeholder="Enter staff ID (e.g., ST001)"
                      value={formData.staff_id}
                      onChange={handleChange}
                      required
                      className={inputSharedClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Full Name</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className={inputSharedClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="pointer-events-none absolute left-3.5 z-[1] text-[#7b8ba5]" />
                    <input
                      type="email"
                      name="email"
                      placeholder="staff@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`${inputSharedClass} pl-11 pr-12`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={18} className="pointer-events-none absolute left-3.5 z-[1] text-[#7b8ba5]" />
                    <input
                      type="tel"
                      name="phone_number"
                      placeholder="+233 50 123 4567"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`${inputSharedClass} pl-11 pr-12`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="rounded-2xl border border-[rgba(203,213,225,0.3)] bg-[rgba(241,245,249,0.5)] p-6 max-[640px]:p-5">
              <h3 className="mb-5 flex items-center gap-3 text-[1.2rem] font-semibold text-[#11233f] max-[640px]:text-[1.1rem]">
                <Lock size={20} />
                Account Security
              </h3>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[860px]:grid-cols-1">
                <div className="col-span-full flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 z-[1] text-[#7b8ba5]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`${inputSharedClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 inline-flex h-[38px] w-[38px] items-center justify-center border-none bg-transparent text-[#7b8ba5] transition-all hover:-translate-y-px hover:text-[#11233f]"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="rounded-2xl border border-[rgba(203,213,225,0.3)] bg-[rgba(241,245,249,0.5)] p-6 max-[640px]:p-5">
              <h3 className="mb-5 flex items-center gap-3 text-[1.2rem] font-semibold text-[#11233f] max-[640px]:text-[1.1rem]">
                <Building size={20} />
                Role & Department
              </h3>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[860px]:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Department</label>
                  <div className="relative flex items-center">
                    <Building size={18} className="pointer-events-none absolute left-3.5 z-[1] text-[#7b8ba5]" />
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g., Operations, IT, HR"
                      value={formData.department}
                      onChange={handleChange}
                      className={`${inputSharedClass} pl-11 pr-12`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mb-1 text-sm font-semibold text-[#11233f]">Role</label>
                  <div className="relative flex items-center">
                    <Shield size={18} className="pointer-events-none absolute left-3.5 z-[1] text-[#7b8ba5]" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`${inputSharedClass} cursor-pointer pl-11`}
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="mt-8 flex justify-end gap-4 border-t border-[rgba(203,213,225,0.3)] pt-6 max-[860px]:flex-col">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(203,213,225,0.5)] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#53657f] backdrop-blur-[10px] transition-all hover:border-[#cbd5e1] hover:bg-white/95 hover:text-[#11233f] max-[860px]:w-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl border-none bg-[#289aff] px-6 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 max-[860px]:w-full [&:hover:not(:disabled)]:bg-[#1b80f5]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
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
