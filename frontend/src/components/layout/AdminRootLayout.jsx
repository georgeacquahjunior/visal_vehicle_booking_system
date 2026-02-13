import AdminNavbar from '../../pages/admin/adminNavbar/AdminNavbar'
import { Outlet } from 'react-router-dom'

function AdminRootLayout() {
  return (
  
  <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}>
      <AdminNavbar />
      <div style={{ flex: 1, minHeight: '100vh' }}>
        <Outlet />   
      </div>
  </div>

  )
}

export default AdminRootLayout