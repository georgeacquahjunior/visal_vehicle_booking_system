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

export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to load settings (${res.status})`);
  }

  const data = await res.json();
  return data.settings;
};

export const updateSettings = async (partial) => {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(partial),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to update settings (${res.status})`);
  }

  const data = await res.json();
  return data.settings;
};
