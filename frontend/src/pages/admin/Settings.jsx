import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CalendarRange,
  Palette,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import InfoButton from "../../components/InfoButton";
import Spinner from "../../components/Spinner";
import { useSettings } from "../../hooks/useSettings.js";
import { updateSettings } from "../../utils/settings.js";
import { showToast } from "../../utils/toast.js";

const SCHEDULE_VIEW_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "list", label: "List" },
];

const TABS = [
  { value: "booking", label: "Booking rules", icon: CalendarClock, Component: BookingRulesSection },
  { value: "schedule", label: "Schedule view", icon: CalendarRange, Component: ScheduleDefaultsSection },
  { value: "notifications", label: "Notifications", icon: Bell, Component: NotificationsSection },
  { value: "audit", label: "Audit log", icon: ScrollText, Component: AuditRetentionSection },
  { value: "approval", label: "Approvals", icon: ShieldCheck, Component: ApprovalWorkflowSection },
  { value: "branding", label: "Branding", icon: Palette, Component: BrandingSection },
];

function Settings() {
  const { settings, loading, refetch } = useSettings();
  const [activeTab, setActiveTab] = useState("booking");

  const ActiveComponent = TABS.find((tab) => tab.value === activeTab)?.Component || BookingRulesSection;

  return (
    <div className="text-[#11233f]">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#11233f]">Settings</h1>
        <InfoButton text="Configure booking rules, schedule defaults, notifications, and workspace branding." />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === value ? "bg-[#1469e1] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-sm font-medium text-slate-500">
          <Spinner />
          <span>Loading settings...</span>
        </div>
      ) : (
        <div className="mt-5">
          <ActiveComponent settings={settings} refetch={refetch} />
        </div>
      )}
    </div>
  );
}

