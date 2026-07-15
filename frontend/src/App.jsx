import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Booking from './pages/Booking'
import ScheduleView from './pages/ScheduleView'
import RootLayout from './components/layout/RootLayout'
import ViewBookings from './pages/ViewBookings'
import HelpSupport from './pages/HelpSupport'
import MyAccount from './pages/MyAccount'
import StaffNotifications from './pages/Notifications'
import AdminRootLayout from './components/layout/AdminRootLayout'
import Dashboard from './pages/admin/Dashboard'
import Approvals from './pages/admin/Approvals'
import Reports from './pages/admin/Reports'
import ProtectedRoute from './pages/login/ProtectedRoutes'
import RegisterStaff from './pages/admin/RegisterStaff'
import StaffMembers from './pages/admin/StaffMembers'
import AuditLog from './pages/admin/AuditLog'
import Settings from './pages/admin/Settings'
import Notifications from './pages/admin/Notifications'
import Support from './pages/admin/Support'
import Broadcast from './pages/admin/Broadcast'
import Changelog from './pages/Changelog'
import ToastContainer from './components/ToastContainer'
import { SettingsProvider } from './hooks/useSettings.js'

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/booking" element={<ProtectedRoute ><RootLayout /></ProtectedRoute>}>
            <Route index element={<Booking />} />
            <Route path="scheduleview" element={<ScheduleView />} />
            <Route path="viewbookings" element={<ViewBookings />} />
            <Route path="help" element={<HelpSupport />} />
            <Route path="account" element={<MyAccount />} />
            <Route path="notifications" element={<StaffNotifications />} />
          </Route>
          <Route path="/admin-dashboard" element={<ProtectedRoute ><AdminRootLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="schedule" element={<ScheduleView />} />
            <Route path="register-staff" element={<RegisterStaff />} />
            <Route path="staff-members" element={<StaffMembers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="support" element={<Support />} />
            <Route path="broadcast" element={<Broadcast />} />
          </Route>
          <Route path="/changelog" element={<Changelog />} />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  )
}

export default App
