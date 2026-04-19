// src/api/approvals.js
import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

/* ================================
   FETCH APPROVAL BOOKINGS
================================ */
export const fetchApprovalBookings = async () => {
  const res = await fetch(`${API_BASE}/bookings/schedule_view`);
  if (!res.ok) {
    throw new Error(`Server responded ${res.status}`);
  }

  const data = await res.json();
  const remote = Array.isArray(data.bookings) ? data.bookings : [];

  // Map backend structure to frontend structure
  return remote.map((b) => ({
    id: b.booking_id,
    vehicleName: b.vehicle_name || b.vehicle || '',
    startTime: formatTime(b.start_time),
    endTime: formatTime(b.end_time),
    date: b.booking_date ? new Date(b.booking_date) : null,
    purpose: b.purpose,
    location: b.location,
    status: b.status
      ? b.status.toString().trim().toLowerCase()
      : 'pending',
    userName: b.staff_name || b.staff || 'Staff',
    userEmail: b.staff_email || '',
    userDept: b.department || '',
    notes: b.notes || '',
    submittedDate: b.created_at ? new Date(b.created_at) : null,
    approvedBy: b.approved_by || '',
    declineReason: b.decline_reason || ''
  }));
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};


/* ================================
   APPROVE BOOKING
================================ */
export const approveBookingAPI = async (bookingId) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const res = await fetch(
    `${API_BASE}/bookings/${bookingId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        admin_comment: 'Approved by admin'
      })
    }
  );

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error(
      (data && (data.error || data.message)) ||
      `Failed to approve booking (${res.status})`
    );
  }

  return true;
};


/* ================================
   DECLINE BOOKING
================================ */
export const declineBookingAPI = async (bookingId, reason) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const res = await fetch(
    `${API_BASE}/bookings/${bookingId}/decline`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        admin_comment: reason
      })
    }
  );

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error(
      (data && (data.error || data.message)) ||
      `Failed to decline booking (${res.status})`
    );
  }

  return true;
};


// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Status badge class
export const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'pending':
      return 'pending';
    case 'declined':
      return 'declined';
    default:
      return 'pending';
  }
};

// Check if booking is in the past
export const isPastBooking = (bookingDate) => {
  if (!bookingDate) return false;
  const today = new Date();
  const b = new Date(
    bookingDate.getFullYear(),
    bookingDate.getMonth(),
    bookingDate.getDate()
  );
  const t = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return b.getTime() < t.getTime();
};
