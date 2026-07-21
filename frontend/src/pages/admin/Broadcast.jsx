import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, FlaskConical, LayoutTemplate, Megaphone, Send, Users } from "lucide-react";
import { fetchBroadcastSenders, sendBroadcastEmail } from "../../utils/broadcast.js";
import { API_BASE_URL } from "../../config.js";
import InfoButton from "../../components/InfoButton";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import useGreeting from "../../hooks/useGreeting.js";
import { showToast } from "../../utils/toast.js";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All users" },
  { value: "staff", label: "Requesters only" },
  { value: "admin", label: "Admins only" },
  { value: "user", label: "Specific user" },
];

const VARIABLES = [
  { token: "{{full_name}}", label: "Full name" },
  { token: "{{first_name}}", label: "First name" },
  { token: "{{staff_id}}", label: "Staff ID" },
  { token: "{{email}}", label: "Email" },
  { token: "{{department}}", label: "Department" },
  { token: "{{role}}", label: "Role" },
];

const SAMPLE_USER = {
  full_name: "Jordan Sample",
  staff_id: "STAFF001",
  email: "jordan.sample@example.com",
  department: "Operations",
  role: "Staff",
};

function renderPreview(text, user) {
  const values = {
    full_name: user?.full_name || SAMPLE_USER.full_name,
    first_name: (user?.full_name || SAMPLE_USER.full_name).split(" ")[0],
    staff_id: user?.staff_id || SAMPLE_USER.staff_id,
    email: user?.email || SAMPLE_USER.email,
    department: user?.department || SAMPLE_USER.department,
    role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : SAMPLE_USER.role,
  };
  let rendered = text;
  Object.entries(values).forEach(([key, value]) => {
    rendered = rendered.split(`{{${key}}}`).join(value);
  });
  return rendered;
}

const SITE_URL = "https://book-beta.vaarde.com";

const CTA_BUTTON = `<div style="text-align:center;margin:28px 0 8px;">
      <a href="${SITE_URL}" style="display:inline-block;background:#1469e1;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 30px;border-radius:10px;">Open the portal</a>
    </div>`;

