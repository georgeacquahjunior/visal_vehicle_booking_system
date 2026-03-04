const API_BASE = 'https://visal-vehicle-booking-system.onrender.com';

// get JWT from localStorage
const getToken = () => localStorage.getItem('access_token');

export const fetchNotifications = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch notifications');
  }
  const data = await res.json();
  return Array.isArray(data.notifications) ? data.notifications : [];
};

export const markNotificationRead = async (id) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to mark notification read');
  }
  return true;
};

export const markAllNotificationsRead = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/notifications/mark_all_read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to mark all notifications read');
  }
  return true;
};
