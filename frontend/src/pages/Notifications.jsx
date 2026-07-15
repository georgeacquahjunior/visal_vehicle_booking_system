import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, BellOff, CheckCheck, CheckCircle2, Clock3, MessageSquareReply, Send, XCircle } from "lucide-react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../utils/notifications.js";
import InfoButton from "../components/InfoButton";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import useGreeting from "../hooks/useGreeting.js";
import { showToast } from "../utils/toast.js";

const PAGE_SIZE = 10;

const TYPE_META = {
  approved: { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700" },
  declined: { icon: XCircle, class: "bg-rose-50 text-rose-700" },
  submitted: { icon: Send, class: "bg-blue-50 text-blue-700" },
  cancelled: { icon: Clock3, class: "bg-amber-50 text-amber-700" },
  support_update: { icon: MessageSquareReply, class: "bg-purple-50 text-purple-700" },
  info: { icon: Bell, class: "bg-slate-100 text-slate-600" },
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { todayLabel } = useGreeting();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications),
    [notifications, filter]
  );

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleNotifications = filteredNotifications.slice(pageStart, pageStart + PAGE_SIZE);

  const handleMarkRead = async (notification) => {
    if (notification.is_read) return;
    setNotifications((current) => current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    try {
      await markNotificationRead(notification.id);
    } catch (err) {
      showToast(err.message || "Failed to mark notification read.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      showToast(err.message || "Failed to mark all notifications read.", "error");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const typeLabel = (type) => {
    if (!type) return "Info";
    return type.toString().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[160px] flex-col justify-center gap-1 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <Bell size={150} className="absolute -bottom-8 right-6 text-blue-700/[0.05]" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#11233f]">Notifications</h1>
          <InfoButton text="Updates on your booking requests and support messages land here." />
        </div>
        <p className="relative z-10 m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filter === "all"} label="All" count={notifications.length} onClick={() => setFilter("all")} />
            <FilterButton active={filter === "unread"} label="Unread" count={unreadCount} onClick={() => setFilter("unread")} />
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            <Spinner />
            <span>Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-rose-50 p-5 text-center text-rose-700">{error}</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50 p-5 text-center text-slate-600">
            <BellOff size={40} />
            <span>{filter === "unread" ? "You're all caught up." : "No notifications yet."}</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {visibleNotifications.map((notification) => {
                const meta = TYPE_META[notification.type] || TYPE_META.info;
                const Icon = meta.icon;
                const linkTo = notification.type === "support_update" ? "/booking/help" : notification.booking_id ? "/booking/viewbookings" : null;
                const linkLabel = notification.type === "support_update" ? "View message" : "View booking";

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3.5 p-4 transition-colors hover:bg-slate-50 ${notification.is_read ? "bg-white" : "bg-blue-50/40"}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "none" }}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.class}`}>
                        <Icon size={18} />
                      </span>
                    </button>
                    <button type="button" onClick={() => handleMarkRead(notification)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <strong className={`text-sm text-[#11233f] ${notification.is_read ? "font-semibold" : "font-bold"}`}>
                          {notification.title || typeLabel(notification.type)}
                        </strong>
                        {!notification.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#1469e1]" />}
                      </div>
                      <p className="m-0 mt-1 text-sm text-slate-600">{notification.message}</p>
                      <span className="mt-1.5 block text-xs text-slate-400">{formatTime(notification.created_at)}</span>
                    </button>
                    {linkTo && (
                      <Link
                        to={linkTo}
                        className="mt-1 inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-[#1469e1] hover:text-[#115cc7]"
                      >
                        {linkLabel} <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={filteredNotifications.length} />
          </>
        )}
      </section>
    </div>
  );
}

function FilterButton({ active, count, label, onClick }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-blue-600 bg-blue-500 text-white shadow-sm"
          : "border-[rgba(15,23,42,0.12)] bg-white text-[#53657f] hover:border-[#1469e1] hover:bg-blue-50 hover:text-[#1469e1]"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={`min-w-4 rounded-lg px-1.5 py-px text-center text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-[rgba(15,23,42,0.08)] text-[#53657f]"}`}>
        {count}
      </span>
    </button>
  );
}

export default Notifications;
