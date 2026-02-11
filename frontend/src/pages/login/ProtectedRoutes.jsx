import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    // Invalid or expired token
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute;
