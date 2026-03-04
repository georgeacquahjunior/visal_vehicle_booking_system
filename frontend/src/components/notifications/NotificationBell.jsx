import React, { useState, useEffect, useRef } from 'react';
import './NotificationBell.css';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../utils/notifications';

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

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) {
      // when opening we can mark all read (or lazily when user clicks each)
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
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-button" onClick={handleToggle} aria-label="Notifications">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {open && (
            <div className="notification-dropdown">
                <div className="dropdown-header">
                <span>Notifications</span>
                {notifications.length > 0 && (
                    <button
                    className="mark-all"
                    onClick={() => {
                        markAllNotificationsRead().catch(console.error);
                        setNotifications((prev) =>
                        prev.map((n) => ({ ...n, is_read: true }))
                        );
                    }}
                    >
                    Mark all as read
                    </button>
                )}
                </div>

                <div className="dropdown-body">
                {notifications.length === 0 && (
                    <div className="empty">
                    <i className="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                    </div>
                )}

                {notifications.map((n) => {
                    const type = n.type || 'info';
                    return (
                    <div
                    key={n.id}
                    className={`notification-item ${n.is_read ? "" : "unread"} ${type}`}
                    >
                    <div className={`type-indicator ${type}`}></div>
                        <div className="content">
                            {n.title && <div className="title">{n.title}</div>}
                            <div className="message">{n.message}</div>
                            <div className="time">{new Date(n.created_at).toLocaleString()}</div>
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