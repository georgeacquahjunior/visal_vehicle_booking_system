import React, { useEffect, useState } from "react";
import { KeyRound, Lock, Mail, ShieldCheck, User as UserIcon, UserCog } from "lucide-react";
import { changeMyPassword, fetchMyProfile, updateMyProfile } from "../utils/account.js";
import { colorForName, letterFor } from "../utils/avatar.js";
import InfoButton from "../components/InfoButton";
import Spinner from "../components/Spinner";
import useGreeting from "../hooks/useGreeting.js";
import { showToast } from "../utils/toast.js";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#11233f] outline-none focus:border-[#1469e1]";
const labelClass = "mb-2 block text-sm font-bold text-[#11233f]";

function MyAccount() {
  const { greeting, todayLabel } = useGreeting();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone_number: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setProfileForm({ full_name: data.full_name || "", phone_number: data.phone_number || "" });
    } catch (err) {
      showToast(err.message || "Failed to load your profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm.full_name.trim()) return;

    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        full_name: profileForm.full_name.trim(),
        phone_number: profileForm.phone_number.trim() || null,
      });
      setProfile(updated);
      localStorage.setItem("full_name", updated.full_name);
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (new_password !== confirm_password) {
      showToast("New password and confirmation don't match.", "error");
      return;
    }
    if (new_password.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await changeMyPassword({ current_password, new_password });
      showToast("Password updated.", "success");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = profile?.full_name || localStorage.getItem("full_name") || "there";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <UserCog size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <p className="m-0 text-lg font-semibold text-[#6b7f9e]">{greeting}, {firstName} 👋</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">My Account</h1>
            <InfoButton text="Update your contact details and change your password." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: `linear-gradient(145deg, ${colorForName(displayName)}, ${colorForName(displayName)}cc)` }}
          >
            {letterFor(displayName) || "U"}
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] font-bold text-[#11233f]">{displayName}</p>
            <p className="m-0 truncate text-xs capitalize text-[#7b8ba5]">{profile?.role || "staff"}</p>
          </div>
        </div>
      </section>

      {loading && !profile ? (
        <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
          <Spinner />
          <span>Loading your account...</span>
        </div>
      ) : (
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UserIcon size={18} />
              </div>
              <h2 className="m-0 text-xl font-bold text-[#11233f]">Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <label className="block">
                <span className={labelClass}>Full name</span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  className={fieldClass}
                  value={profileForm.full_name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Phone number</span>
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Not set"
                  className={fieldClass}
                  value={profileForm.phone_number}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone_number: event.target.value }))}
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border-none bg-[#1469e1] px-6 text-sm font-bold text-white hover:bg-[#115cc7] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={savingProfile || loading}
                >
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 opacity-60">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <KeyRound size={18} />
              </div>
              <h2 className="m-0 text-xl font-bold text-[#11233f]">Change password</h2>
            </div>

            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              Password changes are temporarily unavailable.
            </p>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <fieldset disabled className="contents">
                <label className="block">
                  <span className={labelClass}>Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className={`${fieldClass} cursor-not-allowed`}
                    value={passwordForm.current_password}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelClass}>New password</span>
                    <input
                      type="password"
                      minLength={8}
                      autoComplete="new-password"
                      className={`${fieldClass} cursor-not-allowed`}
                      value={passwordForm.new_password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Confirm new password</span>
                    <input
                      type="password"
                      minLength={8}
                      autoComplete="new-password"
                      className={`${fieldClass} cursor-not-allowed`}
                      value={passwordForm.confirm_password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
                    />
                  </label>
                </div>

                <span className="text-xs text-slate-400">Use at least 8 characters.</span>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl border-none bg-[#1469e1] px-6 text-sm font-bold text-white opacity-60"
                  >
                    Update password
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        </div>

        <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <ShieldCheck size={18} />
            </div>
            <h2 className="m-0 text-xl font-bold text-[#11233f]">Account details</h2>
          </div>

          <p className="m-0 mb-4 text-xs text-slate-400">These are managed by an admin and can't be changed here.</p>

          <dl className="divide-y divide-slate-100">
            <ReadOnlyRow icon={UserCog} label="Staff ID" value={profile?.staff_id} />
            <ReadOnlyRow icon={Mail} label="Email" value={profile?.email} />
            <ReadOnlyRow icon={ShieldCheck} label="Department" value={profile?.department} />
            <ReadOnlyRow icon={Lock} label="Role" value={profile?.role} capitalize />
          </dl>
        </section>
      </div>
      )}
    </div>
  );
}

function ReadOnlyRow({ icon: Icon, label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} className="shrink-0 text-slate-400" />
        {label}
      </dt>
      <dd className={`m-0 truncate text-right text-sm font-semibold text-[#11233f] ${capitalize ? "capitalize" : ""}`}>{value || "N/A"}</dd>
    </div>
  );
}

export default MyAccount;
