
// Time Window Validation
import { MIN_TIME, MAX_TIME } from '../config.js';

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
        return `Booking must be done between 06:00 AM and 06:00 PM`;
    }

    if (endTime < MIN_TIME || endTime > MAX_TIME){
        return `Booking must be done between 06:00 AM and 06:00 PM`;
    }

    return null;
}