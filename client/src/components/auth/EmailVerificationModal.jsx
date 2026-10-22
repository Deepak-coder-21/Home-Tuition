import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RotateCcw, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { isDisposableEmail, isValidEmailFormat, sanitizeErrorMessage } from '../../utils/validation';

export default function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  userName = '',
  onVerified
}) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // Send OTP on initial open if not already sent
  useEffect(() => {
    if (isOpen && email) {
      sendOtp();
    }
  }, [isOpen, email]);

  // Resend Countdown timer
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

  const sendOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    if (!email || !isValidEmailFormat(email)) {
      setErrorMessage('Please enter a valid, complete email address (e.g. name@domain.com).');
      setIsLoading(false);
      return;
    }

    if (isDisposableEmail(email)) {
      setErrorMessage('Disposable or temporary email addresses are not allowed. Please enter your genuine personal or work email.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: userName })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(sanitizeErrorMessage(data.message, 'Failed to send verification code.'));
        setIsLoading(false);
        return;
      }

      setSuccessNotice(`6-digit code sent to ${email}`);
      setResendTimer(60);
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error connecting to email service.');
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-registration-otp', {
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

      setIsLoading(false);
      onVerified(cleanOtp);
      onClose();
    } catch {
      setErrorMessage('Verification request failed. Please check your connection.');
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
            onClick={onClose}
            className="absolute right-4 top-4 text-stone-400 hover:text-white p-1 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-terracotta-500/20 border border-terracotta-500/30 text-terracotta-300">
              <Mail className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Email Verification Required
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold">
            Verify Your Email
          </h3>
          <p className="text-xs text-stone-300 mt-1">
            To prevent spam and protect your account, enter the 6-digit code sent to <strong className="text-white">{email}</strong>.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sanitizeErrorMessage(errorMessage)}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full text-center text-2xl font-mono font-bold tracking-[10px] py-3 px-4 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
              />
              <p className="text-[11px] text-stone-500 mt-2 text-center">
                Check inbox and spam folder. Code expires in 10 minutes.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-500">
                {resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
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
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
