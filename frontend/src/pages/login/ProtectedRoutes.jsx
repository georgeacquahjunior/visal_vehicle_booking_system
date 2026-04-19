import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  if (!role) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but not allowed
    return <Navigate to="/" replace />;
  }

  // User is allowed
  return children;
}

export default ProtectedRoute;
