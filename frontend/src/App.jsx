import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Booking from './pages/booking/Booking'
import ScheduleView from './pages/scheduleView/ScheduleView'
import RootLayout from './components/layout/RootLayout'
import ViewBookings from './pages/viewbookings/ViewBookings'
import AdminRootLayout from './components/layout/AdminRootLayout'
import Dashboard from './pages/admin/dashboard/Dashboard'
import Approvals from './pages/admin/approvals/Approvals'
import Reports from './pages/admin/reports/Reports'
import ProtectedRoute from './pages/login/ProtectedRoutes'

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
        <Route path="/admin_dashboard" element={<AdminRootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
