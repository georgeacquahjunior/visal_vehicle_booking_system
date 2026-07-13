import React, { useState, useEffect, useRef } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/notifications';

const TYPE_INDICATOR_CLASS = {
  approved: 'bg-emerald-500',
  declined: 'bg-red-500',
  submitted: 'bg-blue-500',
  cancelled: 'bg-amber-500',
  info: 'bg-gray-500',
};

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // load on mount, only if we have a token
    if (localStorage.getItem('access_token')) {
      load();
    }
  }, []);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('failed to load notifications', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const statusLabel = (type) => {
    if (!type) return 'Info';
    return type
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) {
      markAllNotificationsRead().catch(console.error);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  // close when clicking outside
  useEffect(() => {
    const listener = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button className="relative rounded-lg p-2 text-[1.4rem] text-gray-500 transition-all hover:bg-black/5 hover:text-gray-700" onClick={handleToggle} aria-label="Notifications">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.65rem] font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[120%] z-[1000] w-[380px] max-h-[480px] animate-slideDown overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 text-[0.95rem] font-semibold text-gray-900">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button
                className="rounded-md bg-transparent px-2 py-1 text-[0.8rem] font-medium text-blue-500 transition-all hover:bg-blue-500/10 hover:text-blue-600"
                onClick={() => {
                  markAllNotificationsRead().catch(console.error);
                  setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-5 py-10 text-center text-gray-400">
                <i className="fas fa-bell-slash mb-3 block text-[2rem] text-gray-300"></i>
                <p className="m-0 text-[0.9rem] font-medium">No notifications yet</p>
              </div>
            )}

            {notifications.map((n) => {
              const type = n.type || 'info';
              return (
                <div
                  key={n.id}
                  className={`border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 ${n.is_read ? '' : 'border-l-[3px] border-l-blue-500 bg-white'}`}
                >
                  <div className="flex flex-col gap-2 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_INDICATOR_CLASS[type] || TYPE_INDICATOR_CLASS.info}`} />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className={`text-[0.9rem] leading-tight text-gray-900 ${n.is_read ? 'font-semibold' : 'font-bold'}`}>
                          {n.title || statusLabel(type)}
                        </div>
                        <div className="text-[0.75rem] font-medium text-gray-400">{formatNotificationTime(n.created_at)}</div>
                      </div>
                    </div>
                    <p className="m-0 line-clamp-2 text-[0.85rem] leading-relaxed text-gray-500">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
