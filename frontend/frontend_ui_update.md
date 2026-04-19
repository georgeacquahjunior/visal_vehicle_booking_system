# Frontend UI Documentation

## Overview
This document describes the updated frontend UI for the `visal_vehicle_booking_system` project. It focuses on the React/Vite application under `frontend/` and is intended to be updated over time as the UI evolves.

## Purpose
- Capture the current screen structure, navigation, and key UI components.
- Help developers, designers, and maintainers understand the frontend layout and flows.
- Provide an easy place to record UI changes and update notes.

## Application Structure
- `src/App.jsx` — main route configuration using `react-router-dom`.
- `src/components` — shared UI containers and common components.
- `src/pages` — feature pages for user and admin workflows.
- `src/utils` — helper functions for booking validation, login, notifications, and approvals.
- `src/assets` — static assets such as logo and images.

## Route Map
- `/` — `Login` screen.
- `/booking` — `Booking` flow inside `RootLayout`.
  - `/booking` — `Booking` page.
  - `/booking/scheduleview` — `ScheduleView` page.
  - `/booking/viewbookings` — `ViewBookings` page.
- `/admin-dashboard` — `AdminRootLayout`.
  - `/admin-dashboard` — `Dashboard` page.
  - `/admin-dashboard/approvals` — `Approvals` page.
  - `/admin-dashboard/register-staff` — `RegisterStaff` page.
  - `/admin-dashboard/reports` — `Reports` page.
- `/changelog` — `Changelog` page.

## Core Layouts and Shell

### RootLayout
File: `src/components/layout/RootLayout.jsx`
- Provides the main staff dashboard shell.
- Contains the left sidebar (`Navbar`) and a top bar.
- Supports sidebar collapse for a compact view.
- Top bar includes:
  - Sidebar toggle menu button
  - Dashboard title and subtitle
  - Refresh button (reloads page)
  - Notification bell with unread badge
  - Logout button
- Renders child page content via `Outlet`.

### AdminRootLayout
File: `src/components/layout/AdminRootLayout.jsx`
- Provides the main admin dashboard shell.
- Uses `AdminNavbar` for admin-specific navigation.
- Top bar includes:
  - Sidebar toggle menu button
  - Admin Dashboard title and subtitle
  - Refresh button (reloads page)
  - Logout button
- Shows admin user info and navigation in sidebar.

## Navigation Components

### Navbar
File: `src/components/navbar/Navbar.jsx`
- Vertical sidebar for staff roles.
- Links:
  - `New Booking`
  - `View Schedule`
  - `My Bookings`
- Displays a branded logo and user avatar.
- Uses `NavLink` active state styling.
- Supports collapsed state for a smaller sidebar.

### AdminNavbar
File: `src/pages/admin/adminNavbar/AdminNavbar.jsx`
- Vertical sidebar for admins.
- Links:
  - `Overview`
  - `Approvals`
  - `Register Staff`
  - `Reports`
- Displays admin branding and user initials.
- Supports collapsed state.

### NotificationBell
File: `src/components/notifications/NotificationBell.jsx`
- Bell icon with unread badge count.
- Dropdown list of notifications.
- Marks notifications as read on open or via "Mark all as read".
- Supports empty state messaging when no notifications exist.

## Pages and UX Flows

### Login
File: `src/pages/login/Login.jsx`
- Login form for staff/admin access.
- Fields: Staff/Admin ID, password.
- Password visibility toggle.
- Left side: form and branding.
- Right side: marketing-style image card with UI/UX messaging.
- Uses `loginUser` helper from `src/utils/login.js`.

### Booking
File: `src/pages/booking/Booking.jsx`
- Primary booking request form.
- Inputs:
  - `Booking Date`
  - `Start Time`
  - `End Time`
  - `Destination`
  - `Purpose`
  - `Notes`
- Frontend validation includes:
  - required fields
  - time window validation via `src/utils/bookings.js`
- Submits booking request to `/bookings/create_booking`.
- Includes summary feature cards for schedule, destination, and approval.

### ScheduleView
File: `src/pages/scheduleView/ScheduleView.jsx`
- Calendar-like schedule display.
- Week view with 30-minute timeslots.
- Filters bookings by status.
- Highlights active schedule cards and current time.
- Fetches schedule data from `/bookings/schedule_view`.
- Handles declined/cancelled bookings by filtering them out.

### ViewBookings
File: `src/pages/viewbookings/ViewBookings.jsx`
- Personal booking history dashboard.
- Search and status filter controls:
  - All, Approved, Pending, Declined.
