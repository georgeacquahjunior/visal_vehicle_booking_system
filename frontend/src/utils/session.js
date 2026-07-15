import { API_BASE_URL } from '../config.js';

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes
const MAX_TIMER_DELAY_MS = 30 * 60 * 1000; // re-check cap so setTimeout never gets an unbounded delay
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}

export function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('staff_id');
  localStorage.removeItem('full_name');
  localStorage.removeItem('role');
}

export async function logoutRequest() {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // best-effort — don't block logout on a network failure
  }
}

/**
 * Watches for session expiry via two independent mechanisms — whichever fires
 * first wins:
 *   1. Inactivity: no user interaction for `inactivityMs`.
 *   2. JWT expiry: the access token's own `exp` claim.
 * Returns a cleanup function to stop watching.
 */
export function startSessionWatcher(onExpire, { inactivityMs = INACTIVITY_MS } = {}) {
  let inactivityTimer = null;
  let expiryTimer = null;
  let expired = false;

  const triggerExpire = () => {
    if (expired) return;
    expired = true;
    cleanup();
    onExpire();
  };

  const resetInactivityTimer = () => {
    if (expired) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(triggerExpire, inactivityMs);
  };

  const scheduleExpiryCheck = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const expiryMs = getTokenExpiryMs(token);
    if (expiryMs === null) return;

    const msUntilExpiry = expiryMs - Date.now();
    clearTimeout(expiryTimer);

    if (msUntilExpiry <= 0) {
      triggerExpire();
      return;
    }

    const delay = Math.min(msUntilExpiry, MAX_TIMER_DELAY_MS);
    expiryTimer = setTimeout(scheduleExpiryCheck, delay);
  };

  const cleanup = () => {
    clearTimeout(inactivityTimer);
    clearTimeout(expiryTimer);
    ACTIVITY_EVENTS.forEach((event) => document.removeEventListener(event, resetInactivityTimer));
  };

  ACTIVITY_EVENTS.forEach((event) => document.addEventListener(event, resetInactivityTimer));
  resetInactivityTimer();
  scheduleExpiryCheck();

  return cleanup;
}
