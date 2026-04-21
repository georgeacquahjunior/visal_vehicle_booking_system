// Frontend configuration
// Uses environment variable VITE_API_BASE, falls back to local development URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

// Time window constants for bookings
export const MIN_TIME = "06:00";
export const MAX_TIME = "18:00";


// Debug: log which API base is being used
if (import.meta.env.DEV) {
  console.log('Using API_BASE_URL:', API_BASE_URL);
}