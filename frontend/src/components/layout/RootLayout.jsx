import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../navbar/Navbar'

function RootLayout() {
  return (
    <div style={{ display: 'flex' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
            <Outlet />   
        </div>
        {/* <Footer /> */}
    </div>
  )
}

export default RootLayout