/* === [START DEMO LOGIN FEATURE - DemoModeBanner.jsx] ===
 * To remove demo login completely: delete this file (or remove <DemoModeBanner /> in App.jsx).
 */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { loginAsDemo } from '../../services/demoAuth';
import { 
  Eye, 
  ShieldAlert, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  Info
} from 'lucide-react';

export default function DemoModeBanner() {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isAuthenticated || !currentUser?.isDemo) {
    return null;
  }

  const role = currentUser?.role;
  const roleName = 
    role === 'tutor' ? 'Teacher / Educator' :
    role === 'admin' ? 'Platform Administrator' :
    'Student / Parent';

  const handleRoleSwitch = async (targetRole) => {
    if (targetRole === role || isSwitching) return;
    setIsSwitching(true);
    try {
      await loginAsDemo({ role: targetRole, dispatch, navigate });
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleExitDemo = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-100 border-b border-amber-500/30 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-full">
          
          {/* Left: Role Badge & Safety Notice */}
          <div className="flex items-center gap-2 min-w-0 max-w-full">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-sm shrink-0">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Visitor Demo
            </span>
            <div className="text-xs text-stone-200 truncate">
              <span className="font-semibold text-white">Role:</span>{' '}
              <span className="font-bold text-amber-300">{roleName}</span>
              <span className="hidden md:inline text-stone-300 text-[11px] ml-2">
                • Safe preview mode: changes will <strong className="text-white underline decoration-amber-400">NOT</strong> be saved in demo login.
              </span>
            </div>
          </div>

          {/* Right: Quick Switcher and Exit Button */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="hidden lg:inline text-[11px] text-amber-200/70 font-medium mr-1">
              Switch role:
            </span>

            {role !== 'student' && (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleSwitch('student')}
                className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg border border-stone-700 transition flex items-center gap-1 cursor-pointer"
                title="Switch to Demo Student session"
              >
                <Users className="w-3 h-3 text-emerald-400" />
                <span>Student</span>
              </button>
            )}

            {role !== 'tutor' && (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleSwitch('tutor')}
                className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg border border-stone-700 transition flex items-center gap-1 cursor-pointer"
                title="Switch to Demo Teacher session"
              >
                <GraduationCap className="w-3 h-3 text-amber-400" />
                <span>Teacher</span>
              </button>
            )}

            {role !== 'admin' && (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleSwitch('admin')}
                className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg border border-stone-700 transition flex items-center gap-1 cursor-pointer"
                title="Switch to Demo Administrator session"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExitDemo}
              className="px-2 py-1 text-[10px] sm:text-[11px] font-bold bg-amber-500/20 hover:bg-red-500/30 text-amber-200 hover:text-red-200 rounded-lg border border-amber-500/40 hover:border-red-400/50 transition flex items-center gap-1 cursor-pointer"
              title="Exit demo visiting session"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit Demo</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
