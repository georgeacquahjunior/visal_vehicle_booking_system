import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Approvals from '../pages/admin/Approvals';

// Mock the approvals API functions
vi.mock('../utils/approvals', () => ({
  fetchApprovalBookings: vi.fn(() => Promise.resolve([])),
  approveBookingAPI: vi.fn(),
  declineBookingAPI: vi.fn(),
  formatDate: vi.fn(),
  isPastBooking: vi.fn()
}));

describe('Approvals Component', () => {
  it('renders without crashing', () => {
    render(<Approvals />);
    expect(screen.getByText('Loading booking requests...')).toBeInTheDocument();
  });
});