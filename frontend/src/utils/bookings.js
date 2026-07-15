import { API_BASE_URL } from "../config.js";

// Cancel a booking the current staff member owns
export async function cancelBookingAPI(bookingId) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        throw new Error("Authentication required. Please sign in again.");
    }

    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }
        throw new Error((data && (data.error || data.message)) || `Failed to cancel booking (${res.status})`);
    }

    return res.json();
}

// Time Window Validation

export const MIN_TIME = "09:00";
export const MAX_TIME = "16:00";

function toMinutes(timeValue) {
    const [hours, minutes] = (timeValue || "").split(":").map(Number);
    return Number.isNaN(hours) || Number.isNaN(minutes) ? Number.POSITIVE_INFINITY : hours * 60 + minutes;
}

export function timeWindowValidation(startTime, endTime, minTime = MIN_TIME, maxTime = MAX_TIME){
    /**
     * Validates if a time range is within working hours
     * @param {string} startTime - "HH:MM"
     * @param {string} endTime - "HH:MM"
     * @param {string} minTime - default "06:00"
     * @param {string} maxTime - default "18:00"
     * @returns {string|null} Error message or null if valid
     */

    if(!startTime || !endTime){
        return "Start time and end time are required";
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const minMinutes = toMinutes(minTime);
    const maxMinutes = toMinutes(maxTime);

    if (startMinutes >= endMinutes){
        return "Start time must be before end time";
    }

    if (startMinutes < minMinutes || startMinutes > maxMinutes){
        return `Start time must be between ${minTime} and ${maxTime}`;
    }

    if (endMinutes < minMinutes || endMinutes > maxMinutes){
        return `End time must be between ${minTime} and ${maxTime}`;
    }

    return null;
}