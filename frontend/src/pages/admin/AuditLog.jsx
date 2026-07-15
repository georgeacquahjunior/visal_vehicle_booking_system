import React, { useEffect, useState } from "react";
import {
  CalendarPlus,
  CheckCheck,
  CheckCircle2,
  Filter,
  LogIn,
  LogOut,
  Megaphone,
  MessageSquarePlus,
  Reply,
  ScrollText,
  Settings as SettingsIcon,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react";
import { fetchAuditLog } from "../../utils/auditLog.js";
import { colorForName } from "../../utils/avatar.js";
import InfoButton from "../../components/InfoButton";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import useGreeting from "../../hooks/useGreeting.js";

const PAGE_SIZE = 10;

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "staff_registered", label: "Staff registered" },
  { value: "staff_updated", label: "Staff updated" },
  { value: "staff_activated", label: "Staff activated" },
  { value: "staff_deactivated", label: "Staff deactivated" },
  { value: "booking_created", label: "Booking created" },
  { value: "booking_approved", label: "Booking approved" },
  { value: "booking_declined", label: "Booking declined" },
  { value: "settings_updated", label: "Settings updated" },
  { value: "support_message_created", label: "Support message sent" },
  { value: "support_message_replied", label: "Support message replied" },
  { value: "support_message_resolved", label: "Support message resolved" },
  { value: "broadcast_email_sent", label: "Broadcast email sent" },
];

const ACTION_META = {
  login: { icon: LogIn, class: "bg-blue-50 text-blue-700" },
  logout: { icon: LogOut, class: "bg-slate-100 text-slate-600" },
  staff_registered: { icon: UserPlus, class: "bg-indigo-50 text-indigo-700" },
  staff_updated: { icon: UserCog, class: "bg-amber-50 text-amber-700" },
  staff_activated: { icon: UserCheck, class: "bg-emerald-50 text-emerald-700" },
  staff_deactivated: { icon: UserX, class: "bg-rose-50 text-rose-700" },
  booking_created: { icon: CalendarPlus, class: "bg-cyan-50 text-cyan-700" },
  booking_approved: { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700" },
  booking_declined: { icon: XCircle, class: "bg-rose-50 text-rose-700" },
  settings_updated: { icon: SettingsIcon, class: "bg-violet-50 text-violet-700" },
  support_message_created: { icon: MessageSquarePlus, class: "bg-purple-50 text-purple-700" },
  support_message_replied: { icon: Reply, class: "bg-fuchsia-50 text-fuchsia-700" },
  support_message_resolved: { icon: CheckCheck, class: "bg-teal-50 text-teal-700" },
  broadcast_email_sent: { icon: Megaphone, class: "bg-sky-50 text-sky-700" },
};

const DEFAULT_META = { icon: ScrollText, class: "bg-slate-100 text-slate-600" };

function actionLabel(action) {
  const match = ACTION_OPTIONS.find((option) => option.value === action);
  if (match) return match.label;
  if (!action) return "Unknown";
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDatePart(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTimePart(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function nameInitials(value) {
  if (!value) return "?";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAuditLog({ action: actionFilter, page: currentPage, pageSize: PAGE_SIZE });
        if (cancelled) return;
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(data.total || 0);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load audit log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [actionFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter]);

  const { todayLabel } = useGreeting();

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <ScrollText size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Audit log</h1>
            <InfoButton text="A record of every logged action across the system — logins, staff registration, and booking approvals/declines/creations." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <ScrollText size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ScrollText size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{total}</strong>
              <span className="text-[#7b8ba5]"> recorded event{total === 1 ? "" : "s"}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="mb-[18px] flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Activity trail</p>
            <h2 className="mt-1.5 text-[1.4rem] font-bold text-[#11233f]">Recorded actions</h2>
          </div>
          <div className="relative">
            <Filter size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-600 outline-none focus:border-[#1469e1]"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[22px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            <Spinner />
            <span>Loading audit log...</span>
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[22px] bg-rose-50 p-5 text-center text-rose-700">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[22px] bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            No recorded actions match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[22px] border border-slate-200">
            <table className="w-full min-w-[820px] table-fixed border-collapse bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[16%] border-b border-slate-200 px-4 py-[16px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">When</th>
                  <th className="w-[22%] border-b border-slate-200 px-4 py-[16px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Actor</th>
                  <th className="w-[20%] border-b border-slate-200 px-4 py-[16px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Action</th>
                  <th className="w-[42%] border-b border-slate-200 px-4 py-[16px] text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((entry) => {
                  const meta = ACTION_META[entry.action] || DEFAULT_META;
                  const Icon = meta.icon;
                  const actorLabel = entry.actor_name || entry.actor_id || "System";

                  return (
                    <tr key={entry.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="px-4 py-[14px] align-middle">
                        <div className="font-semibold text-[#11233f]">{formatDatePart(entry.created_at)}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{formatTimePart(entry.created_at)}</div>
                      </td>
                      <td className="px-4 py-[14px] align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: colorForName(actorLabel) }}
                          >
                            {nameInitials(actorLabel)}
                          </div>
                          <span className="truncate text-sm font-semibold text-[#11233f]">{actorLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-[14px] align-middle">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize tracking-wide ${meta.class}`}>
                          <Icon size={13} />
                          {actionLabel(entry.action)}
                        </span>
                      </td>
                      <td className="px-4 py-[14px] align-middle text-sm text-slate-600">
                        <span className="line-clamp-2" title={entry.description || undefined}>
                          {entry.description || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={total} />
      </section>
    </div>
  );
}

export default AuditLog;
