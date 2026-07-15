import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchSettings } from "../utils/settings.js";

export const DEFAULT_SETTINGS = {
  booking_start_time: "06:00",
  booking_end_time: "18:00",
  max_booking_duration_minutes: null,
  min_lead_time_minutes: 0,
  max_advance_days: null,
  allow_weekend_bookings: true,
  default_schedule_view: "week",
  week_start_day: "monday",
  show_current_time_indicator: true,
  email_notifications_enabled: true,
  daily_summary_enabled: true,
  daily_summary_hour: 17,
  audit_log_retention_days: null,
  require_decline_reason: true,
  org_name: "Vaarde Consult Ltd.",
  support_email: "admin@visalbrokers.com",
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refetch: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchSettings();
      setSettings((current) => ({ ...current, ...data }));
    } catch {
      // keep previous/default settings on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return React.createElement(SettingsContext.Provider, { value: { settings, loading, refetch } }, children);
}

export function useSettings() {
  return useContext(SettingsContext);
}
