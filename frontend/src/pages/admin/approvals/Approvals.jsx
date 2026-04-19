import React, { useState, useEffect } from 'react';
import './Approvals.css';
import {
  fetchApprovalBookings,
  approveBookingAPI,
  declineBookingAPI,
  formatDate,
  isPastBooking
} from '../../../utils/approvals';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  X
} from "lucide-react";


function Approvals() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [otherDeclineReason, setOtherDeclineReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);

  // bookings fetched from backend pending endpoint
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [approveError, setApproveError] = useState('');
  const [declineError, setDeclineError] = useState('');

  const [processingId, setProcessingId] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

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
        const data = await fetchApprovalBookings();

        const filtered = data
          .filter((m) => m.status !== 'cancelled')
          .sort((a, b) => {
            const ad = a.date ? a.date.getTime() : 0;
            const bd = b.date ? b.date.getTime() : 0;
            if (bd !== ad) return bd - ad;
            return (b.startTime || '').localeCompare(a.startTime || '');
          });

        setBookings(filtered);
      } catch (err) {
        setError(err.message || 'Failed to load booking requests');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    setVisibleCount(5);
  }, [statusFilter, searchTerm]);


  // API calls: approve / decline. Backend routes may not exist yet; these calls are best-effort
  const approveBooking = async (bookingId) => {
  setProcessingId(bookingId);
  setIsProcessingAction(true);
  setApproveError(''); // Clear any previous error
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
    setSuccessModal({
      type: 'approve',
      booking: { ...selectedBooking, status: 'approved', approvedBy: 'Admin' }
    });

    return true;
  } catch (err) {
    const msg = err.message || 'Failed to approve booking.';
    setApproveError(msg);
    return false;
  } finally {
    setProcessingId(null);
    setIsProcessingAction(false);
  }
  };



  const declineBooking = async (bookingId, reason) => {
  setProcessingId(bookingId);
  setIsProcessingAction(true);
  setDeclineError(''); // Clear any previous error
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
    setSuccessModal({
      type: 'decline',
      booking: { ...selectedBooking, status: 'declined', declineReason: reason }
    });

    return true;
  } catch (err) {
    const msg = err.message || 'Failed to decline booking.';
    setDeclineError(msg);
    return false;
  } finally {
    setProcessingId(null);
    setIsProcessingAction(false);
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

  const visibleBookings = filteredBookings.slice(0, visibleCount);
  const hasMoreBookings = visibleCount < filteredBookings.length;

  // helper: check if a booking date is in the past (strictly before today)

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setApproveError(''); // Clear any previous error
    setApproveDialogOpen(true);
  };

  const handleDecline = (booking) => {
    setSelectedBooking(booking);
    setDeclineReason('');
    setOtherDeclineReason('');
    setDeclineError(''); // Clear any previous error
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
    const reasonToSend =
      declineReason === 'Other' ? otherDeclineReason.trim() : declineReason.trim();
    if (!selectedBooking || !reasonToSend) return;
    (async () => {
      const ok = await declineBooking(selectedBooking.id, reasonToSend);
      if (ok) {
        setDeclineDialogOpen(false);
        setDeclineReason('');
        setOtherDeclineReason('');
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

  const nameInitials = (value) => {
    if (!value) return "U";
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const statusLabel = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isCurrentProcessing = isProcessingAction && selectedBooking && processingId === selectedBooking.id;

  return (
    <div className="admin-approvals">
      {/* Hero Section */}
      <section className="approvals-hero">
        <div className="approvals-hero-copy">
          <div className="approvals-kicker">Booking approvals</div>
          <h1 className="approvals-title">Review and manage vehicle requests</h1>
          <p className="approvals-subtitle">
            Process booking requests efficiently with clear visibility into pending approvals,
            approval history, and decision tracking for better fleet management.
          </p>
        </div>

        <div className="approvals-hero-highlight">
          <div className="hero-highlight-header">
            <span className="hero-highlight-label">Quick stats</span>
            <Clock3 size={18} />
          </div>
          <strong>{statusCounts.pending} pending</strong>
          <p>{statusCounts.all} total requests</p>
          <span>{statusCounts.approved} approved this period</span>
        </div>
      </section>

      {/* Alert Messages - Error only */}
      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="alert-close"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <section className="approvals-stats-grid">
        <article className="approvals-metric-card approvals-metric-card-total">
          <div className="metric-icon">
            <CalendarClock size={22} />
          </div>
          <div>
            <p className="metric-label">Total requests</p>
            <h3>{statusCounts.all}</h3>
            <span>All booking requests in system</span>
          </div>
        </article>

        <article className="approvals-metric-card approvals-metric-card-pending">
          <div className="metric-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="metric-label">Pending review</p>
            <h3>{statusCounts.pending}</h3>
            <span>Awaiting admin decision</span>
          </div>
        </article>

        <article className="approvals-metric-card approvals-metric-card-approved">
          <div className="metric-icon">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="metric-label">Approved</p>
            <h3>{statusCounts.approved}</h3>
            <span>Successfully processed</span>
          </div>
        </article>

        <article className="approvals-metric-card approvals-metric-card-declined">
          <div className="metric-icon">
            <X size={22} />
          </div>
          <div>
            <p className="metric-label">Declined</p>
            <h3>{statusCounts.declined}</h3>
            <span>Not approved for booking</span>
          </div>
        </article>
      </section>

      {/* Main Content */}
      <section className="approvals-main-content">
        {/* Bookings Table Panel */}
        <div className="approvals-panel bookings-panel">
          <div className="panel-header">
            <div>
              <h2>Booking requests</h2>
            </div>
            <div className="panel-pill">
              <Filter size={16} />
              <span>{filteredBookings.length} shown</span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="approvals-filters-row">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by requester, purpose, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span className="tab-text">All</span>
                <span className="tab-count">{statusCounts.all}</span>
              </button>
              <button
                className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                <span className="tab-text">Pending</span>
                <span className="tab-count">{statusCounts.pending}</span>
              </button>
              <button
                className={`filter-tab ${statusFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                <span className="tab-text">Approved</span>
                <span className="tab-count">{statusCounts.approved}</span>
              </button>
              <button
                className={`filter-tab ${statusFilter === 'declined' ? 'active' : ''}`}
                onClick={() => setStatusFilter('declined')}
              >
                <span className="tab-text">Declined</span>
                <span className="tab-count">{statusCounts.declined}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="panel-state">Loading booking requests...</div>
          ) : filteredBookings.length > 0 ? (
            <>
              <div className="table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Purpose</th>
                      <th>Vehicle</th>
                      <th>Date & Time</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="requester-cell">
                            <div className="booking-avatar">{nameInitials(booking.userName)}</div>
                            <div>
                              <strong>{booking.userName}</strong>
                            </div>
                          </div>
                        </td>
                        <td>{booking.purpose}</td>
                        <td>{booking.vehicleName}</td>
                        <td>
                          <div className="date-time-cell">
                            <div>{formatDate(booking.date)}</div>
                            <div className="time-range">{booking.startTime} - {booking.endTime}</div>
                          </div>
                        </td>
                        <td>{booking.location}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>{statusLabel(booking.status)}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleView(booking)}
                              disabled={processingId === booking.id}
                            >
                              View
                            </button>

                            {booking.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleApprove(booking)}
                                  disabled={processingId === booking.id || isPastBooking(booking.date)}
                                >
                                  {processingId === booking.id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  className="action-btn decline-btn"
                                  onClick={() => handleDecline(booking)}
                                  disabled={processingId === booking.id || isPastBooking(booking.date)}
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {booking.status !== 'pending' && (
                              <div className="booking-status">
                                {booking.status === 'approved' && (
                                  <>
                                    <CheckCircle2 size={16} />
                                    <span>Approved</span>
                                  </>
                                )}
                                {booking.status === 'declined' && (
                                  <>
                                    <X size={16} />
                                    <span>Declined</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMoreBookings && (
                <div className="load-more-row">
                  <button
                    className="load-more-btn"
                    onClick={() => setVisibleCount((count) => count + 5)}
                  >
                    Load 5 more
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="panel-state">
              <CalendarClock size={48} />
              <h3>No requests found</h3>
              <p>No booking requests match your current filters.</p>
              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* View Modal */}
      {viewDialogOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setViewDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Booking details</p>
                <h2>{selectedBooking.purpose}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setViewDialogOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-summary">
                <div className="summary-avatar">{nameInitials(selectedBooking.userName)}</div>
                <div className="summary-info">
                  <h3>{selectedBooking.userName}</h3>
                  <p>{selectedBooking.userDept} • {selectedBooking.vehicleName}</p>
                  <div className={`status-badge status-${selectedBooking.status} large`}>
                    {statusLabel(selectedBooking.status)}
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-section">
                  <h4>Booking Information</h4>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">Purpose</span>
                      <span className="detail-value">{selectedBooking.purpose}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Vehicle</span>
                      <span className="detail-value">{selectedBooking.vehicleName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(selectedBooking.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{selectedBooking.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Submitted</span>
                      <span className="detail-value">{formatDate(selectedBooking.submittedDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Requester Details</h4>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{selectedBooking.userName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{selectedBooking.userDept}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedBooking.userEmail}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="detail-section full-width">
                    <h4>Additional Notes</h4>
                    <div className="notes-content">
                      <p>{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <div className="modal-actions">
                  <button
                    className="modal-btn approve"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApprove(selectedBooking);
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Approve Booking
                  </button>
                  <button
                    className="modal-btn decline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleDecline(selectedBooking);
                    }}
                  >
                    <X size={16} />
                    Decline Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveDialogOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => !isCurrentProcessing && setApproveDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {isCurrentProcessing && (
              <div className="modal-processing-overlay">
                <div className="modal-processing-spinner" />
                <span>Processing approval...</span>
              </div>
            )}
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Confirm approval</p>
                <h2>Approve Booking Request</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setApproveDialogOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirmation-card success">
                <CheckCircle2 size={48} />
                <div className="confirmation-text">
                  <h3>Confirm Approval</h3>
                  <p>You are about to approve this booking request. This action cannot be undone.</p>
                </div>
              </div>

              <div className="booking-preview">
                <div className="preview-avatar">{nameInitials(selectedBooking.userName)}</div>
                <div className="preview-details">
                  <h4>{selectedBooking.purpose}</h4>
                  <p>{selectedBooking.userName} • {formatDate(selectedBooking.date)}</p>
                  <p>{selectedBooking.startTime} - {selectedBooking.endTime} • {selectedBooking.location}</p>
                </div>
              </div>

              {approveError && (
                <div className="error-message-card">
                  <AlertCircle size={20} />
                  <span>{approveError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => !isCurrentProcessing && setApproveDialogOpen(false)}
                disabled={isCurrentProcessing}
              >
                Cancel
              </button>
              <button
                className="modal-btn approve primary"
                onClick={confirmApprove}
                disabled={isCurrentProcessing}
              >
                {isCurrentProcessing ? (
                  <>
                    <div className="loading-spinner small" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declineDialogOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => !isCurrentProcessing && setDeclineDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {isCurrentProcessing && (
              <div className="modal-processing-overlay">
                <div className="modal-processing-spinner" />
                <span>Processing decline...</span>
              </div>
            )}
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Confirm decline</p>
                <h2>Decline Booking Request</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setDeclineDialogOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirmation-card danger">
                <AlertCircle size={48} />
                <div className="confirmation-text">
                  <h3>Confirm Decline</h3>
                  <p>Please provide a reason for declining this booking request.</p>
                </div>
              </div>

              <div className="booking-preview">
                <div className="preview-avatar">{nameInitials(selectedBooking.userName)}</div>
                <div className="preview-details">
                  <h4>{selectedBooking.purpose}</h4>
                  <p>{selectedBooking.userName} • {formatDate(selectedBooking.date)}</p>
                  <p>{selectedBooking.startTime} - {selectedBooking.endTime} • {selectedBooking.location}</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Reason for Decline</label>
                  <select
                    className="form-select"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                  >
                    <option value="" disabled>Select a reason</option>
                    <option value="Late Booking Submission">Late Booking Submission</option>
                    <option value="Incomplete Booking Form">Incomplete Booking Form</option>
                    <option value="Personal/Non-Company Business">Personal/Non-Company Business</option>
                    <option value="Overlapping Higher Priority Booking">Overlapping Higher Priority Booking</option>
                    <option value="Public Transport Feasible">Public Transport Feasible</option>
                    <option value="Outside Working Hours Without Approval">Outside Working Hours Without Approval</option>
                    <option value="No Supervisor Approval">No Supervisor Approval</option>
                    <option value="Vehicle Maintenance Day">Vehicle Maintenance Day</option>
                    <option value="Driver Unavailable">Driver Unavailable</option>
                    <option value="Duplicate Booking for Same Destination">Duplicate Booking for Same Destination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {declineReason === 'Other' && (
                  <div className="form-group">
                    <label className="form-label">Specify Reason</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Please provide the specific reason for declining..."
                      value={otherDeclineReason}
                      onChange={(e) => setOtherDeclineReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {declineError && (
                <div className="error-message-card">
                  <AlertCircle size={20} />
                  <span>{declineError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  if (isCurrentProcessing) return;
                  setDeclineDialogOpen(false);
                  setDeclineReason('');
                  setOtherDeclineReason('');
                }}
                disabled={isCurrentProcessing}
              >
                Cancel
              </button>
              <button
                className="modal-btn decline primary"
                onClick={confirmDecline}
                disabled={isCurrentProcessing || !declineReason.trim() || (declineReason === 'Other' && !otherDeclineReason.trim())}
              >
                {isCurrentProcessing ? (
                  <>
                    <div className="loading-spinner small" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Decline Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Approve */}
      {successModal?.type === 'approve' && (
        <div className="modal-overlay" onClick={() => setSuccessModal(null)}>
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-container">
              <div className="success-icon-circle">
                <CheckCircle2 size={60} color="#10b981" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="success-title">Booking Approved!</h2>
            <p className="success-message">
              The booking request has been successfully approved and the requester has been notified via email.
            </p>
            <div className="success-details">
              <div className="detail-row">
                <span className="detail-label">Requester:</span>
                <span className="detail-value">{successModal.booking?.userName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purpose:</span>
                <span className="detail-value">{successModal.booking?.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(successModal.booking?.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{successModal.booking?.startTime} - {successModal.booking?.endTime}</span>
              </div>
            </div>
            <button
              className="success-action-btn"
              onClick={() => setSuccessModal(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Success Modal - Decline */}
      {successModal?.type === 'decline' && (
        <div className="modal-overlay" onClick={() => setSuccessModal(null)}>
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-container decline">
              <div className="success-icon-circle decline">
                <X size={60} color="#ef4444" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="success-title decline">Booking Declined</h2>
            <p className="success-message">
              The booking request has been declined and the requester has been notified via email with the reason.
            </p>
            <div className="success-details">
              <div className="detail-row">
                <span className="detail-label">Requester:</span>
                <span className="detail-value">{successModal.booking?.userName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purpose:</span>
                <span className="detail-value">{successModal.booking?.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(successModal.booking?.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason:</span>
                <span className="detail-value decline-reason">{successModal.booking?.declineReason}</span>
              </div>
            </div>
            <button
              className="success-action-btn decline"
              onClick={() => setSuccessModal(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Approvals;