const TEMPLATES = [
  { id: "blank", label: "Blank", subject: "", html: "", format: "html" },
  {
    id: "maintenance",
    label: "Scheduled maintenance",
    subject: "Scheduled system maintenance",
    html: "<p>Hi {{first_name}},</p>\n<p>We'll be performing scheduled maintenance on the Vehicle Booking Portal. During this time the system may be temporarily unavailable.</p>\n<p>Thanks for your patience.</p>",
  },
  {
    id: "policy",
    label: "Policy update",
    subject: "Updated booking policy",
    html: "<p>Hi {{first_name}},</p>\n<p>We've made an update to our vehicle booking policy. Please review the changes next time you're on the portal.</p>",
  },
  {
    id: "welcome",
    label: "Welcome message",
    subject: "Welcome to the Vehicle Booking Portal",
    html: "<p>Hi {{first_name}},</p>\n<p>Welcome aboard! You can now book vehicles, track approvals, and manage your account from the portal.</p>\n<p>Your staff ID is <strong>{{staff_id}}</strong>.</p>",
  },
  {
    id: "system_update",
    label: "System update (admin + requester)",
    subject: "What's new on the Vehicle Booking Portal",
    html: `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#11233f;">
  <div style="background:linear-gradient(135deg,#1469e1,#11233f);border-radius:16px 16px 0 0;padding:32px 28px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">What's new on the Vehicle Booking Portal</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">A round-up of everything we've shipped recently</p>
  </div>

  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">Hi {{first_name}},</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">We've rolled out a set of updates across both the admin and requester dashboards. Here's what's changed:</p>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1469e1;text-transform:uppercase;letter-spacing:0.04em;">Admin dashboard</h2>
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Settings</strong> &mdash; configure booking rules, schedule defaults, notifications, audit retention, approval workflow, and branding in one place.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Audit Log</strong> &mdash; a redesigned, searchable trail of every action taken across the system.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Support inbox</strong> &mdash; view, reply to, and resolve messages sent in from staff.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Broadcast Email</strong> &mdash; send announcements like this one to all users, requesters only, admins only, or a specific person, with reusable templates and per-recipient variables.</p>
      <p style="margin:0;font-size:14px;line-height:1.5;"><strong>Staff management</strong> &mdash; staff IDs can now be edited directly, with related records updating automatically.</p>
    </div>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1469e1;text-transform:uppercase;letter-spacing:0.04em;">Requester dashboard</h2>
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Booking flow</strong> &mdash; a redesigned New Booking page with helper tooltips on every field.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>My Bookings</strong> &mdash; filter and search your booking history, cancel a future booking, and view full details including decline reasons.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>My Account</strong> &mdash; update your name and phone number, and see your staff ID, email, department, and role.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Notifications</strong> &mdash; a dedicated page listing every notification, with links straight to the relevant booking or message.</p>
      <p style="margin:0;font-size:14px;line-height:1.5;"><strong>Navigation</strong> &mdash; switch between a sidebar or bottom navigation bar, whichever you prefer.</p>
    </div>
    ${CTA_BUTTON}

    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#7b8ba5;">Questions or issues? Reach out through Help &amp; Support from the dashboard.</p>
  </div>

  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:16px 0 0;">Vehicle Booking Portal &middot; Vaarde Consulting Ltd</p>
</div>`,
  },
  {
    id: "requester_update",
    label: "Requester dashboard update",
    subject: "What's new for you on the Vehicle Booking Portal",
    html: `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#11233f;">
  <div style="background:linear-gradient(135deg,#1469e1,#11233f);border-radius:16px 16px 0 0;padding:32px 28px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Your dashboard just got an upgrade</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Here's what's new for you</p>
  </div>

  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">Hi {{first_name}},</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">We've made a number of improvements to your dashboard to make booking a vehicle quicker and easier. Here's what's changed:</p>

    <div style="margin:0 0 8px;">
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Booking flow</strong> &mdash; a redesigned New Booking page with helper tooltips on every field, so it's clearer what each one means.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>My Bookings</strong> &mdash; filter and search your booking history, cancel a future booking yourself, and view full details for any booking, including the reason if it was declined.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>My Account</strong> &mdash; update your name and phone number anytime, and see your staff ID, email, department, and role at a glance.</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><strong>Notifications</strong> &mdash; a dedicated page listing every notification you've received, with a link straight to the relevant booking.</p>
      <p style="margin:0;font-size:14px;line-height:1.5;"><strong>Navigation</strong> &mdash; choose between a sidebar or a bottom navigation bar, whichever you find easier to use.</p>
    </div>
    ${CTA_BUTTON}

    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#7b8ba5;">Questions or issues? Reach out through Help &amp; Support from your dashboard.</p>
  </div>

  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:16px 0 0;">Vehicle Booking Portal &middot; Vaarde Consulting Ltd</p>
</div>`,
  },
];

