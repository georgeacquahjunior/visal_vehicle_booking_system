import { API_BASE_URL } from '../config.js';

const HEARTBEAT_INTERVAL_MS = 30000;

export const sendHeartbeat = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/auth/heartbeat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn('heartbeat failed', err);
  }
};

export const fetchOnlineUsers = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return [];

  const res = await fetch(`${API_BASE_URL}/auth/online-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);

  const data = await res.json();
  return Array.isArray(data.users) ? data.users : [];
};

// Starts a heartbeat ping on an interval (plus immediately). Returns a cleanup function.
export const startHeartbeat = () => {
  sendHeartbeat();
  const id = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  return () => clearInterval(id);
};
