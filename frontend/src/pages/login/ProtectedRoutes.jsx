import { Navigate } from "react-router-dom";
import { clearSession, getTokenExpiryMs } from "../../utils/session.js";

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token");

  if (!role || !token) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs !== null && expiryMs <= Date.now()) {
    // Token already expired (e.g. tab reopened after the timeout)
    clearSession();
    return <Navigate to="/" replace state={{ sessionExpired: true }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but not allowed
    return <Navigate to="/" replace />;
  }

  // User is allowed
  return children;
}

export default ProtectedRoute;
