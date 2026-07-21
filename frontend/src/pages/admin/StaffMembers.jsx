import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Pencil,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../../config.js";
import { colorForName } from "../../utils/avatar.js";
import { updateStaffDetails, updateStaffStatus } from "../../utils/staff.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import useGreeting from "../../hooks/useGreeting.js";
import { showToast } from "../../utils/toast.js";

const PAGE_SIZE = 10;
const ROLE_OPTIONS = ["staff", "admin"];

function StaffMembers() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const currentStaffId = localStorage.getItem("staff_id");

  const loadStaff = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const data = await res.json();
      const users = Array.isArray(data.users) ? data.users : data;

      setStaff(
        users.map((user) => ({
          id: user.staff_id,
          name: user.full_name,
          email: user.email,
          phone: user.phone_number || "",
          department: user.department || "",
          role: user.role || "staff",
          status: (user.status || "active").toString().trim().toLowerCase(),
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const stats = useMemo(() => {
    const admins = staff.filter((member) => member.role === "admin").length;
    const staffMembers = staff.length - admins;
    const active = staff.filter((member) => member.status === "active").length;
    const inactive = staff.filter((member) => member.status !== "active").length;
    return { active, admins, inactive, staffMembers };
  }, [staff]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedStaff = staff.slice(pageStart, pageStart + PAGE_SIZE);

  const nameInitials = (value) => {
    if (!value) return "U";
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const statusLabel = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusClasses = (status) =>
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  const { todayLabel } = useGreeting();

  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({
      staff_id: member.id,
      full_name: member.name,
      email: member.email,
      phone_number: member.phone,
      department: member.department,
      role: member.role,
    });
    setActionError("");
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editTarget || !editForm) return;
    setProcessingId(editTarget.id);
    setActionError("");
    try {
      const newStaffId = editForm.staff_id.trim();
      await updateStaffDetails(editTarget.id, editForm);
      setStaff((current) =>
        current.map((member) =>
          member.id === editTarget.id
            ? {
                ...member,
                id: newStaffId,
                name: editForm.full_name,
                email: editForm.email,
                phone: editForm.phone_number,
                department: editForm.department,
                role: editForm.role,
              }
            : member
        )
      );
      showToast(`${editForm.full_name}'s details were updated.`, "success");
      setEditTarget(null);
      setEditForm(null);
    } catch (err) {
      const message = err.message || "Failed to update staff member.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const openStatusConfirm = (member) => {
    setStatusTarget(member);
    setActionError("");
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "active" ? "inactive" : "active";
    setProcessingId(statusTarget.id);
    setActionError("");
    try {
      await updateStaffStatus(statusTarget.id, nextStatus);
      setStaff((current) =>
        current.map((member) => (member.id === statusTarget.id ? { ...member, status: nextStatus } : member))
      );
      showToast(
        `${statusTarget.name} was ${nextStatus === "active" ? "activated" : "deactivated"} successfully.`,
        "success"
      );
      setStatusTarget(null);
    } catch (err) {
      const message = err.message || "Failed to update account status.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <UsersRound size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Staff Members</h1>
            <InfoButton text="Review active accounts, role assignments, and contact details for the vehicle booking workspace." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <UsersRound size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UsersRound size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{staff.length}</strong>
              <span className="text-[#7b8ba5]"> total accounts</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Staff accounts" value={stats.staffMembers} detail="Standard user roles" tone="blue" />
        <MetricCard icon={ShieldCheck} label="Admin accounts" value={stats.admins} detail="Elevated privileges" tone="indigo" />
        <MetricCard icon={UserRoundCheck} label="Active accounts" value={stats.active} detail="Can sign in and book" tone="green" />
        <MetricCard icon={UserRoundX} label="Inactive accounts" value={stats.inactive} detail="Cannot sign in" tone="red" />
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="mb-[18px] flex flex-col items-start justify-between gap-4 md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Team list</p>
            <h2 className="mt-1.5 text-[1.4rem] font-bold text-[#11233f]">Account directory</h2>
          </div>
          <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2.5 text-[13px] font-bold text-slate-600">
            {staff.length} total account{staff.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[22px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            <Spinner />
            <span>Loading staff members...</span>
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[22px] bg-rose-50 p-5 text-center text-rose-700">
            {error}
          </div>
        ) : staff.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[22px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            No staff found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[22px] border border-slate-200">
            <table className="w-full min-w-[860px] border-collapse bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff ID</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Email</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Role</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-right text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStaff.map((member) => {
                  const isSelf = member.id === currentStaffId;
                  const disabled = processingId === member.id;
                  return (
                    <tr key={member.id}>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl font-bold text-white"
                            style={{ backgroundColor: colorForName(member.name) }}
                          >
                            {nameInitials(member.name)}
                          </div>
                          <div>
                            <strong className="text-base text-[#11233f]">{member.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{member.id}</td>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">{member.email}</td>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold capitalize tracking-wide text-blue-700">
                          {member.role}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold capitalize tracking-wide ${statusClasses(member.status)}`}>
                          {statusLabel(member.status)}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-[18px] text-right text-sm text-slate-600">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                            onClick={() => openEdit(member)}
                            aria-label={`Edit ${member.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-40 ${
                              member.status === "active"
                                ? "border-slate-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                                : "border-slate-200 bg-white text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            onClick={() => openStatusConfirm(member)}
                            disabled={isSelf || disabled}
                            title={isSelf ? "You cannot change your own account status" : undefined}
                            aria-label={member.status === "active" ? `Deactivate ${member.name}` : `Activate ${member.name}`}
                          >
                            {member.status === "active" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={staff.length} />
      </section>

      {editTarget && editForm && (
        <Modal onClose={() => !processingId && setEditTarget(null)}>
          <form
            onSubmit={submitEdit}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white"
            data-ga-form="edit_staff_member"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Staff account</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">Edit {editTarget.name}</h2>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]"
                onClick={() => setEditTarget(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff ID</span>
                <input
                  type="text"
                  required
                  disabled={editTarget.id === currentStaffId}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  value={editForm.staff_id}
                  onChange={(event) => setEditForm((current) => ({ ...current, staff_id: event.target.value }))}
                />
                {editTarget.id === currentStaffId && (
                  <span className="mt-1.5 block text-xs text-slate-400">You can't change your own staff ID — ask another admin.</span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Full name</span>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                  value={editForm.full_name}
                  onChange={(event) => setEditForm((current) => ({ ...current, full_name: event.target.value }))}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Email</span>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                  value={editForm.email}
                  onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Phone number</span>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                    value={editForm.phone_number}
                    onChange={(event) => setEditForm((current) => ({ ...current, phone_number: event.target.value }))}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Department</span>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                    value={editForm.department}
                    onChange={(event) => setEditForm((current) => ({ ...current, department: event.target.value }))}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Role</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm capitalize outline-none focus:border-[#1469e1]"
                  value={editForm.role}
                  onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              {actionError && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <AlertCircle size={18} />
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-6">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                onClick={() => setEditTarget(null)}
                disabled={Boolean(processingId)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#1469e1] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(processingId)}
                data-ga-button="save_staff_member_changes"
              >
                {processingId === editTarget.id ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {statusTarget && (
        <Modal onClose={() => !processingId && setStatusTarget(null)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Staff account</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">
                  {statusTarget.status === "active" ? "Deactivate" : "Activate"} account
                </h2>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]"
                onClick={() => setStatusTarget(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <p className="m-0 text-sm text-slate-600">
                {statusTarget.status === "active" ? (
                  <>
                    <strong className="text-[#11233f]">{statusTarget.name}</strong> will no longer be able to sign in until
                    their account is reactivated.
                  </>
                ) : (
                  <>
                    <strong className="text-[#11233f]">{statusTarget.name}</strong>'s account will be reactivated and they
                    will be able to sign in again.
                  </>
                )}
              </p>

              {actionError && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <AlertCircle size={18} />
                  {actionError}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setStatusTarget(null)}
                  disabled={Boolean(processingId)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`rounded-xl px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    statusTarget.status === "active" ? "bg-rose-700" : "bg-emerald-700"
                  }`}
                  onClick={confirmStatusChange}
                  disabled={Boolean(processingId)}
                  data-ga-button={statusTarget.status === "active" ? "deactivate_staff_member" : "activate_staff_member"}
                >
                  {processingId
                    ? "Processing..."
                    : statusTarget.status === "active"
                    ? "Deactivate account"
                    : "Activate account"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MetricCard({ detail, icon: Icon, label, tone, value }) {
  const toneStyles = {
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/30" },
    green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30" },
    red: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/30" },
  };
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <article className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm ${styles.border}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${styles.bg}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-4xl font-bold leading-none text-slate-800">{value}</h3>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

export default StaffMembers;
