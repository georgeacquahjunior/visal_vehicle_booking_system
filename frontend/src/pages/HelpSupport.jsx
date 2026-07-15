import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, LifeBuoy, MessageSquareReply, Send } from "lucide-react";
import { createSupportMessage, fetchSupportMessages } from "../utils/support.js";
import InfoButton from "../components/InfoButton";
import Pagination from "../components/Pagination";
import useGreeting from "../hooks/useGreeting.js";
import { showToast } from "../utils/toast.js";

const PAGE_SIZE = 6;

const STATUS_BADGE_CLASS = {
  open: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white p-[13px_16px] text-[15px] text-[#11233f] outline-none focus:border-[#1469e1]";
const labelClass = "text-sm font-bold text-[#11233f]";

function HelpSupport() {
  const { greeting, todayLabel } = useGreeting();
  const requesterName = (localStorage.getItem("full_name") || "there").split(" ")[0];

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupportMessages();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err.message || "Failed to load your messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const openCount = messages.filter((m) => m.status === "open").length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await createSupportMessage({ subject: subject.trim(), message: message.trim() });
      showToast("Your message was sent to the admin team.", "success");
      setSubject("");
      setMessage("");
      setCurrentPage(1);
      loadMessages();
    } catch (err) {
      showToast(err.message || "Failed to send message.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleMessages = messages.slice(pageStart, pageStart + PAGE_SIZE);

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
          <p className="m-0 text-lg font-semibold text-[#6b7f9e]">Here to help you, {requesterName} 👋</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Help &amp; Support</h1>
            <InfoButton text="Send a message to the admin team and track replies here." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <LifeBuoy size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock3 size={18} />
            </div>
            {openCount > 0 ? (
              <p className="m-0 text-[15px] text-[#11233f]">
                <strong className="font-bold">{openCount} open</strong>
                <span className="text-[#7b8ba5]"> · {messages.length} total message{messages.length === 1 ? "" : "s"}</span>
              </p>
            ) : (
              <p className="m-0 text-[15px] text-[#7b8ba5]">No open messages — you're all caught up.</p>
            )}
          </div>
        </div>
      </section>

      <form className="mt-5 rounded-3xl border border-slate-200 bg-white p-7" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Send size={18} />
          </div>
          <h3 className="m-0 text-xl font-bold text-[#11233f]">Send a message</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`${labelClass} mb-2 block`}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you need help with?"
              maxLength={150}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label className={`${labelClass} mb-2 block`}>Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              maxLength={2000}
              required
              className={fieldClass}
            />
            <span className="mt-1.5 block text-right text-xs text-slate-400">{message.length}/2000</span>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="min-h-12 cursor-pointer rounded-xl border-none bg-[#1469e1] px-7 py-3.5 text-[15px] font-bold text-white hover:bg-[#115cc7] disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)_brightness(0.9)]"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="m-0 mb-5 text-lg font-bold text-[#11233f]">Your messages</h2>

        {loading ? (
          <PanelState>Loading your messages...</PanelState>
        ) : error ? (
          <PanelState error>{error}</PanelState>
        ) : messages.length === 0 ? (
          <PanelState>
            <LifeBuoy size={36} />
            <span>You haven't sent any messages yet.</span>
          </PanelState>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {visibleMessages.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="m-0 text-base font-bold text-[#11233f]">{item.subject}</h3>
                      <span className="mt-1 block text-xs text-slate-400">{formatTimestamp(item.created_at)}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE_CLASS[item.status] || "bg-slate-100 text-slate-600"}`}>
                      {item.status === "resolved" ? <CheckCircle2 size={12} className="mr-1 inline" /> : null}
                      {item.status}
                    </span>
                  </div>

                  <p className="m-0 mt-3 text-sm leading-relaxed text-slate-600">{item.message}</p>

                  {item.admin_reply && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border-l-2 border-[#1469e1] bg-[#f8fbff] p-4">
                      <MessageSquareReply size={16} className="mt-0.5 shrink-0 text-[#1469e1]" />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-[0.08em] text-[#1469e1]">
                          {item.replied_by_name || "Admin"} replied
                        </span>
                        <p className="m-0 mt-1 text-sm leading-relaxed text-slate-700">{item.admin_reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={messages.length} />
          </>
        )}
      </section>
    </div>
  );
}

function PanelState({ children, error = false }) {
  return (
    <div className={`flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center ${error ? "bg-rose-50 text-rose-700" : "bg-gradient-to-b from-slate-50 to-blue-50 text-slate-600"}`}>
      {children}
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default HelpSupport;
