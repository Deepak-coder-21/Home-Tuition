import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, registerStudent, clearAuthError } from '../store/slices/authSlice';
import { useLocationData } from '../hooks/useLocationData';
import { lookupPincode, getPincodeLocation } from '../services/locationService';
import SearchablePlaceSelect from '../components/common/SearchablePlaceSelect';
import { CLASSES_LIST, BOARDS_LIST } from '../data/mockData';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';
import { isDisposableEmail, isValidEmailFormat, checkPasswordStrength, sanitizeErrorMessage } from '../utils/validation';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import PolicyAgreementCheckbox from '../components/common/PolicyAgreementCheckbox';
import {
  Users,
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Home,
  Compass,
  ArrowLeft
} from 'lucide-react';

export default function StudentAuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode');
  const [authMode, setAuthMode] = useState(urlMode || initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regError, setRegError] = useState('');

  // Policy agreement & strong password state
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  // Brevo OTP and Password Reset modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');

  useEffect(() => {
    if (urlMode) {
      setAuthMode(urlMode);
    } else if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [urlMode, initialMode]);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { authError, accounts } = useSelector((state) => state.auth);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Register Form state
  const [studentForm, setStudentForm] = useState({
    name: '', // parent name
    studentName: '',
    studentGrade: CLASSES_LIST[2] || 'Class 9-10 (Secondary)',
    board: 'CBSE',
    state: 'Delhi NCR',
    city: 'New Delhi',
    locality: '',
    houseLocation: '',
    phone: '',
    email: '',
    password: ''
  });

  // Location API hook
  const studentLoc = useLocationData(studentForm.state, studentForm.city);
  const [studentPincode, setStudentPincode] = useState('');
  const [isLookingUpStudentPin, setIsLookingUpStudentPin] = useState(false);

  const handleStudentPinLookup = async (pin) => {
    setStudentPincode(pin);
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    if (/^\d{6}$/.test(cleaned)) {
      setIsLookingUpStudentPin(true);
      const loc = await getPincodeLocation(cleaned, studentLoc.states);
      setIsLookingUpStudentPin(false);
      if (loc && loc.matchedState) {
        setStudentForm(prev => ({
          ...prev,
          state: loc.matchedState,
          city: loc.matchedDistrict || loc.district,
          locality: loc.places?.[0]?.name ? `${loc.places[0].name}` : prev.locality
        }));
      }
    }
  };


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError('');
    dispatch(clearAuthError());

    // 1. Try backend MongoDB API login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword, role: 'student' })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(sanitizeErrorMessage(data.message, 'Invalid email or password.'));
        setIsSubmitting(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }
      dispatch(login({
        user: data.user,
        role: 'student'
      }));
      setIsSubmitting(false);
      const destination = location.state?.from?.pathname || '/student/dashboard';
      navigate(destination, { replace: true });
    } catch {
      // Offline fallback: check local Redux accounts
      const matched = accounts.find(
        acc => acc.email?.toLowerCase() === loginEmail.trim().toLowerCase() && 
               acc.password === loginPassword &&
               acc.role === 'student'
      );
      if (matched) {
        dispatch(login({
          user: matched,
          role: 'student'
        }));
        setIsSubmitting(false);
        const destination = location.state?.from?.pathname || '/student/dashboard';
        navigate(destination, { replace: true });
      } else {
        setRegError('Unable to connect to authentication server. Please check your network and credentials.');
        setIsSubmitting(false);
      }
    }
  };

  const proceedRegistrationWithOtp = async (otpCode) => {
    setIsSubmitting(true);
    setRegError('');
    dispatch(clearAuthError());

    const studentPayload = {
      name: studentForm.name.trim(),
      studentName: studentForm.studentName.trim(),
      studentGrade: studentForm.studentGrade,
      board: studentForm.board,
      state: studentForm.state,
      city: studentForm.city,
      locality: studentForm.locality,
      pincode: studentPincode?.trim() || '',
      houseLocation: studentForm.houseLocation.trim() || '',
      phone: studentForm.phone.trim(),
      email: studentForm.email.trim(),
      password: studentForm.password,
      otp: otpCode, // Mandatory verification code
      agreedToPolicy: true, // Mandatory agreement
      agreedToPolicyAt: new Date().toISOString(),
      role: 'student'
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(sanitizeErrorMessage(data.message, 'Registration failed. Please check your information.'));
        setIsSubmitting(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }
      dispatch(registerStudent({
        id: data.user?._id || `usr-student-${Date.now()}`,
        ...studentPayload,
        agreedToPolicy: true,
        agreedToPolicyAt: data.user?.agreedToPolicyAt || studentPayload.agreedToPolicyAt,
        agreedToPolicyDate: data.user?.agreedToPolicyDate || '',
        agreedToPolicyTime: data.user?.agreedToPolicyTime || '',
        agreedToPolicyFormatted: data.user?.agreedToPolicyFormatted || ''
      }));
      setIsSubmitting(false);
      const destination = location.state?.from?.pathname || '/student/dashboard';
      navigate(destination, { replace: true });
    } catch {
      setRegError('Connection error during registration. Please check your network and try again.');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setPolicyError(false);

    // 1. Email syntax and realness validation
    if (!studentForm.email || !isValidEmailFormat(studentForm.email)) {
      setRegError('Please enter a valid, complete email address (e.g. name@domain.com).');
      return;
    }

    // 2. Reject fake / burner / temporary disposable emails
    if (isDisposableEmail(studentForm.email)) {
      setRegError('Disposable, burner, or temporary email addresses are not allowed. Please use your real personal email.');
      return;
    }

    // 3. Enforce strong password
    const passCheck = checkPasswordStrength(studentForm.password, studentForm.email);
    if (!passCheck.isValid) {
      setRegError('Please create a strong password that satisfies all security rules (8+ chars, upper, lower, number & symbol).');
      return;
    }

    // 4. Enforce mandatory platform policy agreement
    if (!agreedToPolicy) {
      setPolicyError(true);
      setRegError('You must review and agree to VidyaNest platform policies and guidelines before completing registration.');
      return;
    }

    // 5. MANDATORY OTP: User must verify email via Brevo OTP before registering
    if (!verifiedOtp) {
      setIsOtpModalOpen(true);
      return;
    }

    await proceedRegistrationWithOtp(verifiedOtp);
  };



  return (
    <div className="min-h-[calc(100vh-5rem)] bg-warm-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span>Are you an educator?</span>
            <Link
              to="/tutor/login"
              className="font-bold text-brand-800 hover:text-brand-900 underline"
            >
              Tutor Portal →
            </Link>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero Sidebar */}
          <div className="lg:col-span-5 bg-gradient-to-br from-terracotta-700 via-terracotta-800 to-brand-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Users className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 block mb-1">
                  Parent & Student Portal
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  Find the Best Home Tutors for Your Child
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  Connect directly with 100% verified educators near your home. No agency markups or hidden fees.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>100% Degree & ID Verified:</strong> Every tutor is manually screened.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Home className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>At-Home 1-on-1 Sessions:</strong> Safe, personalized mentoring at your doorstep.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-200 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>Free Demo Consultations:</strong> Discuss syllabus and match before committing.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  dispatch(clearAuthError());
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authMode === 'login'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  dispatch(clearAuthError());
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authMode === 'register'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Create Student Account
              </button>
            </div>

            {/* Error Banner */}
            {(authError || regError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{sanitizeErrorMessage(regError || authError)}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Parent / Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. parent@example.com"
                      className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs py-2.5 pl-10 pr-10 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as Parent / Student</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Parent / Guardian Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        placeholder="e.g. Suman Sharma"
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Student Name
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={studentForm.studentName}
                        onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Grade / Class
                    </label>
                    <select
                      value={studentForm.studentGrade}
                      onChange={(e) => setStudentForm({ ...studentForm, studentGrade: e.target.value })}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                    >
                      {CLASSES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Board / Curriculum
                    </label>
                    <select
                      value={studentForm.board}
                      onChange={(e) => setStudentForm({ ...studentForm, board: e.target.value })}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                    >
                      {BOARDS_LIST.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Box */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                      Home Location Details
                    </span>
                  </div>

                  {/* 6-Digit PIN Code */}
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={studentPincode}
                        onChange={(e) => handleStudentPinLookup(e.target.value)}
                        placeholder="Enter 6-digit PIN to auto-detect State & District..."
                        className="w-full text-xs py-1.5 pl-3 pr-8 rounded-lg border border-stone-300 focus:border-terracotta-600 outline-none bg-white"
                      />
                      {isLookingUpStudentPin && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta-600 absolute right-2.5 top-2" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={studentForm.state}
                      onChange={(e) => {
                        const s = e.target.value;
                        setStudentForm(prev => ({ ...prev, state: s, city: '', locality: '' }));
                      }}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="">Select State ({studentLoc.states.length})</option>
                      {studentLoc.states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                      value={studentForm.city}
                      onChange={(e) => {
                        const c = e.target.value;
                        setStudentForm(prev => ({ ...prev, city: c, locality: '' }));
                      }}
                      disabled={!studentForm.state || studentLoc.isLoadingDistricts}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-300 bg-white disabled:opacity-60"
                    >
                      <option value="">
                        {studentForm.state 
                          ? (studentLoc.isLoadingDistricts ? 'Loading districts...' : `Select District (${studentLoc.districts.length})`)
                          : 'Choose state first'}
                      </option>
                      {studentLoc.districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Village / Place Select */}
                  <div>
                    <SearchablePlaceSelect
                      value={studentForm.locality}
                      onChange={(place) => setStudentForm(prev => ({ ...prev, locality: place }))}
                      places={studentLoc.places}
                      cityName={studentForm.city}
                      placeholder={
                        !studentForm.city 
                          ? "Select a District above first..."
                          : studentLoc.isLoadingPlaces 
                          ? `Loading places in ${studentForm.city}...`
                          : `Search village, town, or locality in ${studentForm.city}...`
                      }
                      isLoading={studentLoc.isLoadingPlaces}
                      disabled={!studentForm.city}
                    />
                  </div>

                  {/* House Location */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Actual Location of House (House / Flat No., Street, Landmark)
                    </label>
                    <input
                      type="text"
                      required
                      value={studentForm.houseLocation}
                      onChange={(e) => setStudentForm({ ...studentForm, houseLocation: e.target.value })}
                      placeholder="e.g. Flat 302, Sunrise Heights, Near Metro Gate 2"
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Contact & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Email Address
                      </label>
                      {verifiedOtp ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>OTP Verified</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!studentForm.email || !isValidEmailFormat(studentForm.email)) {
                              setRegError('Please enter a valid, complete email address (e.g. name@domain.com) first.');
                              return;
                            }
                            if (isDisposableEmail(studentForm.email)) {
                              setRegError('Disposable or temporary email addresses are not permitted. Please use your genuine email.');
                              return;
                            }
                            setRegError('');
                            setIsOtpModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-terracotta-600 hover:text-terracotta-700 hover:underline cursor-pointer"
                        >
                          Verify with OTP
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, email: e.target.value });
                          setVerifiedOtp(''); // Invalidate OTP if email changes
                          setRegError('');
                        }}
                        placeholder="parent@example.com"
                        className={`w-full text-xs py-2 pl-9 pr-3 rounded-xl border outline-none bg-stone-50/50 ${
                          studentForm.email && isDisposableEmail(studentForm.email)
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-stone-300 focus:border-terracotta-600'
                        }`}
                      />
                    </div>
                    {studentForm.email && isDisposableEmail(studentForm.email) && (
                      <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Disposable/burner emails are not allowed. Please use your real email.</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Set Strong Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      placeholder="At least 8 characters with upper, lower, number & symbol"
                      className="w-full text-xs py-2 pl-9 pr-10 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter & Real-time Checklist */}
                  <PasswordStrengthIndicator password={studentForm.password} email={studentForm.email} />
                </div>

                {/* Mandatory Platform Policy Agreement Checkbox */}
                <PolicyAgreementCheckbox
                  id="student-policy-agreement"
                  role="student"
                  checked={agreedToPolicy}
                  onChange={(val) => {
                    setAgreedToPolicy(val);
                    if (val) setPolicyError(false);
                  }}
                  hasError={policyError}
                  errorMessage="You must agree to the platform policies to complete registration."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Student Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom role switch */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-3">
              <div className="flex items-center gap-1.5">
                <span>Looking to teach instead?</span>
                <Link
                  to="/tutor/register"
                  className="font-bold text-brand-800 hover:text-brand-900 flex items-center gap-1"
                >
                  <span>Register as a Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <Link
                to="/admin/login"
                className="font-semibold text-stone-500 hover:text-emerald-700 flex items-center gap-1.5 transition text-[11px]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Sign In</span>
              </Link>
            </div>

        </div>
        </div>
      </div>

      {/* Forgot Password Modal (Brevo Email OTP) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={loginEmail}
      />

      {/* Registration Mandatory Email OTP Verification Modal */}
      <EmailVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={studentForm.email}
        userName={studentForm.name || studentForm.studentName}
        onVerified={(otpCode) => {
          setVerifiedOtp(otpCode);
          setIsOtpModalOpen(false);
          proceedRegistrationWithOtp(otpCode);
        }}
      />
    </div>
  );
}
