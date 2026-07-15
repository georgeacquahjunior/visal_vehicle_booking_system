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

export const createSupportMessage = async ({ subject, message }) => {
  const res = await fetch(`${API_BASE_URL}/support`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ subject, message }),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to send message (${res.status})`);
  }

  const data = await res.json();
  return data.message;
};

export const fetchSupportMessages = async ({ status, page, pageSize } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (page) params.set("page", page);
  if (pageSize) params.set("page_size", pageSize);

  const res = await fetch(`${API_BASE_URL}/support?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to load messages (${res.status})`);
  }

  return res.json();
};

export const replySupportMessage = async (id, { admin_reply, status }) => {
  const payload = {};
  if (admin_reply !== undefined) payload.admin_reply = admin_reply;
  if (status !== undefined) payload.status = status;

  const res = await fetch(`${API_BASE_URL}/support/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to update message (${res.status})`);
  }

  const data = await res.json();
  return data.message;
};