function SettingsSection({ children, formName, onSubmit, saving, subtitle, title }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <form onSubmit={onSubmit} data-ga-form={`settings_${formName}`}>
        <div className="mb-5">
          <h2 className="m-0 text-lg font-bold text-[#11233f]">{title}</h2>
          <p className="m-0 mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>

        {children}

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="rounded-xl bg-[#1469e1] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#115cc7] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            data-ga-button={`save_settings_${formName}`}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ children, hint, label }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, disabled = false, label, onChange }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 ${disabled ? "opacity-60" : ""}`}>
      <span className="text-sm font-semibold text-[#11233f]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1469e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
          checked ? "justify-end bg-[#1469e1]" : "justify-start bg-slate-300"
        }`}
      >
        <span className="block h-5 w-5 rounded-full bg-white shadow transition-transform" />
      </button>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1469e1]";

function BookingRulesSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        booking_start_time: form.booking_start_time,
        booking_end_time: form.booking_end_time,
        max_booking_duration_minutes: form.max_booking_duration_minutes === "" ? null : Number(form.max_booking_duration_minutes),
        min_lead_time_minutes: Number(form.min_lead_time_minutes) || 0,
        max_advance_days: form.max_advance_days === "" ? null : Number(form.max_advance_days),
        allow_weekend_bookings: form.allow_weekend_bookings,
      });
      await refetch();
      showToast("Booking rules updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update booking rules.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      icon={CalendarClock}
      formName="booking_rules"
      onSubmit={handleSubmit}
      saving={saving}
      subtitle="Control when and how far ahead staff can book a vehicle"
      title="Booking rules"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Booking start time">
          <input type="time" className={inputClass} value={form.booking_start_time} onChange={(e) => setForm((f) => ({ ...f, booking_start_time: e.target.value }))} />
        </Field>
        <Field label="Booking end time">
          <input type="time" className={inputClass} value={form.booking_end_time} onChange={(e) => setForm((f) => ({ ...f, booking_end_time: e.target.value }))} />
        </Field>
        <Field hint="Leave blank for no cap" label="Max booking duration (minutes)">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.max_booking_duration_minutes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, max_booking_duration_minutes: e.target.value }))}
          />
        </Field>
        <Field hint="Minimum advance notice required" label="Lead time (minutes)">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.min_lead_time_minutes ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, min_lead_time_minutes: e.target.value }))}
          />
        </Field>
        <Field hint="Leave blank for no limit" label="Max advance booking (days)">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.max_advance_days ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, max_advance_days: e.target.value }))}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Toggle
          label="Allow weekend bookings"
          checked={Boolean(form.allow_weekend_bookings)}
          onChange={(value) => setForm((f) => ({ ...f, allow_weekend_bookings: value }))}
        />
      </div>
    </SettingsSection>
  );
}

function ScheduleDefaultsSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        default_schedule_view: form.default_schedule_view,
        week_start_day: form.week_start_day,
        show_current_time_indicator: form.show_current_time_indicator,
      });
      await refetch();
      showToast("Schedule view defaults updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update schedule defaults.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      icon={CalendarRange}
      formName="schedule_defaults"
      onSubmit={handleSubmit}
      saving={saving}
      subtitle="Choose how the Schedule page opens for staff and admins"
      title="Schedule view defaults"
    >
      <Field label="Default view">
        <div className="flex flex-wrap gap-2">
          {SCHEDULE_VIEW_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, default_schedule_view: value }))}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                form.default_schedule_view === value
                  ? "border-[#1469e1] bg-[#1469e1] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-4">
        <Field label="Week starts on">
          <div className="flex gap-2">
            {[{ value: "monday", label: "Monday" }, { value: "sunday", label: "Sunday" }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, week_start_day: value }))}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                  form.week_start_day === value
                    ? "border-[#1469e1] bg-[#1469e1] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Toggle
          label='Show the "now" line on Week/Day views'
          checked={Boolean(form.show_current_time_indicator)}
          onChange={(value) => setForm((f) => ({ ...f, show_current_time_indicator: value }))}
        />
      </div>
    </SettingsSection>
  );
}

function NotificationsSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        email_notifications_enabled: form.email_notifications_enabled,
        daily_summary_enabled: form.daily_summary_enabled,
        daily_summary_hour: Number(form.daily_summary_hour),
      });
      await refetch();
      showToast("Notification settings updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update notification settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection icon={Bell} formName="notifications" onSubmit={handleSubmit} saving={saving} subtitle="Control outbound email and the daily booking summary" title="Notifications">
      <div className="flex flex-col gap-3">
        <Toggle
          label="Enable email notifications"
          checked={Boolean(form.email_notifications_enabled)}
          onChange={(value) => setForm((f) => ({ ...f, email_notifications_enabled: value }))}
        />
        <Toggle
          label="Send daily booking summary to admins"
          checked={Boolean(form.daily_summary_enabled)}
          onChange={(value) => setForm((f) => ({ ...f, daily_summary_enabled: value }))}
        />
      </div>

      <div className="mt-4 max-w-xs">
        <Field label="Daily summary send hour">
          <select
            className={inputClass}
            value={form.daily_summary_hour ?? 17}
            disabled={!form.daily_summary_enabled}
            onChange={(e) => setForm((f) => ({ ...f, daily_summary_hour: e.target.value }))}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </SettingsSection>
  );
}

function AuditRetentionSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        audit_log_retention_days: form.audit_log_retention_days === "" ? null : Number(form.audit_log_retention_days),
      });
      await refetch();
      showToast("Audit log retention updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update audit log retention.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection icon={ScrollText} formName="audit_retention" onSubmit={handleSubmit} saving={saving} subtitle="How long audit log entries are kept" title="Audit log retention">
      <Field hint="Leave blank to keep logs forever" label="Retention period (days)">
        <input
          type="number"
          min="0"
          className={inputClass}
          value={form.audit_log_retention_days ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, audit_log_retention_days: e.target.value }))}
        />
      </Field>
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        Not yet automatically enforced — logs are not currently deleted based on this value.
      </div>
    </SettingsSection>
  );
}

function ApprovalWorkflowSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ require_decline_reason: form.require_decline_reason });
      await refetch();
      showToast("Approval workflow settings updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update approval workflow settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection icon={ShieldCheck} formName="approval_workflow" onSubmit={handleSubmit} saving={saving} subtitle="Rules admins must follow when reviewing booking requests" title="Approval workflow">
      <Toggle
        label="Require a reason when declining a booking"
        checked={Boolean(form.require_decline_reason)}
        onChange={(value) => setForm((f) => ({ ...f, require_decline_reason: value }))}
      />
    </SettingsSection>
  );
}

function BrandingSection({ refetch, settings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        org_name: form.org_name,
        support_email: form.support_email,
      });
      await refetch();
      showToast("Branding updated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update branding.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection icon={Palette} formName="branding" onSubmit={handleSubmit} saving={saving} subtitle="Organization name and contact details shown across the app" title="Branding">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organization name">
          <input type="text" className={inputClass} value={form.org_name || ""} onChange={(e) => setForm((f) => ({ ...f, org_name: e.target.value }))} />
        </Field>
        <Field label="Support email">
          <input type="email" className={inputClass} value={form.support_email || ""} onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))} />
        </Field>
      </div>
    </SettingsSection>
  );
}

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export default Settings;
