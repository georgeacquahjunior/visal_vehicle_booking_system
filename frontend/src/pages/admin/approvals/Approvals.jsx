import React, { useState, useEffect } from 'react';
import './Approvals.css';
import {
  fetchPendingBookings,
  approveBookingAPI,
  declineBookingAPI,
  formatDate,
  getStatusClass,
  isPastBooking
} from '../../../utils/approvals';


function Approvals() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // bookings fetched from backend pending endpoint
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!actionMessage) return undefined;
    const timer = setTimeout(() => setActionMessage(null), 7000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  useEffect(() => {
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingBookings();

      const today = new Date();

      const isOnOrBefore = (d1, d2) => {
        if (!d1) return false;
        const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        return a.getTime() <= b.getTime();
      };

      const filtered = data
        .filter((m) => isOnOrBefore(m.date, today))
        .sort((a, b) => {
          const ad = a.date ? a.date.getTime() : 0;
          const bd = b.date ? b.date.getTime() : 0;
          if (bd !== ad) return bd - ad;
          return (b.startTime || '').localeCompare(a.startTime || '');
        });

      setBookings(filtered);
    } catch (err) {
      setError(err.message || 'Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  loadBookings();
  }, []);


  // API calls: approve / decline. Backend routes may not exist yet; these calls are best-effort
  const approveBooking = async (bookingId) => {
  setProcessingId(bookingId);
  try {
    await approveBookingAPI(bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'approved', approvedBy: 'Admin' }
          : b
      )
    );
    setError(null);
    setActionMessage({
      type: 'success',
      text: 'Booking approved successfully.'
    });

    return true;
  } catch (err) {
    const msg = err.message || 'Failed to approve booking.';
    setError(msg);
    setActionMessage({
      type: 'error',
      text: msg
    });
    return false;
  } finally {
    setProcessingId(null);
  }
  };



  const declineBooking = async (bookingId, reason) => {
  setProcessingId(bookingId);
  try {
    await declineBookingAPI(bookingId, reason);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'declined', declineReason: reason }
          : b
      )
    );
    setError(null);
    setActionMessage({
      type: 'success',
      text: 'Booking declined successfully.'
    });

    return true;
  } catch (err) {
    const msg = err.message || 'Failed to decline booking.';
    setError(msg);
    setActionMessage({
      type: 'error',
      text: msg
    });
    return false;
  } finally {
    setProcessingId(null);
  }
  };



  // Filter bookings based on status and search
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    const searchMatch = 
      (booking.userName || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.purpose || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.vehicleName || '').toString().toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });


  // helper: check if a booking date is in the past (strictly before today)

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setApproveDialogOpen(true);
  };

  const handleDecline = (booking) => {
    setSelectedBooking(booking);
    setDeclineDialogOpen(true);
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedBooking) return;
    (async () => {
      const ok = await approveBooking(selectedBooking.id);
      if (ok) {
        setApproveDialogOpen(false);
        setSelectedBooking(null);
      }
    })();
  };

  const confirmDecline = () => {
    if (!selectedBooking || !declineReason.trim()) return;
    (async () => {
      const ok = await declineBooking(selectedBooking.id, declineReason.trim());
      if (ok) {
        setDeclineDialogOpen(false);
        setDeclineReason('');
        setSelectedBooking(null);
      }
    })();
  };

  // Count bookings by status
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    declined: bookings.filter(b => b.status === 'declined').length
  };

  return (
    <div className="approvals">
      {/* Header */}
      <div className="approvals-header">
        <div className="header-title">
          <h1>Booking Approvals</h1>
          <p>Review and manage booking requests</p>
        </div>
      </div>

      {actionMessage && (
        <div className={`action-alert ${actionMessage.type}`}>
          <span className="action-alert-text">{actionMessage.text}</span>
          <button
            type="button"
            className="action-alert-close"
            onClick={() => setActionMessage(null)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}

      {!actionMessage && error && (
        <div className="action-alert error">
          <span className="action-alert-text">{error}</span>
          <button
            type="button"
            className="action-alert-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            x
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="approval-stats">
        <div className="stat-card pending">
          <div className="stat-number">{statusCounts.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{statusCounts.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card declined">
          <div className="stat-number">{statusCounts.declined}</div>
          <div className="stat-label">Declined</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{statusCounts.all}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="approval-filters">
        <div className="filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search by user, purpose, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${statusFilter === 'declined' ? 'active' : ''}`}
            onClick={() => setStatusFilter('declined')}
          >
            Declined
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="approvals-content">
        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={`approval-item ${getStatusClass(booking.status)}`}>
                <div className="approval-left">
                  <div className="approval-header">
                    <div className="approval-title">
                      <h3>{booking.purpose}</h3>
                    </div>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="approval-details">
                    <div className="detail-item">
                      <div>
                        <div className="detail-label">Requester</div>
                        <div className="detail-value">{booking.userName}</div>
                        <div className="detail-sub">{booking.userDept}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div>
                        <div className="detail-label">Booking Date</div>
                        <div className="detail-value">{formatDate(booking.date)}</div>
                        <div className="detail-sub">{booking.startTime} - {booking.endTime}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div>
                        <div className="detail-label">Location</div>
                        <div className="detail-value">{booking.location}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div>
                        <div className="detail-label">Submitted</div>
                        <div className="detail-value">{formatDate(booking.submittedDate)}</div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="approval-notes">
                      <div>
                        <div className="notes-label">Notes</div>
                        <div className="notes-value">{booking.notes}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="approval-actions">
                  <button
                    className="btn-view"
                    onClick={() => handleView(booking)}
                    title="View details"
                    disabled={processingId === booking.id}
                  >
                    <span className="btn-label">View</span>
                  </button>

                  {booking.status === 'pending' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(booking)}
                        title="Approve"
                        disabled={processingId === booking.id || isPastBooking(booking.date)}
                      >
                        <span className="btn-label">Approve</span>
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleDecline(booking)}
                        title="Decline"
                        disabled={processingId === booking.id || isPastBooking(booking.date)}
                      >
                        <span className="btn-label">Decline</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'approved' && (
                    <div className="approval-info">
                      <span className="material-symbols-outlined">done</span>
                      <span>Approved by {booking.approvedBy || 'Admin'}</span>
                    </div>
                  )}

                  {booking.status === 'declined' && (
                    <div className="decline-info">
                      <span className="material-symbols-outlined">block</span>
                      <span>{booking.declineReason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">inbox</span>
            <h3>No Bookings Found</h3>
            <p>No bookings match your current filters.</p>
          </div>
        )}
      </div>

      {/* View Dialog */}
      {viewDialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={() => setViewDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Booking Details</h3>
              <button className="dialog-close" onClick={() => setViewDialogOpen(false)}>
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="detail-section">
                <div className="section-title">Booking Information</div>
                <div className="detail-grid">
                  <div className="detail-item-full">
                    <span className="detail-label">Purpose</span>
                    <div className="detail-value">{selectedBooking.purpose}</div>
                  </div>
                  <div className="detail-item-full">
                    <span className="detail-label">Vehicle</span>
                    <div className="detail-value">{selectedBooking.vehicleName}</div>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Date</span>
                    <div className="detail-value">{formatDate(selectedBooking.date)}</div>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Time</span>
                    <div className="detail-value">{selectedBooking.startTime} - {selectedBooking.endTime}</div>
                  </div>
                  <div className="detail-item-full">
                    <span className="detail-label">Location</span>
                    <div className="detail-value">{selectedBooking.location}</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Requester Information</div>
                <div className="detail-grid">
                  <div className="detail-item-col">
                    <span className="detail-label">Name</span>
                    <div className="detail-value">{selectedBooking.userName}</div>
                  </div>
                  <div className="detail-item-col">
                    <span className="detail-label">Department</span>
                    <div className="detail-value">{selectedBooking.userDept}</div>
                  </div>
                  <div className="detail-item-full">
                    <span className="detail-label">Email</span>
                    <div className="detail-value">{selectedBooking.userEmail}</div>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="detail-section">
                  <div className="section-title">Additional Notes</div>
                  <div className="notes-box">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setViewDialogOpen(false)}>
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    className="btn-approve-full"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApprove(selectedBooking);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject-full"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleDecline(selectedBooking);
                    }}
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      {approveDialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={() => setApproveDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Approve Booking</h3>
            </div>
            
            <div className="dialog-content">
              <div className="confirm-box success">
                <div>
                  <strong>Confirm Approval</strong>
                  <p>You are about to approve <strong>{selectedBooking.purpose}</strong> for <strong>{selectedBooking.userName}</strong></p>
                  <p>This booking is scheduled for <strong>{formatDate(selectedBooking.date)}</strong> from <strong>{selectedBooking.startTime}</strong> to <strong>{selectedBooking.endTime}</strong></p>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </button>
              <button className="btn-approve-full" onClick={confirmApprove}>
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Dialog */}
      {declineDialogOpen && selectedBooking && (
        <div className="dialog-overlay" onClick={() => setDeclineDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Decline Booking</h3>
            </div>
            
            <div className="dialog-content">
              <div className="confirm-box danger">
                <div>
                  <strong>Confirm Decline</strong>
                  <p>You are about to decline <strong>{selectedBooking.purpose}</strong> for <strong>{selectedBooking.userName}</strong></p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Decline</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide a reason for declining this booking..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows="4"
                />
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => {
                setDeclineDialogOpen(false);
                setDeclineReason('');
              }}>
                Cancel
              </button>
              <button 
                className="btn-reject-full" 
                onClick={confirmDecline}
                disabled={!declineReason.trim()}
              >
                Decline Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Approvals;