function Broadcast() {
  const { todayLabel } = useGreeting();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [senders, setSenders] = useState([]);
  const [defaultSender, setDefaultSender] = useState("");
  const [selectedSender, setSelectedSender] = useState("");

  const [audience, setAudience] = useState("all");
  const [targetStaffId, setTargetStaffId] = useState("");
  const [template, setTemplate] = useState("blank");
  const [format, setFormat] = useState("html");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [formError, setFormError] = useState("");

  const htmlRef = useRef(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data.users) ? data.users : data;
        setUsers(Array.isArray(list) ? list : []);
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();

    const loadSenders = async () => {
      try {
        const data = await fetchBroadcastSenders();
        setSenders(Array.isArray(data.senders) ? data.senders : []);
        setDefaultSender(data.default_sender || "");
      } catch {
        setSenders([]);
      }
    };
    loadSenders();
  }, []);

  const activeUsers = useMemo(() => users.filter((user) => user.status === "active" && user.email), [users]);
  const recipientCount = useMemo(() => {
    if (audience === "staff") return activeUsers.filter((user) => user.role === "staff").length;
    if (audience === "admin") return activeUsers.filter((user) => user.role === "admin").length;
    if (audience === "user") return targetStaffId ? 1 : 0;
    return activeUsers.length;
  }, [activeUsers, audience, targetStaffId]);

  const audienceLabel = AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label || "users";

  const previewUser = useMemo(() => {
    if (audience === "user") {
      return activeUsers.find((user) => user.staff_id === targetStaffId) || null;
    }
    if (audience === "staff") return activeUsers.find((user) => user.role === "staff") || null;
    if (audience === "admin") return activeUsers.find((user) => user.role === "admin") || null;
    const myStaffId = localStorage.getItem("staff_id");
    return activeUsers.find((user) => user.staff_id === myStaffId) || activeUsers[0] || null;
  }, [audience, targetStaffId, activeUsers]);

  const previewSubject = renderPreview(subject, previewUser);
  const previewHtml = renderPreview(htmlBody, previewUser);

  const applyTemplate = (templateId) => {
    setTemplate(templateId);
    const found = TEMPLATES.find((item) => item.id === templateId);
    if (!found) return;
    setSubject(found.subject);
    setHtmlBody(found.html);
    setFormat(found.format || "html");
  };

  const insertVariable = (token) => {
    const el = htmlRef.current;
    if (!el) {
      setHtmlBody((prev) => prev + token);
      return;
    }
    const start = el.selectionStart ?? htmlBody.length;
    const end = el.selectionEnd ?? htmlBody.length;
    const next = htmlBody.slice(0, start) + token + htmlBody.slice(end);
    setHtmlBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleReview = (event) => {
    event.preventDefault();
    setFormError("");
    if (!subject.trim() || !htmlBody.trim()) {
      setFormError("Subject and email content are required.");
      return;
    }
    if (audience === "user" && !targetStaffId) {
      setFormError("Select which user should receive this email.");
      return;
    }
    if (recipientCount === 0) {
      setFormError("There are no active recipients for this audience.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await sendBroadcastEmail({
        subject: subject.trim(),
        html_body: htmlBody,
        audience,
        target_staff_id: audience === "user" ? targetStaffId : undefined,
        sender: selectedSender || undefined,
        format,
      });
      showToast(`Email sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}.`, "success");
      setConfirmOpen(false);
      setSubject("");
      setHtmlBody("");
      setTemplate("blank");
      setFormat("html");
    } catch (err) {
      showToast(err.message || "Failed to send broadcast email.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !htmlBody.trim()) {
      setFormError("Write a subject and some content before sending a test.");
      return;
    }
    setFormError("");
    setSendingTest(true);
    try {
      await sendBroadcastEmail({
        subject: subject.trim(),
        html_body: htmlBody,
        audience: "self",
        sender: selectedSender || undefined,
        format,
      });
      showToast("Test email sent to your own inbox.", "success");
    } catch (err) {
      showToast(err.message || "Failed to send test email.", "error");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          <Megaphone size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">Broadcast email</h1>
            <InfoButton text="Compose a custom HTML email and send it to all users, requesters only, admins only, or one specific user. Use {{variables}} to personalize each copy." />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl bg-[#f8fafc] px-5 py-3.5">
          <Users size={80} className="pointer-events-none absolute -right-3 -top-3 z-0 text-blue-700/[0.06]" aria-hidden="true" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users size={18} />
            </div>
            {loadingUsers ? (
              <Spinner size={18} />
            ) : (
              <p className="m-0 text-[15px] text-[#11233f]">
                <strong className="font-bold">{recipientCount}</strong>
                <span className="text-[#7b8ba5]"> recipient{recipientCount === 1 ? "" : "s"} · {audienceLabel}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <form onSubmit={handleReview} className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2" data-ga-form="broadcast_email_review">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="m-0 mb-5 text-xl font-bold text-[#11233f]">Compose</h2>

          <div className="flex flex-col gap-4">
            <div>
              <span className="mb-2 block text-sm font-bold text-[#11233f]">Send to</span>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAudience(option.value)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                      audience === option.value
                        ? "border-[#1469e1] bg-[#1469e1] text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {audience === "user" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#11233f]">Recipient</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#11233f] outline-none focus:border-[#1469e1] disabled:cursor-not-allowed disabled:opacity-60"
                  value={targetStaffId}
                  onChange={(event) => setTargetStaffId(event.target.value)}
                  disabled={loadingUsers}
                >
                  <option value="">{loadingUsers ? "Loading users..." : "Select a user..."}</option>
                  {activeUsers.map((user) => (
                    <option key={user.staff_id} value={user.staff_id}>
                      {user.full_name} ({user.staff_id}) — {user.role}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {senders.length > 0 && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#11233f]">Send from</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#11233f] outline-none focus:border-[#1469e1]"
                  value={selectedSender}
                  onChange={(event) => setSelectedSender(event.target.value)}
                >
                  <option value="">{defaultSender ? `Default (${defaultSender})` : "Default sender"}</option>
                  {senders.map((option) => (
                    <option key={option.email} value={option.email}>
                      {option.label} ({option.email})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#11233f]">Template</span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#11233f] outline-none focus:border-[#1469e1]"
                value={template}
                onChange={(event) => applyTemplate(event.target.value)}
              >
                {TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <LayoutTemplate size={12} /> Loading a template overwrites the subject and content below.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#11233f]">Subject</span>
              <input
                type="text"
                required
                maxLength={200}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#11233f] outline-none focus:border-[#1469e1]"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Scheduled maintenance this weekend"
              />
            </label>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="block text-sm font-bold text-[#11233f]">{format === "html" ? "HTML content" : "Plain text content"}</span>
                <div className="flex shrink-0 rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setFormat("html")}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      format === "html" ? "bg-[#1469e1] text-white" : "text-slate-500 hover:text-[#1469e1]"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("text")}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      format === "text" ? "bg-[#1469e1] text-white" : "text-slate-500 hover:text-[#1469e1]"
                    }`}
                  >
                    Plain text
                  </button>
                </div>
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {VARIABLES.map((variable) => (
                  <button
                    key={variable.token}
                    type="button"
                    onClick={() => insertVariable(variable.token)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:border-[#1469e1] hover:text-[#1469e1]"
                    title={`Insert ${variable.token}`}
                  >
                    {variable.label}
                  </button>
                ))}
              </div>
              <textarea
                ref={htmlRef}
                required
                className={`min-h-[280px] w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#11233f] outline-none focus:border-[#1469e1] ${
                  format === "html" ? "font-mono" : ""
                }`}
                value={htmlBody}
                onChange={(event) => setHtmlBody(event.target.value)}
                placeholder={format === "html" ? "<p>Write your email in HTML...</p>" : "Write your email as plain text..."}
              />
              <span className="mt-1.5 block text-xs text-slate-400">
                {format === "html"
                  ? "Write raw HTML — the preview on the right updates as you type."
                  : "This sends as a plain-text email, exactly as typed — no HTML tags."}{" "}
                Variables like <code>{"{{full_name}}"}</code> are filled in per recipient either way.
              </span>
            </div>

            {formError && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                <AlertCircle size={18} />
                {formError}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleSendTest}
                disabled={sendingTest}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1] disabled:cursor-not-allowed disabled:opacity-60"
                data-ga-button="broadcast_send_test"
              >
                <FlaskConical size={16} />
                {sendingTest ? "Sending test..." : "Send test to me"}
              </button>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-none bg-[#1469e1] px-6 text-sm font-bold text-white hover:bg-[#115cc7]"
                data-ga-button="broadcast_review_and_send"
              >
                <Send size={16} />
                Review &amp; send
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-bold text-[#11233f]">Preview</h2>
            <span className="text-xs font-semibold text-slate-400">
              Showing as {previewUser ? `${previewUser.full_name} (${previewUser.staff_id})` : `sample data — ${SAMPLE_USER.full_name}`}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {htmlBody.trim() ? (
              <>
                {subject.trim() && (
                  <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#11233f]">{previewSubject}</div>
                )}
                {format === "html" ? (
                  <iframe title="Email preview" srcDoc={previewHtml} sandbox="" className="h-[360px] w-full bg-white" />
                ) : (
                  <pre className="h-[360px] w-full overflow-auto whitespace-pre-wrap break-words bg-white p-4 font-sans text-sm text-[#11233f]">{previewHtml}</pre>
                )}
              </>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-sm text-slate-400">Your {format === "html" ? "HTML" : "text"} preview will appear here.</div>
            )}
          </div>
        </section>
      </form>

      {confirmOpen && (
        <Modal onClose={() => !sending && setConfirmOpen(false)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="m-0 text-xl font-bold text-[#11233f]">Send this email?</h2>
            <p className="mt-3 text-sm text-slate-600">
              This will send <strong>&quot;{subject}&quot;</strong> to <strong>{recipientCount} recipient{recipientCount === 1 ? "" : "s"}</strong> ({audienceLabel}). This
              can&apos;t be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#1469e1] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSend}
                disabled={sending}
                data-ga-button="broadcast_confirm_send"
              >
                {sending ? "Sending..." : "Send email"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Broadcast;
