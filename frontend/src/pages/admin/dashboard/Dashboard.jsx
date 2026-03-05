import "./Dashboard.css";
import React, { useEffect, useState } from 'react';
import { approveBookingAPI, declineBookingAPI } from '../../utils/approvals';

function Dashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);

  const [actionMessage, setActionMessage] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [otherDeclineReason, setOtherDeclineReason] = useState('');


  const API_BASE = 'https://visal-vehicle-booking-system.onrender.com';

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
          userName: b.staff_name || b.staff || 'Staff',
          booking_date: b.booking_date,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status ? b.status.toString().trim().toLowerCase() : 'pending'
        }));
        // sort newest (date) first, then start_time desc
        const sorted = mapped.sort((a, b) => {
          const ad = a.booking_date ? new Date(a.booking_date).getTime() : 0;
          const bd = b.booking_date ? new Date(b.booking_date).getTime() : 0;
          if (bd !== ad) return bd - ad;
          return (b.start_time || '').localeCompare(a.start_time || '');
        });
        setPending(sorted);
      } catch (err) {
        setError(err.message || 'Failed to load pending bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const recent = pending.slice(0, 5);

  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      setStaffError(null);

      const token = localStorage.getItem("access_token"); // add this

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
          role: u.role || 'staff',
          status: 'active', // or u.status if you add it in backend
        }));

        setStaff(mapped);
      } catch (err) {
        setStaffError(err.message || 'Failed to load staff');
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);


  const isPastBooking = (bookingDateStr) => {
    if (!bookingDateStr) return false;
    const d = new Date(bookingDateStr);
    const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return b.getTime() < t.getTime();
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
      await approveBookingAPI(selectedBooking.id);
      setPending((p) => p.map(x => x.id === selectedBooking.id ? { ...x, status: 'approved' } : x));
      setActionMessage('Booking approved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to approve');
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
      await declineBookingAPI(selectedBooking.id, reason);
      setPending((p) => p.map(x => x.id === selectedBooking.id ? { ...x, status: 'declined' } : x));
      setActionMessage('Booking declined.');
    } catch (err) {
      setError(err.message || 'Failed to decline');
    } finally {
      setProcessingId(null);
      setDeclineDialogOpen(false);
      setSelectedBooking(null);
      setDeclineReason('');
      setOtherDeclineReason('');
    }
  };
  
  return (
    <div className="admin-dashboard">
      {/* Page Title */}
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {actionMessage && (
        <div className="action-alert success">
          <span className="action-alert-text">{actionMessage}</span>
          <button className="action-alert-close" onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card total-staff">
          <h3>Total Staff</h3>
          <p>{staff.length}</p>
        </div>

        {/* <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>120</p>
        </div> */}

        <div className="stat-card total-pending">
          <h3>Pending Requests</h3>
          <p>{pending.length}</p>
        </div>

        {/* <div className="stat-card">
          <h3>Approved Today</h3>
          <p>8</p>
        </div> */}
      </div>


      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h2>Recent Booking Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{color: 'red'}}>{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>{r.userName}</td>
                  <td>{r.booking_date}</td>
                  <td>{r.start_time} - {r.end_time}</td>
                  <td className={r.status === 'pending' ? 'pending' : r.status === 'approved' ? 'approved' : ''}>{r.status}</td>
                  <td>
                    {r.status === 'pending' ? (
                      <>
                        <button className="approve-btn" onClick={() => handleApprove(r)} disabled={processingId === r.id || isPastBooking(r.booking_date)}>Approve</button>
                        <button className="decline-btn" onClick={() => handleDecline(r)} disabled={processingId === r.id || isPastBooking(r.booking_date)}>Decline</button>
                      </>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Staff Table */}
      <div className="recent-bookings">
        <h2>Staff Members</h2>

        {staffLoading ? (
          <p>Loading staff...</p>
        ) : staffError ? (
          <p style={{ color: 'red' }}>{staffError}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No staff found
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.staff_id}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.role}</td>
                    <td className={s.status === 'active' ? 'approved' : 'pending'}>
                      {s.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve Dialog */}
      {approveDialogOpen && selectedBooking && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Approve Booking</h3>
              <button className="dialog-close" onClick={() => setApproveDialogOpen(false)}>×</button>
            </div>
            <div className="dialog-content">
              <div className="confirm-box success">
                <span className="material-symbols-outlined">check_circle</span>
                <div>
                  <strong>Confirm Approval</strong>
                  <p>Are you sure you want to approve this booking request?</p>
                </div>
              </div>
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item-col">
                    <span className="detail-label">Staff</span>
                    <span className="detail-value">{selectedBooking.userName}</span>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{selectedBooking.booking_date}</span>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setApproveDialogOpen(false)}>Cancel</button>
              <button className="btn-approve-full" onClick={confirmApprove} disabled={processingId === selectedBooking.id}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Dialog */}
      {declineDialogOpen && selectedBooking && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Decline Booking</h3>
              <button className="dialog-close" onClick={() => setDeclineDialogOpen(false)}>×</button>
            </div>
            <div className="dialog-content">
              <div className="confirm-box danger">
                <span className="material-symbols-outlined">cancel</span>
                <div>
                  <strong>Confirm Decline</strong>
                  <p>Please provide a reason for declining this booking.</p>
                </div>
              </div>
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item-col">
                    <span className="detail-label">Staff</span>
                    <span className="detail-value">{selectedBooking.userName}</span>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{selectedBooking.booking_date}</span>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Decline</label>
                <select
                  className="form-select"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="Insufficient resources">Insufficient resources</option>
                  <option value="Policy violation">Policy violation</option>
                  <option value="Other">Other</option>
                </select>
                {declineReason === 'Other' && (
                  <textarea
                    className="form-textarea"
                    value={otherDeclineReason}
                    onChange={(e) => setOtherDeclineReason(e.target.value)}
                    placeholder="Enter custom reason..."
                  />
                )}
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setDeclineDialogOpen(false)}>Cancel</button>
              <button className="btn-reject-full" onClick={confirmDecline} disabled={processingId === selectedBooking.id || !declineReason.trim() || (declineReason === 'Other' && !otherDeclineReason.trim())}>Decline</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
