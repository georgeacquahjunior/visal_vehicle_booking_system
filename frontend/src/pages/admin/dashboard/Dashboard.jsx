import "./Dashboard.css";
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { API_BASE_URL } from "../../../config.js";

function Dashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/bookings/pending`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        const remote = Array.isArray(data.pending_bookings) ? data.pending_bookings : [];
        const mapped = remote.map((b) => ({
          id: b.booking_id,
          userName: b.staff_name || b.staff || "Staff",
          bookingDate: b.booking_date,
          startTime: b.start_time,
          endTime: b.end_time,
          status: b.status ? b.status.toString().trim().toLowerCase() : "pending",
        }));
        const sorted = mapped.sort((a, b) => {
          const ad = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
          const bd = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
          if (bd !== ad) return bd - ad;
          return (b.startTime || "").localeCompare(a.startTime || "");
        });
        setPending(sorted);
      } catch (err) {
        setError(err.message || "Failed to load pending bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      setStaffError(null);

      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${API_BASE}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);

        const data = await res.json();
        const users = Array.isArray(data.users) ? data.users : data;

        const mapped = users.map((u) => ({
          id: u.staff_id,
          name: u.full_name,
          email: u.email,
          role: u.role || "staff",
          status: "active",
        }));

        setStaff(mapped);
      } catch (err) {
        setStaffError(err.message || "Failed to load staff");
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const isPastBooking = (bookingDateStr) => {
    if (!bookingDateStr) return false;
    const d = new Date(bookingDateStr);
    const bookingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return bookingDate.getTime() < currentDate.getTime();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusLabel = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const nameInitials = (value) => {
    if (!value) return "U";
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setApproveDialogOpen(true);
  };

  const handleDecline = (booking) => {
    setSelectedBooking(booking);
    setDeclineDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedBooking) return;
    setProcessingId(selectedBooking.id);
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_comment: "" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Server responded ${res.status}`);

      setPending((current) => current.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to approve");
    } finally {
      setProcessingId(null);
      setApproveDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const confirmDecline = async () => {
    if (!selectedBooking) return;
    const reason = declineReason === 'Other' ? otherDeclineReason : declineReason;
    setProcessingId(selectedBooking.id);
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/decline`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admin_comment: "Declined from dashboard",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Server responded ${res.status}`);

      setPending((current) => current.map((item) => (item.id === id ? { ...item, status: "declined" } : item)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to decline");
    } finally {
      setProcessingId(null);
      setDeclineDialogOpen(false);
      setSelectedBooking(null);
      setDeclineReason('');
      setOtherDeclineReason('');
    }
  };

  const visibleRequests = pending.slice(0, visibleCount);
  const hasMoreRequests = visibleCount < pending.length;
  const totalPending = pending.filter((item) => item.status === "pending").length;
  const approvedQueue = pending.filter((item) => item.status === "approved").length;
  const activeStaff = staff.filter((member) => member.status === "active").length;
  const admins = staff.filter((member) => member.role === "admin").length;
  const nextRequest = pending.find((item) => item.status === "pending") || pending[0] || null;

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <div className="dashboard-kicker">Administration overview</div>
          <h1 className="dashboard-title">Operational control for vehicle bookings</h1>
          <p className="dashboard-subtitle">
            Review incoming requests, monitor staff activity, and keep vehicle scheduling decisions moving with a
            clearer admin workspace.
          </p>
        </div>

        <div className="dashboard-hero-highlight">
          <div className="hero-highlight-header">
            <span className="hero-highlight-label">Next item in queue</span>
            <Clock3 size={18} />
          </div>
          {nextRequest ? (
            <>
              <strong>{nextRequest.userName}</strong>
              <p>{formatDate(nextRequest.bookingDate)}</p>
              <span>
                {nextRequest.startTime} - {nextRequest.endTime}
              </span>
            </>
          ) : (
            <>
              <strong>All clear</strong>
              <p>No requests waiting for review right now.</p>
              <span>Queue is up to date</span>
            </>
          )}
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <article className="dashboard-metric-card dashboard-metric-card-staff">
          <div className="metric-icon">
            <UsersRound size={22} />
          </div>
          <div>
            <p className="metric-label">Active staff</p>
            <h3>{activeStaff}</h3>
            <span>{admins} admin account{admins === 1 ? "" : "s"} with elevated access</span>
          </div>
        </article>

        <article className="dashboard-metric-card dashboard-metric-card-pending">
          <div className="metric-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="metric-label">Pending requests</p>
            <h3>{totalPending}</h3>
            <span>{visibleRequests.length} recent requests currently visible on this page</span>
          </div>
        </article>

        <article className="dashboard-metric-card dashboard-metric-card-approved">
          <div className="metric-icon">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="metric-label">Reviewed in queue</p>
            <h3>{approvedQueue}</h3>
            <span>Items already acted on during this session view</span>
          </div>
        </article>

        <article className="dashboard-metric-card dashboard-metric-card-security">
          <div className="metric-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="metric-label">System posture</p>
            <h3>{staffError || error ? "Check" : "Stable"}</h3>
            <span>{staffError || error ? "One or more data panels need attention" : "Core dashboard feeds are responding"}</span>
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel booking-queue-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Review queue</p>
              <h2>Recent booking requests</h2>
            </div>
            <div className="panel-pill">
              <CalendarClock size={16} />
              <span>{totalPending} awaiting action</span>
            </div>
          </div>

          {loading ? (
            <div className="panel-state">Loading booking requests...</div>
          ) : error ? (
            <div className="panel-state panel-state-error">{error}</div>
          ) : visibleRequests.length === 0 ? (
            <div className="panel-state">No booking requests available.</div>
          ) : (
            <>
              <div className="request-list">
                {visibleRequests.map((request) => {
                  const disabled = processingId === request.id || isPastBooking(request.bookingDate);
                  const isPending = request.status === "pending";
                  return (
                  <article className="request-card" key={request.id}>
                    <div className="request-card-top">
                      <div className="request-person">
                        <div className="request-avatar">{nameInitials(request.userName)}</div>
                        <div>
                          <h3>{request.userName}</h3>
                          <p>{formatDate(request.bookingDate)}</p>
                        </div>
                      </div>
                      <span className={`status-badge status-${request.status}`}>{statusLabel(request.status)}</span>
                    </div>

                    <div className="request-meta">
                      <span>{request.startTime} - {request.endTime}</span>
                      {isPastBooking(request.bookingDate) && <span className="request-flag">Past date</span>}
                    </div>

                    <div className="request-actions">
                      {isPending ? (
                        <>
                          <button className="dashboard-approve-btn" onClick={() => approveBooking(request.id)} disabled={disabled}>
                            {processingId === request.id ? "Processing..." : "Approve"}
                          </button>
                          <button className="decline-btn" onClick={() => declineBooking(request.id)} disabled={disabled}>
                            Decline
                          </button>
                        </>
                      ) : (
                        <div className="request-complete">Decision recorded</div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {hasMoreRequests && (
              <div className="request-loadmore">
                <button className="load-more-btn" onClick={() => setVisibleCount((count) => Math.min(count + 3, pending.length))}>
                  Load more requests
                </button>
              </div>
            )}
          </>
          )}
        </div>

        <aside className="dashboard-panel insights-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Quick insight</p>
              <h2>Admin snapshot</h2>
            </div>
          </div>

          <div className="insight-stack">
            <div className="insight-card">
              <span className="insight-label">Queue health</span>
              <strong>{totalPending === 0 ? "Balanced" : "Needs review"}</strong>
              <p>
                {totalPending === 0
                  ? "No pending approvals are waiting right now."
                  : `${totalPending} request${totalPending === 1 ? "" : "s"} still need an admin decision.`}
              </p>
            </div>

            <div className="insight-card">
              <span className="insight-label">Coverage</span>
              <strong>{staff.length} team members loaded</strong>
              <p>Use the staff register and approvals workflow to keep records current and scheduling responsive.</p>
            </div>

            <div className="insight-card">
              <span className="insight-label">Visibility</span>
              <strong>Professional control center</strong>
              <p>The dashboard now prioritizes decisions, staffing visibility, and high-signal status cues.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="dashboard-panel staff-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Directory</p>
            <h2>Staff members</h2>
          </div>
          <div className="panel-pill panel-pill-muted">
            <span>{staff.length} total account{staff.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {staffLoading ? (
          <div className="panel-state">Loading staff members...</div>
        ) : staffError ? (
          <div className="panel-state panel-state-error">{staffError}</div>
        ) : staff.length === 0 ? (
          <div className="panel-state">No staff found.</div>
        ) : (
          <div className="table-shell">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Staff ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="staff-cell">
                        <div className="staff-avatar">{nameInitials(member.name)}</div>
                        <div>
                          <strong>{member.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{member.id}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className="role-badge">{member.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${member.status}`}>{statusLabel(member.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
