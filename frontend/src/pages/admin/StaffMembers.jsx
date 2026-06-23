import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, UserRoundCheck, UserRoundX, UsersRound } from "lucide-react";
import { API_BASE_URL } from "../../config.js";

const PAGE_SIZE = 10;

function StaffMembers() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStaff = async () => {
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

    fetchStaff();
  }, []);

  const stats = useMemo(() => {
    const admins = staff.filter((member) => member.role === "admin").length;
    const staffMembers = staff.length - admins;
    const active = staff.filter((member) => member.status === "active").length;
    const inactive = staff.filter((member) => member.status !== "active").length;
    return { active, admins, inactive, staffMembers };
  }, [staff]);

  const totalPages = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedStaff = staff.slice(pageStart, pageStart + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

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

  return (
    <div className="text-[#11233f]">
      <section className="flex flex-col items-stretch justify-between gap-5 rounded-[28px] border border-slate-200 bg-white bg-[radial-gradient(circle_at_top_right,rgba(36,114,205,0.18),transparent_32%)] p-7 lg:flex-row">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Directory</div>
          <h1 className="my-2.5 text-3xl font-bold leading-tight text-[#11233f]">Staff Members</h1>
          <p className="max-w-[62ch] text-[15px] leading-7 text-slate-600">
            Review active accounts, role assignments, and contact details for the vehicle booking workspace.
          </p>
        </div>

        <div className="flex min-w-[210px] items-center gap-3.5 rounded-[22px] bg-gradient-to-br from-[#113f82] to-[#1d62bf] p-[18px] text-white">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/15">
            <UsersRound size={22} />
          </div>
          <div>
            <strong className="block text-3xl leading-none">{staff.length}</strong>
            <span className="mt-1 block text-[13px] text-white/80">Total accounts</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="flex items-center gap-3.5 rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <UserRoundCheck size={20} />
          </div>
          <div>
            <strong className="block text-3xl leading-none">{stats.staffMembers}</strong>
            <span className="mt-1 block text-[13px] text-slate-600">Staff accounts</span>
          </div>
        </article>

        <article className="flex items-center gap-3.5 rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong className="block text-3xl leading-none">{stats.admins}</strong>
            <span className="mt-1 block text-[13px] text-slate-600">Admin accounts</span>
          </div>
        </article>

        <article className="flex items-center gap-3.5 rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRoundCheck size={20} />
          </div>
          <div>
            <strong className="block text-3xl leading-none">{stats.active}</strong>
            <span className="mt-1 block text-[13px] text-slate-600">Active accounts</span>
          </div>
        </article>

        <article className="flex items-center gap-3.5 rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <UserRoundX size={20} />
          </div>
          <div>
            <strong className="block text-3xl leading-none">{stats.inactive}</strong>
            <span className="mt-1 block text-[13px] text-slate-600">Inactive accounts</span>
          </div>
        </article>
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
          <div className="flex min-h-[220px] items-center justify-center rounded-[22px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            Loading staff members...
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
            <table className="w-full min-w-[760px] border-collapse bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Staff ID</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Email</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Role</th>
                  <th className="border-b border-slate-200 px-4 py-[18px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStaff.map((member) => (
                  <tr key={member.id}>
                    <td className="border-b border-slate-100 px-4 py-[18px] text-sm text-slate-600">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d62bf] to-[#113f82] font-bold text-white">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {staff.length > PAGE_SIZE && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
            <span className="text-sm font-medium text-slate-500">
              Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, staff.length)} of {staff.length}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <PaginationButton disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                <ChevronLeft size={16} />
              </PaginationButton>
              {pageNumbers.map((page) => (
                <PaginationButton key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                  {page}
                </PaginationButton>
              ))}
              <PaginationButton disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                <ChevronRight size={16} />
              </PaginationButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function PaginationButton({ active = false, children, disabled = false, onClick }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors ${
        active
          ? "border-[#1469e1] bg-[#1469e1] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default StaffMembers;