- Displays booking cards with:
  - date, time, location, purpose, notes, status.
- Supports incremental list loading with pagination.

### Admin Dashboard
File: `src/pages/admin/dashboard/Dashboard.jsx`
- Admin overview for pending approvals and staff metrics.
- Fetches pending bookings and user list from backend.
- Shows key stats:
  - pending requests
  - approved queue
  - active staff count
  - admin count
- Approve/decline actions available directly from the dashboard.

### Approvals
File: `src/pages/admin/approvals/Approvals.jsx`
- Approval management center.
- Search and filter booking requests.
- Booking action dialogs for approve/decline.
- Displays booking details and status badges.
- Includes action messaging and error handling.

### Register Staff
File: `src/pages/admin/registerStaff/RegisterStaff.jsx`
- Staff registration form for admins.
- Sections:
  - **Personal Information**: Staff ID, Full Name, Email, Phone Number
  - **Account Security**: Password with visibility toggle (eye/eye-off icon)
  - **Role & Department**: Department dropdown and Role selector
- Features:
  - Password visibility toggle for secure input
  - Submit button with loading state
  - Cancel button to navigate back
  - Success/error modals for feedback
- Sends registration data to `/auth/register`.

### Reports
File: `src/pages/admin/reports/Reports.jsx`
- Admin reports page.
- Features a "Coming Soon" overlay with messaging:
  - Informs admins that reports are under construction
  - Modern frosted glass card design
  - Positioned above dashboard content
- Backend structure includes:
  - Mock booking data with status filters
  - Summary metric cards (Total, Approved, Pending, Declined, Duration, Purpose)
  - Filter panel for date range, staff member, status
  - CSV export functionality
  - Charts section for analytics visualization (BarChart, PieChart, LineChart)

### Changelog
File: `src/pages/Changelog.jsx`
- Displays UI changelog content.
- Provides a route for release notes and change history.

## Styling and UI Framework
- Project uses Tailwind CSS for layout, plus component-scoped CSS files.
- Key CSS files:
  - `src/App.css`
  - `src/index.css`
  - page-specific CSS files under `src/pages/*/*.css`
  - component CSS files under `src/components/*/*.css`
- `vite.config.js` is configured for React and Tailwind.

## API Integration Patterns
- Common API base: `http://127.0.0.1:5000`
- Authentication token stored in `localStorage.access_token`.
- Staff session details stored in `localStorage`:
  - `staff_id`
  - `full_name`
  - `role`
- Most pages fetch data via `fetch()` and map backend payloads to UI-friendly fields.
- Error handling uses local page state to render fallback messages.

## Test Credentials

The following dummy credentials are available for local testing and development:

### Admin User
- **Staff ID**: `ADMIN001`
- **Full Name**: Test Admin
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: admin
- **Department**: Admin

### Normal Staff User
- **Staff ID**: `STAFF001`
- **Full Name**: Normal Staff
- **Email**: `staff@example.com`
- **Password**: `password123`
- **Role**: staff
- **Department**: HR

### Additional Staff User (for testing bookings)
- **Staff ID**: `101`
- **Full Name**: Test User
- **Email**: `test@example.com`
- **Password**: `password123`
- **Role**: staff
- **Department**: IT

**Note**: Passwords are hashed in the database. Use the plain text values above to log in via the login page at `http://localhost:5173`.

## Future Update Guidelines
Use this section to keep the UI doc accurate as the frontend evolves.

1. Update route changes immediately.
   - Add new pages to the `Route Map`.
   - Add new sidebar links to `Navbar` or `AdminNavbar` sections.
2. Add or remove components.
   - If a new shared component is introduced, add a section under `Core Layouts and Shell` or `Navigation Components`.
3. Keep page descriptions in sync.
   - Add new UX flows, filters, and key fields for each page.
   - Add details for any new API endpoints or validation flows.
4. Track visual updates.
   - Note major changes to branding, page hero layout, cards, tables, or status badge colors.
5. Refresh the `Last updated` date below.

## Change Log / Notes
- `2026-04-15`: Initial frontend UI documentation created.
- `2026-04-19`: 
  - Added refresh button to staff and admin dashboard top bars
  - Added password visibility toggle (eye icon) to Register Staff form
  - Added "Coming Soon" overlay to Reports page
  - Fixed button hover styling on Register Staff form

---

> This file is kept as the single source of truth for the frontend UI layout and major component flows. Update it whenever a page, navigation flow, or styling system changes.
