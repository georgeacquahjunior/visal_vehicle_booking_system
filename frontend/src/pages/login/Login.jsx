import "./Login.css";
import logo from '../../assets/visal_logo.webp'
import arrow_forward from '../../assets/arrow_forward.svg'
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  return (
    <main className="login-wrapper">
      {/* Card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="logo-box">
            <img src={logo} alt="visal logo" srcset="" />
          </div>
          <h1>VISAL VEHICLE BOOKING</h1>
          <p>Please enter your details to sign in to vehicle booking portal.</p>
        </div>

        {/* Form */}
        <form className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="user@company.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="********" />
          </div>

          {/* future update for forgot password */}

          {/* <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div> */}

          <button type="submit" className="login-btn" onClick={()=> navigate('/booking')}>
            Sign In <img src={arrow_forward} alt="arrow forward" />
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>Having trouble?</p>
          <a href="#">Contact Admin</a>
          <small>© 2026 Vehicle Booking System | Vaarde Consult</small>
        </div>
      </div>
    </main>
  );
}

export default Login;
