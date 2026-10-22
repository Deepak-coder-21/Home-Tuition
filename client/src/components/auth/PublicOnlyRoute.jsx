import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PublicOnlyRoute Guard
 * 
 * Prevents already-authenticated users from getting trapped on login/registration
 * pages, seamlessly redirecting them to their respective active dashboard
 * or the page they originally intended to visit.
 * 
 * @param {string} [role] - Optional specific role for this auth page (e.g. 'student', 'tutor', 'admin')
 * @param {string} [redirectPath] - Optional custom destination
 * @param {React.ReactNode} [children] - Component(s) to render if not authenticated
 */
export default function PublicOnlyRoute({ role, redirectPath, children }) {
  const location = useLocation();
  const { isAuthenticated, currentUser, currentRole } = useSelector((state) => state.auth);

  if (isAuthenticated && currentUser) {
    // If a specific role is designated and matches, or if this is a general auth route
    if (!role || role === currentRole) {
      // If user came from a protected page, send them back there
      if (location.state?.from?.pathname) {
        return <Navigate to={location.state.from.pathname} replace />;
      }

      if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
      }

      switch (currentRole) {
        case 'admin':
          return <Navigate to="/admin/portal" replace />;
        case 'tutor':
          return <Navigate to="/tutor/dashboard" replace />;
        case 'student':
        default:
          return <Navigate to="/student/dashboard" replace />;
      }
    }
  }

  return children ? children : <Outlet />;
}
