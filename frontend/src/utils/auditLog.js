import { API_BASE_URL } from '../config.js';

export const fetchAuditLog = async ({ action = 'all', page = 1, pageSize = 25 } = {}) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (action && action !== 'all') params.set('action', action);

  const res = await fetch(`${API_BASE_URL}/audit-log?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Server responded ${res.status}`);
  }

  return res.json();
};
