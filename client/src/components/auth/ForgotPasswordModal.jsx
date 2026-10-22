import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { isDisposableEmail, isValidEmailFormat, checkPasswordStrength, sanitizeErrorMessage } from '../../utils/validation';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const resetState = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessNotice('');
    setResendTimer(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Send OTP to email via Brevo
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || !isValidEmailFormat(email)) {
      setErrorMessage('Please enter a valid, complete email address (e.g. name@domain.com).');
      return;
    }

    if (isDisposableEmail(email)) {
      setErrorMessage('Disposable or temporary email addresses are not permitted. Please use your registered email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(sanitizeErrorMessage(data.message, 'Unable to send reset code. Please check your email.'));
        setIsLoading(false);
        return;
      }

      setSuccessNotice(`Verification code sent to ${email.trim()}`);
      setStep(2);
      setResendTimer(60);
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error connecting to email service. Please try again.');
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(sanitizeErrorMessage(data.message, 'Invalid or expired code.'));
        setIsLoading(false);
        return;
      }

      setStep(3);
      setSuccessNotice('Code verified. You can now set your new password.');
      setIsLoading(false);
    } catch {
      setErrorMessage('Verification failed. Please check your connection.');
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    const passCheck = checkPasswordStrength(newPassword, email);
    if (!passCheck.isValid) {
      setErrorMessage('Please choose a strong password that meets all 4 security criteria (8+ chars, uppercase, lowercase, number, symbol).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type carefully.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(sanitizeErrorMessage(data.message, 'Password reset failed. Please try again.'));
        setIsLoading(false);
        return;
      }

      setStep(4);
      setIsLoading(false);
    } catch {
      setErrorMessage('Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-950 text-white p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-stone-400 hover:text-white p-1 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-terracotta-500/20 border border-terracotta-500/30 text-terracotta-300">
              <KeyRound className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Security & Verification
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold">
            {step === 4 ? 'Password Updated!' : 'Reset Account Password'}
          </h3>
          <p className="text-xs text-stone-300 mt-1">
            {step === 1 && 'Enter your registered email to receive a secure Brevo email verification code.'}
            {step === 2 && `Enter the 6-digit code delivered to ${email}.`}
            {step === 3 && 'Choose a strong, secure new password for your account.'}
            {step === 4 && 'Your credentials have been updated. You can now log in.'}
          </p>

          {/* Stepper Progress Bar */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-1.5">
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${
                    step >= s ? 'bg-terracotta-500' : 'bg-white/20'
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sanitizeErrorMessage(errorMessage)}</span>
            </div>
          )}

          {successNotice && step < 4 && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code via Brevo...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter & Verify 6-digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-terracotta-600 hover:underline font-semibold"
                  >
                    Change Email
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center text-xl font-mono font-bold tracking-[8px] py-2.5 px-4 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 text-center">
                  Check your inbox and spam/junk folder. Valid for 10 minutes.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-500">
                  {resendTimer > 0 ? (
                    `Resend code in ${resendTimer}s`
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend Code</span>
                    </button>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Set Strong Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters with upper, lower, number & symbol"
                    className="w-full text-xs py-2.5 pl-10 pr-10 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Real-time Password Strength Meter */}
                <PasswordStrengthIndicator password={newPassword} email={email} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900">
                  Password Reset Successfully!
                </h4>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Your new password is now active. You can log in securely to access your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
