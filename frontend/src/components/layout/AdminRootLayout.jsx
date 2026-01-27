import AdminNavbar from '../../pages/admin/adminNavbar/AdminNavbar'
import { Outlet } from 'react-router-dom'

function AdminRootLayout() {
  return (
    <div>
        <div style={{ display: 'flex' }}>
                <AdminNavbar />
                <div style={{ flex: 1 }}>
                    <Outlet />   
                </div>
            </div>
    </div>
  )
}

export default AdminRootLayout