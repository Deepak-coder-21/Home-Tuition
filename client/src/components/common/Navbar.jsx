import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  GraduationCap, 
  Search, 
  User, 
  BookOpen, 
  Menu, 
  X, 
  Send, 
  Layers, 
  ChevronDown, 
  LogOut, 
  LogIn, 
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Users,
  Activity,
  Bell,
  Star,
  Sliders,
  Sparkles,
  ExternalLink,
  Scale
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const [studentProfileMenuOpen, setStudentProfileMenuOpen] = useState(false);
  const [adminProfileMenuOpen, setAdminProfileMenuOpen] = useState(false);
  const [adminWorkspaceMenuOpen, setAdminWorkspaceMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentRole, currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const { inquiries } = useSelector((state) => state.inquiries);
  const { tutors } = useSelector((state) => state.tutors || { tutors: [] });
  const settings = useSelector((state) => state.settings?.settings) || {};
  const logoPrefix = settings.logoPrefixText || 'Vidya';
  const logoHighlight = settings.logoHighlightText || 'Nest';
  const siteName = settings.siteName || `${logoPrefix}${logoHighlight}`;

  const isTutorLoggedIn = isAuthenticated && currentRole === 'tutor';
  const isStudentLoggedIn = isAuthenticated && currentRole === 'student';
  const isAdminLoggedIn = isAuthenticated && currentRole === 'admin';

  const matchedTutor = isTutorLoggedIn ? tutors?.find(t => 
    t.id === currentUser?.id || 
    t._id === currentUser?._id || 
    t.user === currentUser?._id || 
    t.user === currentUser?.id || 
    t.email === currentUser?.email ||
    t.id === currentUser?.tutorProfileId ||
    t._id === currentUser?.tutorProfileId
  ) : null;
  const tutorAvatar = currentUser?.avatar || matchedTutor?.avatar;

  // Search parameters for active admin tab
  const searchParams = new URLSearchParams(location.search);
  const rawAdminTab = searchParams.get('tab') || (location.pathname.includes('/cms') || location.pathname.includes('/settings') ? 'settings' : 'overview');
  const currentAdminTab = ['cms', 'website', 'portals', 'governance', 'settings'].includes(rawAdminTab) ? 'settings' : rawAdminTab;

  // Unread/pending count for badge
  const pendingCount = isTutorLoggedIn 
    ? inquiries.filter(i => (i.tutorId === currentUser?.id || i.tutorId === 'tut-101') && i.status === 'pending').length
    : inquiries.filter(i => i.status === 'accepted').length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  React.useEffect(() => {
    setSignInDropdownOpen(false);
    setStudentProfileMenuOpen(false);
    setAdminProfileMenuOpen(false);
    setAdminWorkspaceMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-2.5 sm:top-4 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
      {/* Floating Pill Navigation Island */}
      <nav 
        className={`relative rounded-full transition-all duration-300 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border shadow-lg ${
          isAdminLoggedIn
            ? 'bg-stone-950/95 backdrop-blur-xl border-stone-800 text-white shadow-emerald-950/20'
            : isTutorLoggedIn
            ? 'bg-white/95 backdrop-blur-xl border-stone-200/90 shadow-stone-900/5'
            : 'bg-white/95 backdrop-blur-xl border-stone-200/90 shadow-stone-900/5'
        }`}
      >
        {/* 1. Left: Brand & Logo Pill */}
        <Link 
          to={isAdminLoggedIn ? "/admin/portal" : isTutorLoggedIn ? "/tutor/dashboard" : isStudentLoggedIn ? "/student/dashboard" : "/"} 
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 pl-1"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0 ${
            isAdminLoggedIn 
              ? 'bg-stone-900 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/20' 
              : isTutorLoggedIn 
              ? 'bg-brand-900 text-amber-200' 
              : 'bg-brand-900 text-amber-200'
          }`}>
            {isAdminLoggedIn ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <GraduationCap className="w-5 h-5 text-amber-200" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-serif text-lg sm:text-xl font-bold tracking-tight block leading-tight ${
              isAdminLoggedIn ? 'text-white' : 'text-brand-950'
            }`}>
              {logoPrefix}<span className={isAdminLoggedIn ? "text-emerald-400" : "text-terracotta-600"}>{logoHighlight}</span>
            </span>
            {isAdminLoggedIn && (
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Admin
              </span>
            )}
            {isTutorLoggedIn && (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-brand-900 border border-amber-200">
                Educator
              </span>
            )}
            {isStudentLoggedIn && (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
                Parent/Student
              </span>
            )}
          </div>
        </Link>

        {/* 2. Center: Navigation Links in Embedded Pill Container */}
        {/* Navigation links for Public Visitors */}
        {!isTutorLoggedIn && !isStudentLoggedIn && !isAdminLoggedIn && (
          <div className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-full border border-stone-200/70 shadow-2xs">
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/search')
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${isActive('/search') ? 'text-terracotta-600' : 'text-stone-400'}`} />
              <span>Find a Tutor</span>
            </Link>

            <Link
              to="/how-it-works"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/how-it-works')
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${isActive('/how-it-works') ? 'text-brand-800' : 'text-stone-400'}`} />
              <span>How It Works</span>
            </Link>

            <Link
              to="/tutor/register"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/tutor/login') || isActive('/tutor/register')
                  ? 'bg-white text-brand-900 font-bold shadow-xs border border-stone-200/60' 
                  : 'text-stone-600 hover:text-brand-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${isActive('/tutor/login') || isActive('/tutor/register') ? 'text-brand-700' : 'text-stone-400'}`} />
              <span>Become a Tutor</span>
            </Link>
          </div>
        )}

        {/* Navigation links for Logged In Student */}
        {isStudentLoggedIn && (
          <div className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-full border border-stone-200/70 shadow-2xs">
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/search')
                  ? 'bg-white text-terracotta-700 font-bold shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${isActive('/search') ? 'text-terracotta-600' : 'text-stone-400'}`} />
              <span>Find a Tutor</span>
            </Link>

            <Link
              to="/student/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/student/dashboard') || isActive('/student')
                  ? 'bg-white text-terracotta-700 font-bold shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${isActive('/student/dashboard') || isActive('/student') ? 'text-terracotta-600' : 'text-stone-400'}`} />
              <span>My Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-terracotta-600 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/how-it-works"
              className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/how-it-works')
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>How It Works</span>
            </Link>
          </div>
        )}

        {/* Navigation links for Logged In Tutor */}
        {isTutorLoggedIn && (
          <div className="hidden md:flex items-center gap-1 bg-amber-50/80 p-1 rounded-full border border-amber-200/70 shadow-2xs">
            <Link
              to="/tutor/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive('/tutor/dashboard')
                  ? 'bg-white text-brand-900 font-bold shadow-xs border border-amber-200/60'
                  : 'text-stone-700 hover:text-brand-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Educator Workspace</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500 text-stone-950 rounded-full">
                  {pendingCount} new
                </span>
              )}
            </Link>

            <Link
              to="/search"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>Explore Directory</span>
            </Link>
          </div>
        )}

        {/* Navigation links for Admin */}
        {isAdminLoggedIn && (
          <div className="hidden lg:flex items-center gap-1 bg-stone-900/90 p-1 rounded-full border border-stone-800 shadow-inner">
            <Link
              to="/admin/portal?tab=overview"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                currentAdminTab === 'overview'
                  ? 'bg-stone-800 text-emerald-400 font-bold border border-emerald-500/30 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overview</span>
            </Link>

            <Link
              to="/admin/portal?tab=tutors"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                currentAdminTab === 'tutors'
                  ? 'bg-stone-800 text-emerald-400 font-bold border border-emerald-500/30 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audits & Verification</span>
            </Link>

            <Link
              to="/admin/portal?tab=settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                currentAdminTab === 'settings'
                  ? 'bg-stone-800 text-emerald-400 font-bold border border-emerald-500/30 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Website CMS</span>
            </Link>

            <Link
              to="/search"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/60 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>Public Directory</span>
            </Link>
          </div>
        )}

        {/* 3. Right: Action Pill Buttons */}
        {isTutorLoggedIn ? (
          /* Tutor Logged In Actions */
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/tutor/dashboard"
              className="h-9 px-3.5 rounded-full flex items-center gap-2 hover:bg-stone-100 transition border border-stone-200 bg-white shadow-2xs group"
              title="Tutor Profile & Account"
            >
              {tutorAvatar ? (
                <img
                  src={tutorAvatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-brand-300 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center border border-brand-200 shrink-0">
                  {currentUser?.name?.charAt(0) || 'T'}
                </div>
              )}
              <span className="text-xs font-bold text-stone-900 max-w-[100px] truncate group-hover:text-brand-800 leading-tight">
                {currentUser?.name}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-full transition shadow-2xs cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isStudentLoggedIn ? (
          /* Student Logged In Actions */
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setStudentProfileMenuOpen(!studentProfileMenuOpen)}
                className="h-9 flex items-center gap-2 px-3 rounded-full hover:bg-stone-100 transition border border-stone-200 bg-white shadow-2xs group cursor-pointer"
                title="Student / Parent Options"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-terracotta-300 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-900 font-bold text-xs flex items-center justify-center border border-terracotta-200 shrink-0">
                    {currentUser?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <span className="text-xs font-bold text-stone-900 max-w-[100px] truncate group-hover:text-terracotta-700 leading-tight">
                  {currentUser?.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${studentProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {studentProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setStudentProfileMenuOpen(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2.5 w-72 bg-white border border-stone-200 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {/* Profile Card Header */}
                    <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 bg-warm-50/50 rounded-t-2xl">
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-terracotta-300 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-800 font-bold text-sm flex items-center justify-center border border-terracotta-200 shrink-0">
                          {currentUser?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-stone-900 truncate">
                          {currentUser?.name || 'Vikram Verma'}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          Student: {currentUser?.studentName || 'Arjun Verma'}
                        </div>
                        <div className="text-[10px] font-semibold text-terracotta-700 uppercase tracking-wider">
                          {currentUser?.studentGrade || 'Class 11 - 12'}
                        </div>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/student/dashboard?tab=profile"
                        onClick={() => setStudentProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-terracotta-800 hover:bg-terracotta-50/70 rounded-2xl transition group"
                      >
                        <User className="w-4 h-4 text-terracotta-600" />
                        <span>Update Student Profile</span>
                      </Link>

                      <Link
                        to="/student/dashboard?tab=inquiries"
                        onClick={() => setStudentProfileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Send className="w-4 h-4 text-stone-400" />
                          <span>My Tuition Requests</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-terracotta-600 text-white rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/student/dashboard?tab=connected"
                        onClick={() => setStudentProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl transition"
                      >
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Connected Tutors</span>
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-stone-100 p-1.5">
                      <button
                        onClick={() => {
                          setStudentProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-full transition shadow-2xs cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isAdminLoggedIn ? (
          /* Admin Logged In Actions */
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAdminProfileMenuOpen(!adminProfileMenuOpen);
                  setAdminWorkspaceMenuOpen(false);
                }}
                className="h-9 flex items-center gap-2 px-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white transition shadow-sm border border-stone-800 cursor-pointer"
                title="Administrator Account"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-stone-100 max-w-[90px] truncate leading-tight">
                  {currentUser?.name || 'Admin'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${adminProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {adminProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAdminProfileMenuOpen(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2.5 w-72 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-white"
                    style={{ backgroundColor: '#0c0a09' }}
                  >
                    {/* Identity Card */}
                    <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-white truncate">
                          {currentUser?.name || `${siteName} Administrator`}
                        </div>
                        <div className="text-xs text-stone-400 truncate">
                          {currentUser?.email}
                        </div>
                        <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                          Full Platform Governance
                        </div>
                      </div>
                    </div>

                    {/* Admin Links */}
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/admin/portal?tab=overview"
                        onClick={() => setAdminProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-900 rounded-2xl transition"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Command Center Overview</span>
                      </Link>

                      <Link
                        to="/admin/portal?tab=tutors"
                        onClick={() => setAdminProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-900 rounded-2xl transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Teacher Verification Audits</span>
                      </Link>

                      <Link
                        to="/admin/portal?tab=settings"
                        onClick={() => setAdminProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-900 rounded-2xl transition"
                      >
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span>Website CMS & Portals (Full Control)</span>
                      </Link>
                    </div>

                    {/* Log Out */}
                    <div className="pt-1 mt-1 border-t border-stone-800 p-1.5">
                      <button
                        onClick={() => {
                          setAdminProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-2xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Admin Console</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-red-400 hover:bg-red-950/40 border border-stone-800 rounded-full transition shadow-2xs cursor-pointer"
              title="Log Out of Administration"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Unauthenticated Visitor Actions */
          <div className="hidden md:flex items-center gap-2">
            {/* Unified Sign In Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                className={`h-9 px-3.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                  signInDropdownOpen 
                    ? 'bg-stone-200 text-stone-900 border-stone-300 ring-2 ring-stone-200' 
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border-stone-200/80'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-stone-500" />
                <span>Sign In</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${signInDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {signInDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSignInDropdownOpen(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2.5 w-64 bg-white border border-stone-200 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Sign In to {siteName}
                    </div>
                    <Link
                      to="/student/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-terracotta-50/70 rounded-2xl transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 group-hover:bg-terracotta-600 group-hover:text-white transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-terracotta-700">
                          Student / Parent
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Find & manage home tuitions
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/tutor/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50/70 rounded-2xl transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 group-hover:bg-brand-800 group-hover:text-amber-200 transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-brand-800">
                          Tutor / Educator
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Access educator inquiries
                        </div>
                      </div>
                    </Link>
                    
                    <div className="my-1 border-t border-stone-100" />
                    
                    {/* Platform Admin Sign In */}
                    <Link
                      to="/admin/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50/80 rounded-2xl transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                          <span>Platform Admin</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">Staff</span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Verification & audit console
                        </div>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Single Register CTA Pill */}
            <Link
              to="/student/register"
              className="h-9 px-4 text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 rounded-full shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>
          </div>
        )}

        {/* 4. Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition border ${
              isAdminLoggedIn
                ? 'text-stone-300 hover:text-white hover:bg-stone-900 border-stone-800'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 border-stone-200/80'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Floating Mobile Menu Island */}
      {mobileMenuOpen && (
        <div 
          className={`mt-2 p-4 rounded-3xl border shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isAdminLoggedIn 
              ? 'bg-stone-950 border-stone-800 text-white' 
              : 'bg-white border-stone-200 text-stone-900'
          }`}
          style={{ backgroundColor: isAdminLoggedIn ? '#0c0a09' : '#ffffff' }}
        >
          {isTutorLoggedIn ? (
            /* Tutor-specific mobile menu */
            <div className="space-y-3">
              <Link
                to="/tutor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 transition"
              >
                {tutorAvatar ? (
                  <img
                    src={tutorAvatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-brand-400 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-800 text-amber-200 font-bold text-sm flex items-center justify-center border border-brand-300 shrink-0">
                    {currentUser?.name?.charAt(0) || 'T'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm text-stone-900">{currentUser?.name}</div>
                  <div className="text-xs text-amber-800 font-semibold uppercase tracking-wider">Educator Profile</div>
                </div>
              </Link>

              <Link
                to="/tutor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-brand-800 text-white font-bold text-sm shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>Tutor Dashboard</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-stone-950 rounded-full">
                    {pendingCount} new
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : isStudentLoggedIn ? (
            /* Student-specific mobile menu */
            <div className="space-y-3">
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 transition"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-terracotta-400 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-900 font-bold text-sm flex items-center justify-center border border-terracotta-300 shrink-0">
                    {currentUser?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm text-stone-900">{currentUser?.name}</div>
                  <div className="text-xs text-terracotta-700 font-semibold uppercase tracking-wider">Student / Parent Account</div>
                </div>
              </Link>

              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-2xl transition"
              >
                <Search className="w-4 h-4 text-stone-500" />
                <span>Find a Tutor</span>
              </Link>

              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-terracotta-600 text-white font-bold text-sm shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-terracotta-200" />
                  <span>My Tuition Requests</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-white text-terracotta-800 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-2xl transition"
              >
                <BookOpen className="w-4 h-4 text-stone-500" />
                <span>How It Works</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : isAdminLoggedIn ? (
            /* Dedicated Admin Mobile Menu */
            <div className="space-y-3">
              <div className="p-3 bg-stone-900 text-white rounded-2xl border border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-white truncate">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                    Super Admin • Command Center
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  to="/admin/portal?tab=overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2.5 text-sm font-semibold rounded-2xl transition ${
                    currentAdminTab === 'overview' ? 'bg-stone-900 text-emerald-300 font-bold' : 'text-stone-300 hover:bg-stone-900'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Command Center Overview</span>
                </Link>

                <Link
                  to="/admin/portal?tab=tutors"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2.5 text-sm font-semibold rounded-2xl transition ${
                    currentAdminTab === 'tutors' ? 'bg-stone-900 text-emerald-300 font-bold' : 'text-stone-300 hover:bg-stone-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Teacher Verification Audits</span>
                </Link>

                <Link
                  to="/admin/portal?tab=settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2.5 text-sm font-semibold rounded-2xl transition ${
                    currentAdminTab === 'settings' ? 'bg-stone-900 text-emerald-300 font-bold' : 'text-stone-300 hover:bg-stone-900'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Website CMS & Multi-Portal Controls</span>
                </Link>

                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 text-sm font-semibold text-stone-300 hover:bg-stone-900 rounded-2xl transition"
                >
                  <Search className="w-4 h-4 text-stone-400" />
                  <span>Platform Directory</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-400 bg-red-950/30 hover:bg-red-950/50 rounded-2xl border border-red-900/50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Admin Console</span>
                </button>
              </div>
            </div>
          ) : (
            /* Non-logged in Visitor mobile menu */
            <div className="space-y-2">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-2xl transition"
              >
                <Search className="w-4 h-4 text-terracotta-600" />
                <span>Find a Tutor</span>
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-2xl transition"
              >
                <BookOpen className="w-4 h-4 text-brand-800" />
                <span>How It Works</span>
              </Link>
              <Link
                to="/tutor/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-2xl transition"
              >
                <GraduationCap className="w-4 h-4 text-stone-400" />
                <span>Become a Tutor</span>
              </Link>
              <Link
                to="/terms-and-conditions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-2xl transition"
              >
                <Scale className="w-4 h-4 text-stone-400" />
                <span>Terms & Conditions</span>
              </Link>

              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/student/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition border border-stone-200/80"
                  >
                    <LogIn className="w-3.5 h-3.5 text-stone-400" />
                    <span>Student Sign In</span>
                  </Link>
                  <Link
                    to="/tutor/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition border border-stone-200/80"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                    <span>Tutor Login</span>
                  </Link>
                </div>
                
                {/* Admin Sign In option in mobile */}
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition border border-emerald-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin & Staff Sign In</span>
                </Link>
              </div>

              <Link
                to="/student/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 rounded-full shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
