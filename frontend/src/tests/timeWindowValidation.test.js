// timeWindowValidation.test.js

import {
  timeWindowValidation,MIN_TIME, MAX_TIME} from "../utils/bookings";

describe("timeWindowValidation", () => {

  test("returns error when start time is missing", () => {
    expect(timeWindowValidation("", "10:00"))
      .toBe("Start time and end time are required");
  });

  test("returns error when end time is missing", () => {
    expect(timeWindowValidation("09:00", ""))
      .toBe("Start time and end time are required");
  });

  test("returns error when start time is after end time", () => {
    expect(timeWindowValidation("14:00", "12:00"))
      .toBe("Start time must be before end time");
  });

  test("returns error when start time equals end time", () => {
    expect(timeWindowValidation("10:00", "10:00"))
      .toBe("Start time must be before end time");
  });

  test("returns error when start time is before working hours", () => {
    expect(timeWindowValidation("08:30", "10:00"))
      .toBe(`Start time must be between ${MIN_TIME} and ${MAX_TIME}`);
  });

  test("returns error when end time is after working hours", () => {
    expect(timeWindowValidation("15:00", "17:00"))
      .toBe(`End time must be between ${MIN_TIME} and ${MAX_TIME}`);
  });

  test("returns null for valid time window", () => {
    expect(timeWindowValidation("10:00", "15:00"))
      .toBeNull();
  });

});
