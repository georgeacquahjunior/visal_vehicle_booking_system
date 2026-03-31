
// Time Window Validation

export const MIN_TIME = "06:00";
export const MAX_TIME = "18:00";

export function timeWindowValidation(startTime, endTime){
    /**
     * Validates if a time range is within working hours
     * @param {string} startTime - "HH:MM"
     * @param {string} endTime - "HH:MM"
     * @param {string} MIN_TIME - default "06:00"
     * @param {string} MAX_TIME - default "18:00"
     * @returns {string|null} Error message or null if valid
     */

    if(!startTime || !endTime){
        return "Booking duration is required";
    }

    if (startTime >= endTime){
        return "Booking start time must be before end time";
    }

    if (startTime < MIN_TIME || startTime > MAX_TIME){
        return `Booking duration must be between 06:00 AM and 06:00 PM`;
    }

    if (endTime < MIN_TIME || endTime > MAX_TIME){
        return `Booking duration must be between 06:00 AM and 06:00 PM`;
    }

    return null;
}