import './Navbar.css'
import logo from '../../assets/visal_logo.webp'
import { NavLink} from 'react-router-dom';

function Navbar() {
  return (
    <div>
        {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="" />
          <div>
            <h2>Visal Vehicle Booking</h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <nav className="nav">
            <NavLink to="/booking" end>New Booking</NavLink>
            <NavLink to="scheduleview">View Schedule</NavLink>
            <NavLink to="/mybookings">My Bookings</NavLink>
            <NavLink to="/" className="logout">Log Out</NavLink>
        </nav>
      </aside>
    </div>
  )
}

export default Navbar