// Frontend configuration
// Uses environment variable VITE_API_BASE, falls back to local development URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://visal-vehicle-booking-system.onrender.com';

// Debug: log which API base is being used
if (import.meta.env.DEV) {
  console.log('Using API_BASE_URL:', API_BASE_URL);
}