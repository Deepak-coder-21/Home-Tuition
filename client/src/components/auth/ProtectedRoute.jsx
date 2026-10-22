import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

/**
 * ProtectedRoute Guard
 * 
 * Ensures the user is logged in, and optionally validates that their current role
 * is authorized. If unauthenticated, smoothly redirects to the appropriate login page.
 * If authorized role is violated, presents the Unauthorized access screen.
 * 
 * @param {Array<string>} [allowedRoles] - e.g. ['student'], ['tutor'], ['admin']
 * @param {string} [redirectPath] - Optional override for unauthenticated redirect
 * @param {React.ReactNode} [children] - Component(s) to render if authorized
 */
export default function ProtectedRoute({ allowedRoles, redirectPath, children }) {
  const location = useLocation();
  const { isAuthenticated, currentUser, currentRole } = useSelector((state) => state.auth);

  // 1. Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    let targetLogin = redirectPath;

    if (!targetLogin) {
      if (allowedRoles?.includes('admin')) {
        targetLogin = '/admin/login';
      } else if (allowedRoles?.includes('tutor')) {
        targetLogin = '/tutor/login';
      } else if (allowedRoles?.includes('student')) {
        targetLogin = '/student/login';
      } else {
        targetLogin = '/login';
      }
    }

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // 2. Check if user role is permitted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <UnauthorizedPage allowedRoles={allowedRoles} currentRole={currentRole} />;
  }

  // 3. User is authorized
  return children ? children : <Outlet />;
}
