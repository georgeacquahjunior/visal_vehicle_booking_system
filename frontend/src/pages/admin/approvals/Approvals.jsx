import React, { useState } from 'react';
import './Approvals.css';

function Approvals() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock bookings data - pending approvals
  const mockBookings = [
    {
      id: 1,
      vehicleName: 'Ford Transit - Van 02',
      startTime: '09:00',
      endTime: '10:30',
      date: new Date(2025, 0, 22),
      purpose: 'Client Site Visit',
      location: 'Downtown Distribution Center',
      status: 'pending',
      userName: 'John Smith',
      userEmail: 'john@company.com',
      userDept: 'Sales',
      notes: 'Client meeting for project discussion',
      submittedDate: new Date(2025, 0, 18)
    },
    {
      id: 2,
      vehicleName: 'Toyota Camry',
      startTime: '14:00',
      endTime: '15:30',
      date: new Date(2025, 0, 23),
      purpose: 'Executive Transport',
      location: 'Airport Terminal',
      status: 'pending',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@company.com',
      userDept: 'Operations',
      notes: 'Airport pickup for visiting executive',
      submittedDate: new Date(2025, 0, 19)
    },
    {
      id: 3,
      vehicleName: 'Nissan NV200',
      startTime: '10:00',
      endTime: '13:00',
      date: new Date(2025, 0, 25),
      purpose: 'Quarterly Supply Run',
      location: 'Warehouse',
      status: 'pending',
      userName: 'Mike Chen',
      userEmail: 'mike@company.com',
      userDept: 'Logistics',
      notes: 'Monthly supply delivery',
      submittedDate: new Date(2025, 0, 17)
    },
    {
      id: 4,
      vehicleName: 'Hyundai i30',
      startTime: '11:00',
      endTime: '12:30',
      date: new Date(2025, 0, 24),
      purpose: 'Client Meeting',
      location: 'Business Park',
      status: 'approved',
      userName: 'Emma Davis',
      userEmail: 'emma@company.com',
      userDept: 'Marketing',
      notes: 'Quarterly review meeting',
      submittedDate: new Date(2025, 0, 15),
      approvedDate: new Date(2025, 0, 16),
      approvedBy: 'Admin User'
    },
    {
      id: 5,
      vehicleName: 'Maintenance Truck 01',
      startTime: '08:00',
      endTime: '12:00',
      date: new Date(2025, 0, 20),
      purpose: 'Equipment Haul',
      location: 'North Sector',
      status: 'declined',
      userName: 'Robert Wilson',
      userEmail: 'robert@company.com',
      userDept: 'Operations',
      notes: 'Equipment delivery to north location',
      submittedDate: new Date(2025, 0, 14),
      declinedDate: new Date(2025, 0, 15),
      declineReason: 'Vehicle not available on requested date',
      declinedBy: 'Admin User'
    }
  ];

  // Filter bookings based on status and search
  const filteredBookings = mockBookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    const searchMatch = 
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Format date
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get status badge color
  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'declined': return 'declined';
      default: return 'pending';
    }
  };

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
    if (selectedBooking) {
      alert(`Booking ${selectedBooking.id} approved successfully!`);
      setApproveDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const confirmDecline = () => {
    if (selectedBooking && declineReason.trim()) {
      alert(`Booking ${selectedBooking.id} declined with reason: ${declineReason}`);
      setDeclineDialogOpen(false);
      setDeclineReason('');
      setSelectedBooking(null);
    }
  };

  // Count bookings by status
  const statusCounts = {
    all: mockBookings.length,
    pending: mockBookings.filter(b => b.status === 'pending').length,
    approved: mockBookings.filter(b => b.status === 'approved').length,
    declined: mockBookings.filter(b => b.status === 'declined').length
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

      {/* Stats Cards */}
      <div className="approval-stats">
        <div className="stat-card">
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
          <span className="material-symbols-outlined search-icon">search</span>
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
                      <p>{booking.vehicleName}</p>
                    </div>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="approval-details">
                    <div className="detail-item">
                      <span className="material-symbols-outlined">person</span>
                      <div>
                        <div className="detail-label">Requester</div>
                        <div className="detail-value">{booking.userName}</div>
                        <div className="detail-sub">{booking.userDept}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <div>
                        <div className="detail-label">Booking Date</div>
                        <div className="detail-value">{formatDate(booking.date)}</div>
                        <div className="detail-sub">{booking.startTime} - {booking.endTime}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="material-symbols-outlined">location_on</span>
                      <div>
                        <div className="detail-label">Location</div>
                        <div className="detail-value">{booking.location}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="material-symbols-outlined">access_time</span>
                      <div>
                        <div className="detail-label">Submitted</div>
                        <div className="detail-value">{formatDate(booking.submittedDate)}</div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="approval-notes">
                      <span className="material-symbols-outlined">note</span>
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
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>

                  {booking.status === 'pending' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(booking)}
                        title="Approve"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleDecline(booking)}
                        title="Decline"
                      >
                        <span className="material-symbols-outlined">cancel</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'approved' && (
                    <div className="approval-info">
                      <span className="material-symbols-outlined">done</span>
                      <span>Approved by {booking.approvedBy}</span>
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
                <span className="material-symbols-outlined">close</span>
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
                    <span className="material-symbols-outlined">check_circle</span>
                    Approve
                  </button>
                  <button
                    className="btn-reject-full"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleDecline(selectedBooking);
                    }}
                  >
                    <span className="material-symbols-outlined">cancel</span>
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
                <span className="material-symbols-outlined">check_circle</span>
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
                <span className="material-symbols-outlined">check_circle</span>
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
                <span className="material-symbols-outlined">cancel</span>
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
                <span className="material-symbols-outlined">cancel</span>
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
