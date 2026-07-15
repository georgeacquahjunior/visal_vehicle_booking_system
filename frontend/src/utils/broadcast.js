import { API_BASE_URL } from "../config.js";

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Authentication required. Please sign in again.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const sendBroadcastEmail = async ({ subject, html_body, audience, target_staff_id, sender }) => {
  const payload = { subject, html_body, audience };
  if (target_staff_id) payload.target_staff_id = target_staff_id;
  if (sender) payload.sender = sender;

  const res = await fetch(`${API_BASE_URL}/broadcast/email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to send broadcast email (${res.status})`);
  }

  return res.json();
};

export const fetchBroadcastSenders = async () => {
  const res = await fetch(`${API_BASE_URL}/broadcast/senders`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to load sender addresses (${res.status})`);
  }

  return res.json();
};
