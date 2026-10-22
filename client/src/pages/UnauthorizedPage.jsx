import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  ShieldAlert, 
  ArrowLeft, 
  LayoutDashboard, 
  LogIn, 
  GraduationCap, 
  Users, 
  ShieldCheck,
  Home
} from 'lucide-react';

export default function UnauthorizedPage({ allowedRoles = [], currentRole: propRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentRole: storeRole, currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';

  const currentRole = propRole || storeRole;

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/portal';
      case 'tutor':
        return '/tutor/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  const getLoginPath = (roles) => {
    if (roles?.includes('admin')) return '/admin/login';
    if (roles?.includes('tutor')) return '/tutor/login';
    if (roles?.includes('student')) return '/student/login';
    return '/login';
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return `${siteName} Administrator`;
      case 'tutor':
        return 'Verified Educator / Tutor';
      case 'student':
        return 'Student or Parent';
      default:
        return role || 'Guest';
    }
  };

  const allowedRolesText = allowedRoles.length > 0 
    ? allowedRoles.map(r => getRoleLabel(r)).join(' or ')
    : 'Authorized Personnel';


  const handleLogoutAndSwitch = () => {
    dispatch(logout());
    navigate(getLoginPath(allowedRoles), { state: { from: location } });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-warm-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        
        {/* Top Warning Banner Accent */}
        <div className="h-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-terracotta-600" />

        <div className="p-6 sm:p-10 text-center">
          {/* Badge Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-amber-600 shadow-inner mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>HTTP 403 · Access Restricted</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
            Permission Required
          </h1>

          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            This workspace is strictly protected and designated for{' '}
            <span className="font-bold text-stone-900">{allowedRolesText}</span>.
            {isAuthenticated ? (
              <>
                <br className="hidden sm:inline" /> You are currently logged in as{' '}
                <strong className="text-stone-900">{currentUser?.name || 'User'}</strong> with the{' '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800 text-xs uppercase tracking-wide">
                  {currentRole}
                </span>{' '}
                role.
              </>
            ) : (
              ' Please sign in with an account having suitable permissions.'
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {isAuthenticated && currentRole && (
              <Link
                to={getDashboardPath(currentRole)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span>Return to My Dashboard</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogoutAndSwitch}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition"
            >
              <LogIn className="w-4 h-4 text-stone-600" />
              <span>Sign In as {allowedRoles[0] ? allowedRoles[0].toUpperCase() : 'Different User'}</span>
            </button>
          </div>


          {/* Secondary links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-stone-500">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-stone-900 transition">
              <Home className="w-3.5 h-3.5" />
              Public Homepage
            </Link>
            <span>•</span>
            <Link to="/search" className="hover:text-stone-900 transition">
              Browse Tutors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
