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

export const updateStaffDetails = async (staffId, details) => {
  const res = await fetch(`${API_BASE_URL}/auth/users/${staffId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(details),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to update staff member (${res.status})`);
  }

  return true;
};

export const updateStaffStatus = async (staffId, status) => {
  const res = await fetch(`${API_BASE_URL}/auth/users/${staffId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to update account status (${res.status})`);
  }

  return true;
};
