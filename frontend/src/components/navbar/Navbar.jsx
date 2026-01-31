import './Navbar.css'
import logo from '../../assets/visal_logo.webp'
import { NavLink} from 'react-router-dom';

function Navbar() {
  return (
    <div>
        {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-login">
          <img src={logo} alt="" />
          <div>
            <h2>Visal Vehicle Booking</h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <nav className="nav-login">
            <NavLink to="/booking" end><i class="far fa-calendar-check"></i>New Booking</NavLink>
            <NavLink to="scheduleview"><i class="fas fa-calendar-alt"></i>View Schedule</NavLink>
            <NavLink to="viewbookings"><i class="fas fa-list"></i>My Bookings</NavLink>
            <NavLink to="/" className="logout"><i class="fas fa-door-open"></i>Log Out</NavLink>
        </nav>
      </aside>
    </div>
  )
}

export default Navbar