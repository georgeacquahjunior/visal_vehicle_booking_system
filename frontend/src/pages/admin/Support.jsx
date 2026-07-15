 import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, LifeBuoy, MessageCircle, Reply, X } from "lucide-react";
import { fetchSupportMessages, replySupportMessage } from "../../utils/support.js";
import { colorForName } from "../../utils/avatar.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import useGreeting from "../../hooks/useGreeting.js";
import { showToast } from "../../utils/toast.js";

const PAGE_SIZE = 10;

const STATUS_BADGE_CLASS = {
  open: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

function Support() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [markResolved, setMarkResolved] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  const { todayLabel } = useGreeting();

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupportMessages({ status: statusFilter, page: currentPage, pageSize: PAGE_SIZE });
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load support messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const openCount = statusFilter === "open" ? total : messages.filter((m) => m.status === "open").length;

  const openReply = (item) => {
    setReplyTarget(item);
    setReplyText(item.admin_reply || "");
    setMarkResolved(item.status !== "resolved");
    setActionError("");
  };

  const submitReply = async () => {
    if (!replyTarget || !replyText.trim()) return;
    setProcessing(true);
    setActionError("");
    try {
      await replySupportMessage(replyTarget.id, {
        admin_reply: replyText.trim(),
        status: markResolved ? "resolved" : "open",
      });
      showToast("Reply sent.", "success");
      setReplyTarget(null);
      setReplyText("");
      loadMessages();
    } catch (err) {
      const msg = err.message || "Failed to send reply.";
      setActionError(msg);
      showToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <LifeBuoy size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Support inbox</h1>
            <InfoButton text="Messages sent in from the Help & Support page. Reply and mark them resolved." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <LifeBuoy size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock3 size={18} />
            </div>
            <p className="m-0 text-[15px] text-[#11233f]">
              <strong className="font-bold">{openCount} open</strong>
              <span className="text-[#7b8ba5]"> · {total} total message{total === 1 ? "" : "s"}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Requests</p>
            <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">Messages</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={statusFilter === "all"} label="All" onClick={() => setStatusFilter("all")} />
            <FilterButton active={statusFilter === "open"} label="Open" onClick={() => setStatusFilter("open")} />
            <FilterButton active={statusFilter === "resolved"} label="Resolved" onClick={() => setStatusFilter("resolved")} />
          </div>
        </div>

        {loading ? (
          <PanelState>Loading messages...</PanelState>
        ) : error ? (
          <PanelState error>{error}</PanelState>
        ) : messages.length === 0 ? (
          <PanelState>
            <MessageCircle size={36} />
            <span>No messages match this filter.</span>
          </PanelState>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] table-fixed border-collapse bg-white">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-[22%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Requester</th>
                    <th className="w-[30%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Subject</th>
                    <th className="w-[16%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Received</th>
                    <th className="w-[14%] border-b border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</th>
                    <th className="w-[18%] border-b border-slate-200 px-4 py-3.5 text-right text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: colorForName(item.staff_name) }}
                          >
                            {nameInitials(item.staff_name)}
                          </div>
                          <span className="truncate text-sm font-semibold text-[#11233f]">{item.staff_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="line-clamp-1 text-sm text-slate-600" title={item.subject}>{item.subject}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm text-slate-600">{formatShort(item.created_at)}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[item.status] || "bg-slate-100 text-slate-600"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                          onClick={() => openReply(item)}
                        >
                          <Reply size={14} />
                          {item.admin_reply ? "View / Edit" : "Reply"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={total} />
          </>
        )}
      </section>

      {replyTarget && (
        <Modal onClose={() => !processing && setReplyTarget(null)}>
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7f9e]">Support message</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#11233f]">{replyTarget.subject}</h2>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-[#11233f]"
                onClick={() => setReplyTarget(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
                <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  {replyTarget.staff_name} · {formatShort(replyTarget.created_at)}
                </span>
                <p className="m-0 mt-2 text-sm leading-relaxed text-slate-700">{replyTarget.message}</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#11233f]">Your reply</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write a reply..."
                  maxLength={2000}
                />
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3.5">
                <input
                  type="checkbox"
                  checked={markResolved}
                  onChange={(event) => setMarkResolved(event.target.checked)}
                  className="h-4 w-4 accent-[#1469e1]"
                />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#11233f]">
                  <CheckCircle2 size={15} className="text-emerald-600" /> Mark as resolved
                </span>
              </label>

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
                  onClick={() => setReplyTarget(null)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[#1469e1] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={submitReply}
                  disabled={processing || !replyText.trim()}
                >
                  {processing ? "Sending..." : "Send reply"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FilterButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
        active
          ? "border-[#1469e1] bg-[#1469e1] text-white"
          : "border-slate-200 bg-white text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function PanelState({ children, error = false }) {
  return (
    <div className={`flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center ${error ? "bg-rose-50 text-rose-700" : "bg-gradient-to-b from-slate-50 to-blue-50 text-slate-600"}`}>
      {children}
    </div>
  );
}

function nameInitials(value) {
  if (!value) return "?";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatShort(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default Support;
