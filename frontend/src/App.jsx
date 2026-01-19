import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Booking from './pages/booking/Booking'
import ScheduleView from './pages/scheduleView/ScheduleView'
import RootLayout from './components/layout/RootLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/booking" element={<RootLayout />}>
          <Route index element={<Booking />} />
          <Route path="scheduleview" element={<ScheduleView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
