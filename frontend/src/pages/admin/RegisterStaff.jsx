import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield, UserPlus } from "lucide-react";
import { API_BASE_URL } from "../../config.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import useGreeting from "../../hooks/useGreeting.js";

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

  const { todayLabel } = useGreeting();

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
        <Modal onClose={() => setStatusModal(null)}>
          <div
            className={`w-[min(96vw,420px)] rounded-3xl border bg-white p-[32px_28px] text-center shadow-[0_30px_90px_rgba(17,24,39,0.18)] ${
              statusModal.type === "success" ? "border-[rgba(31,143,99,0.2)]" : "border-[rgba(204,74,67,0.2)]"
            }`}
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
        </Modal>
      )}
      {/* Hero Section */}
      <section className="relative m-7 flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 max-[1200px]:m-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <UserPlus size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Register New Staff Member</h1>
            <InfoButton text="Add new team members to your organization with secure account creation and role-based access control for efficient fleet management." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <UserPlus size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserPlus size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">Secure registration · role-based access control</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-7 pb-7 max-[1200px]:px-6 max-[1200px]:pb-6">
        <div className="mx-auto max-w-[1000px] rounded-[28px] border border-slate-200 bg-white p-8 max-[860px]:p-6 max-[640px]:p-5">
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

          <form onSubmit={handleSubmit} data-ga-form="register_staff">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
              <InputField label="Staff ID" name="staff_id" value={formData.staff_id} onChange={handleChange} placeholder="Enter staff ID (e.g., ST001)" required />
              <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter full name" required />
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="staff@company.com" required />
              <InputField label="Phone Number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="+233 50 123 4567" />
              <InputField label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Operations, IT, HR" />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#11233f]">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={`${inputSharedClass} cursor-pointer`}>
                  <option value="staff">Staff Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  required
                >
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg border-none bg-transparent text-slate-400 transition-colors hover:text-slate-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </InputField>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6 max-sm:flex-col">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 max-sm:w-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl border-none bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full hover:bg-blue-700"
                disabled={loading}
                data-ga-button="register_staff_submit"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
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

function InputField({ children, label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={props.id || props.name} className="text-sm font-semibold text-[#11233f]">
        {label}
      </label>
      <div className="relative">
        <input id={props.id || props.name} {...props} className={inputSharedClass} />
        {children}
      </div>
    </div>
  );
}
