import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../store/slices/authSlice';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import { sanitizeErrorMessage } from '../utils/validation';

export default function AdminAuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { authError, isAuthenticated, currentRole } = useSelector((state) => state.auth);

  const getDestination = () => {
    const from = location.state?.from;
    if (!from) return '/admin/dashboard';
    if (typeof from === 'string') return from;
    return `${from.pathname || '/admin/dashboard'}${from.search || ''}`;
  };

  // If authenticated as admin, redirect to target or admin dashboard
  useEffect(() => {
    if (isAuthenticated && currentRole === 'admin') {
      navigate(getDestination(), { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate, location.state]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    dispatch(clearAuthError());

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          role: 'admin'
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(sanitizeErrorMessage(data.message, 'Invalid administrator credentials.'));
        return;
      }

      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }

      dispatch(login({
        user: data.user,
        role: 'admin'
      }));

      navigate(getDestination(), { replace: true });
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Network error connecting to the authentication server. Please check your connection and try again.');
    }
  };



  return (
    <div className="min-h-[calc(100vh-5rem)] bg-warm-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Top return link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Website
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            Internal Staff Only
          </span>
        </div>

        {/* Card Box */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                Platform Administrator
              </h1>
              <p className="text-stone-400 text-xs mt-1">
                Tutor Background Audits, Degree Verification & Platform Moderation
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {(errorMessage || authError) && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{sanitizeErrorMessage(errorMessage || authError, 'Invalid administrator credentials.')}</span>
            </div>
          )}





          {/* Secure Admin Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Admin Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your administrator email"
                  className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-700 bg-stone-900 text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs py-2.5 pl-10 pr-10 rounded-xl border border-stone-700 bg-stone-900 text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick switch to other portals */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <Link to="/student/login" className="hover:text-stone-200 transition">
              ← Student Sign In
            </Link>
            <Link to="/tutor/login" className="hover:text-stone-200 transition">
              Tutor Login →
            </Link>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal (Brevo Email OTP) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={loginEmail}
      />
    </div>
  );
}
