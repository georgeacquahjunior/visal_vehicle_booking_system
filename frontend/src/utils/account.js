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

export const fetchMyProfile = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to load profile (${res.status})`);
  }
  const data = await res.json();
  return data.user;
};

export const updateMyProfile = async ({ full_name, phone_number }) => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ full_name, phone_number }),
  });
  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to update profile (${res.status})`);
  }
  const data = await res.json();
  return data.user;
};

export const changeMyPassword = async ({ current_password, new_password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/me/password`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error((data && (data.error || data.message)) || `Failed to change password (${res.status})`);
  }
  return true;
};
