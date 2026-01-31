
// Time Window Validation

export const MIN_TIME = "09:00";
export const MAX_TIME = "16:00";

export function timeWindowValidation(startTime, endTime){
    /**
     * Validates if a time range is within working hours
     * @param {string} startTime - "HH:MM"
     * @param {string} endTime - "HH:MM"
     * @param {string} MIN_TIME - default "09:00"
     * @param {string} MAX_TIME - default "16:00"
     * @returns {string|null} Error message or null if valid
     */

    if(!startTime || !endTime){
        return "Start time and end time are required";
    }

    if (startTime >= endTime){
        return "Start time must be before end time";
    }

    if (startTime < MIN_TIME || startTime > MAX_TIME){
        return `Start time must be between 09:00 AM and 16:00 PM`;
    }

    if (endTime < MIN_TIME || endTime > MAX_TIME){
        return `End time must be between 09:00 AM and 16:00 PM`;
    }

    return null;
}