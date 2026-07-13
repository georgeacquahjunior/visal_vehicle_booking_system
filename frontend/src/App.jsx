import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Booking from './pages/Booking'
import ScheduleView from './pages/ScheduleView'
import RootLayout from './components/layout/RootLayout'
import ViewBookings from './pages/ViewBookings'
import AdminRootLayout from './components/layout/AdminRootLayout'
import Dashboard from './pages/admin/Dashboard'
import Approvals from './pages/admin/Approvals'
import Reports from './pages/admin/Reports'
import ProtectedRoute from './pages/login/ProtectedRoutes'
import RegisterStaff from './pages/admin/RegisterStaff'
import StaffMembers from './pages/admin/StaffMembers'
import Changelog from './pages/Changelog'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/booking" element={<ProtectedRoute ><RootLayout /></ProtectedRoute>}>
          <Route index element={<Booking />} />
          <Route path="scheduleview" element={<ScheduleView />} />
          <Route path="viewbookings" element={<ViewBookings />} />
        </Route>
        <Route path="/admin-dashboard" element={<ProtectedRoute ><AdminRootLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="schedule" element={<ScheduleView />} />
          <Route path="register-staff" element={<RegisterStaff />} />
          <Route path="staff-members" element={<StaffMembers />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/changelog" element={<Changelog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
