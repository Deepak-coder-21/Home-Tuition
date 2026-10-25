import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, registerTutor, clearAuthError } from '../store/slices/authSlice';
import { addNewTutor } from '../store/slices/tutorsSlice';
import { useLocationData } from '../hooks/useLocationData';
import { lookupPincode, getPincodeLocation } from '../services/locationService';
import {
  SUBJECTS_LIST,
  CLASSES_LIST,
  BOARDS_LIST,
  TEACHING_MODES,
  QUALIFICATIONS_LIST
} from '../data/mockData';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';
import { isDisposableEmail, isValidEmailFormat, checkPasswordStrength, sanitizeErrorMessage } from '../utils/validation';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import PolicyAgreementCheckbox from '../components/common/PolicyAgreementCheckbox';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  BookOpen,
  IndianRupee,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Camera,
  Upload,
  Loader2,
  Briefcase,
  Layers,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

export default function TutorAuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode');
  const [authMode, setAuthMode] = useState(urlMode || initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Policy agreement & strong password state
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  // Brevo OTP and Password Reset modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Tutor Register Form state
  const [tutorForm, setTutorForm] = useState({
    name: '',
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
    tagline: '',
    qualification: QUALIFICATIONS_LIST[0] || 'B.Tech / B.E.',
    experienceYears: 5,
    state: 'Delhi NCR',
    city: 'New Delhi',
    localities: '',
    houseLocation: '',
    subjects: ['Mathematics'],
    classes: [CLASSES_LIST[2] || 'Class 9-10 (Secondary)'],
    boards: ['CBSE', 'ICSE / ISC'],
    modes: ['home_visit', 'online'],
    hourlyRate: 625,
    monthlyRate: 7500,
    phone: '',
    email: '',
    password: '',
    bio: ''
  });

  // Dynamic Location API
  const tutorLoc = useLocationData(tutorForm.state, tutorForm.city);
  const [tutorPincode, setTutorPincode] = useState('');
  const [isLookingUpTutorPin, setIsLookingUpTutorPin] = useState(false);

  const handleTutorPinLookup = async (pin) => {
    setTutorPincode(pin);
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    if (/^\d{6}$/.test(cleaned)) {
      setIsLookingUpTutorPin(true);
      const loc = await getPincodeLocation(cleaned, tutorLoc.states);
      setIsLookingUpTutorPin(false);
      if (loc && loc.matchedState) {
        setTutorForm(prev => ({
          ...prev,
          state: loc.matchedState,
          city: loc.matchedDistrict || loc.district
        }));
      }
    }
  };

  const handleTutorPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTutorForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    dispatch(clearAuthError());

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword, role: 'tutor' })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(sanitizeErrorMessage(data.message, 'Invalid email or password for tutor login.'));
        return;
      }
      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }
      dispatch(login({
        user: data.user,
        role: 'tutor'
      }));
      const destination = location.state?.from?.pathname || '/tutor/dashboard';
      navigate(destination, { replace: true });
    } catch {
      setIsSubmitting(false);
      setFormError('Unable to connect to authentication server. Please check your connection.');
    }
  };

  const proceedTutorRegistrationWithOtp = async (otpCode) => {
    setIsSubmitting(true);
    setFormError('');
    dispatch(clearAuthError());

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'tutor',
          name: tutorForm.name.trim(),
          email: tutorForm.email.trim(),
          password: tutorForm.password,
          otp: otpCode, // Mandatory verification code
          agreedToPolicy: true, // Mandatory agreement
          agreedToPolicyAt: new Date().toISOString(),
          phone: tutorForm.phone.trim(),
          tagline: tutorForm.tagline.trim(),
          qualification: tutorForm.qualification,
          experienceYears: Number(tutorForm.experienceYears) || 3,
          state: tutorForm.state,
          city: tutorForm.city,
          pincode: tutorPincode?.trim() || '',
          pincodes: tutorPincode?.trim() ? [tutorPincode.trim()] : [],
          localities: tutorForm.localities ? tutorForm.localities.split(',').map(s => s.trim()).filter(Boolean) : [],
          subjects: tutorForm.subjects,
          classes: tutorForm.classes,
          boards: tutorForm.boards,
          modes: tutorForm.modes,
          monthlyRate: Number(tutorForm.monthlyRate) || 7500,
          hourlyRate: Number(tutorForm.hourlyRate) || 625,
          bio: tutorForm.bio.trim()
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(sanitizeErrorMessage(data.message, 'Registration failed. Please check your information.'));
        return;
      }

      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }

      const cleanPin = tutorPincode?.trim() || '';
      const newTutorId = data.user?.tutorProfileId || data.user?._id || `tut-${Date.now()}`;
      const newTutorObject = {
        id: newTutorId,
        _id: newTutorId,
        name: tutorForm.name.trim(),
        tagline: tutorForm.tagline || `${tutorForm.qualification} Educator`,
        avatar: tutorForm.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
        rating: 5.0,
        reviewCount: 0,
        experienceYears: Number(tutorForm.experienceYears) || 3,
        qualification: tutorForm.qualification,
        isVerified: false,
        verificationStatus: 'unverified',
        verificationDetails: {
          idProof: "Pending Upload",
          degreeProof: "Pending Upload",
          addressProof: "Pending Upload",
          verifiedAt: null
        },
        verificationDocuments: [],
        location: {
          state: tutorForm.state,
          city: tutorForm.city,
          houseLocation: tutorForm.houseLocation || '',
          localities: tutorForm.localities.split(',').map(s => s.trim()).filter(Boolean),
          pincodes: cleanPin ? [cleanPin] : [],
          pincode: cleanPin
        },
        pincode: cleanPin,
        modes: tutorForm.modes,
        subjects: tutorForm.subjects,
        classes: tutorForm.classes,
        boards: tutorForm.boards,
        rates: {
          monthly: Number(tutorForm.monthlyRate) || 7500,
          hourly: Number(tutorForm.hourlyRate) || 625
        },
        bio: tutorForm.bio || "Dedicated educator committed to conceptual clarity and student confidence.",
        achievements: [
          "Newly registered educator on VidyaNest",
          "Comprehensive 1-on-1 personalized teaching methodology"
        ],
        reviews: [],
        agreedToPolicy: true,
        agreedToPolicyAt: data.user?.agreedToPolicyAt || new Date().toISOString(),
        agreedToPolicyDate: data.user?.agreedToPolicyDate || '',
        agreedToPolicyTime: data.user?.agreedToPolicyTime || '',
        agreedToPolicyFormatted: data.user?.agreedToPolicyFormatted || ''
      };

      dispatch(addNewTutor(newTutorObject));
      dispatch(registerTutor({
        ...newTutorObject,
        id: data.user?._id || newTutorObject.id,
        _id: data.user?._id || newTutorObject.id,
        password: tutorForm.password,
        phone: tutorForm.phone,
        email: tutorForm.email,
        agreedToPolicy: true,
        agreedToPolicyAt: data.user?.agreedToPolicyAt || newTutorObject.agreedToPolicyAt,
        agreedToPolicyDate: data.user?.agreedToPolicyDate || '',
        agreedToPolicyTime: data.user?.agreedToPolicyTime || '',
        agreedToPolicyFormatted: data.user?.agreedToPolicyFormatted || ''
      }));
      navigate('/tutor/dashboard?tab=verification&welcome=true');
    } catch {
      setIsSubmitting(false);
      setFormError('Unable to connect to registration server. Please check your network.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setPolicyError(false);

    // 1. Email syntax and realness validation
    if (!tutorForm.email || !isValidEmailFormat(tutorForm.email)) {
      setFormError('Please enter a valid, complete email address (e.g. name@domain.com).');
      return;
    }

    // 2. Reject fake / disposable burner emails
    if (isDisposableEmail(tutorForm.email)) {
      setFormError('Disposable, burner, or temporary email addresses are not permitted. Please use your genuine email.');
      return;
    }

    // 3. Enforce strong password
    const passCheck = checkPasswordStrength(tutorForm.password, tutorForm.email);
    if (!passCheck.isValid) {
      setFormError('Please create a strong password that meets all 4 security criteria (8+ chars, upper, lower, number & symbol).');
      return;
    }

    // 4. Enforce mandatory platform policy agreement
    if (!agreedToPolicy) {
      setPolicyError(true);
      setFormError('You must review and agree to VidyaNest platform policies and guidelines before completing registration.');
      return;
    }

    // 5. MANDATORY OTP: Educator must verify email before registering
    if (!verifiedOtp) {
      setIsOtpModalOpen(true);
      return;
    }

    await proceedTutorRegistrationWithOtp(verifiedOtp);
  };



  const toggleSubject = (subj) => {
    const subjects = tutorForm.subjects.includes(subj)
      ? tutorForm.subjects.filter(s => s !== subj)
      : [...tutorForm.subjects, subj];
    setTutorForm({ ...tutorForm, subjects });
  };

  const toggleClass = (cls) => {
    const classes = tutorForm.classes.includes(cls)
      ? tutorForm.classes.filter(c => c !== cls)
      : [...tutorForm.classes, cls];
    setTutorForm({ ...tutorForm, classes });
  };

  const toggleBoard = (board) => {
    const boards = tutorForm.boards.includes(board)
      ? tutorForm.boards.filter(b => b !== board)
      : [...tutorForm.boards, board];
    setTutorForm({ ...tutorForm, boards });
  };

  const toggleMode = (modeId) => {
    const modes = tutorForm.modes.includes(modeId)
      ? tutorForm.modes.filter(m => m !== modeId)
      : [...tutorForm.modes, modeId];
    if (modes.length === 0) return;
    setTutorForm({ ...tutorForm, modes });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-warm-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span>Looking for a tutor?</span>
            <Link
              to="/student/login"
              className="font-bold text-terracotta-600 hover:text-terracotta-700 underline"
            >
              Parent & Student Portal →
            </Link>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero Sidebar */}
          <div className="lg:col-span-5 bg-gradient-to-br from-brand-900 via-brand-950 to-stone-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 block mb-1">
                  Educator Portal
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  Teach Students Near You & Keep 100% of Fees
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  Join India's most trusted 1-on-1 tutoring network. Connect directly with parents in your neighborhood.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>Zero Commission:</strong> Keep 100% of the tuition money you earn.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>Flexible Schedule:</strong> Choose your preferred timings, subjects, and fees.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-200">
                    <strong>Verified Educator Badge:</strong> Gain trust and attract premium students.
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
                Tutor Sign In
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
                Apply as a Tutor
              </button>
            </div>

            {/* Error Banner */}
            {(formError || authError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{sanitizeErrorMessage(formError || authError)}</span>
              </div>
            )}

            {/* TUTOR SIGN IN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Registered Tutor Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. tutor@example.com"
                      className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
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
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
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
                      className="w-full text-xs py-2.5 pl-10 pr-10 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
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
                  className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In to Educator Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Tutor Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TUTOR REGISTRATION */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Photo Upload */}
                <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <img
                    src={tutorForm.avatar}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-300 shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-800 block">Profile Picture</span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 hover:border-brand-700 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-stone-500" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTutorPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={tutorForm.name}
                        onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Verma"
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      required
                      value={tutorForm.experienceYears}
                      onChange={(e) => setTutorForm({ ...tutorForm, experienceYears: e.target.value })}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Highest Qualification
                    </label>
                    <select
                      value={tutorForm.qualification}
                      onChange={(e) => setTutorForm({ ...tutorForm, qualification: e.target.value })}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                    >
                      {QUALIFICATIONS_LIST.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Headline / Tagline
                    </label>
                    <input
                      type="text"
                      value={tutorForm.tagline}
                      onChange={(e) => setTutorForm({ ...tutorForm, tagline: e.target.value })}
                      placeholder="e.g. Senior IIT-JEE Mathematics Expert"
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
                    />
                  </div>
                </div>

                {/* Subjects Multi-select */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Subjects You Teach (Click to toggle)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {SUBJECTS_LIST.map((subj) => {
                      const isSel = tutorForm.subjects.includes(subj);
                      return (
                        <button
                          type="button"
                          key={subj}
                          onClick={() => toggleSubject(subj)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                            isSel
                              ? 'bg-brand-800 text-white shadow-2xs'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {subj} {isSel ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Teaching Modes & Monthly Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Teaching Mode
                    </label>
                    <div className="space-y-1 bg-stone-50 p-2 rounded-xl border border-stone-200">
                      {TEACHING_MODES.map((mode) => (
                        <label key={mode.id} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tutorForm.modes.includes(mode.id)}
                            onChange={() => toggleMode(mode.id)}
                            className="rounded text-brand-700 focus:ring-brand-700"
                          />
                          <span>{mode.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Monthly Package Rate (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        required
                        value={tutorForm.monthlyRate}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTutorForm({
                            ...tutorForm,
                            monthlyRate: val,
                            hourlyRate: Math.round(val / 12)
                          });
                        }}
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50 font-bold text-stone-900"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      Approx. ~₹{Math.round(tutorForm.monthlyRate / 12)} / hour
                    </span>
                  </div>
                </div>

                {/* Location Box */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-700" />
                      Tutor Operational Area & Address
                    </span>
                  </div>

                  {/* 6-Digit PIN Code Quick Search */}
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={tutorPincode}
                        onChange={(e) => handleTutorPinLookup(e.target.value)}
                        placeholder="Enter 6-digit PIN to auto-detect State & District..."
                        className="w-full text-xs py-1.5 pl-3 pr-8 rounded-lg border border-stone-300 focus:border-brand-700 outline-none bg-white"
                      />
                      {isLookingUpTutorPin && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700 absolute right-2.5 top-2" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={tutorForm.state}
                      onChange={(e) => {
                        const s = e.target.value;
                        setTutorForm(prev => ({ ...prev, state: s, city: '' }));
                      }}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="">Select State ({tutorLoc.states.length})</option>
                      {tutorLoc.states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                      value={tutorForm.city}
                      onChange={(e) => {
                        const c = e.target.value;
                        setTutorForm(prev => ({ ...prev, city: c }));
                      }}
                      disabled={!tutorForm.state || tutorLoc.isLoadingDistricts}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-300 bg-white disabled:opacity-60"
                    >
                      <option value="">
                        {tutorForm.state 
                          ? (tutorLoc.isLoadingDistricts ? 'Loading districts...' : `Select District (${tutorLoc.districts.length})`)
                          : 'Choose state first'}
                      </option>
                      {tutorLoc.districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Localities You Visit (Comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={tutorForm.localities}
                      onChange={(e) => setTutorForm({ ...tutorForm, localities: e.target.value })}
                      placeholder="e.g. Rohini Sector 9, Pitampura, Model Town"
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Actual Location of House / Office Address
                    </label>
                    <input
                      type="text"
                      required
                      value={tutorForm.houseLocation}
                      onChange={(e) => setTutorForm({ ...tutorForm, houseLocation: e.target.value })}
                      placeholder="e.g. House No. 45, Street 3, Landmark"
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-white"
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
                        value={tutorForm.phone}
                        onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
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
                            if (!tutorForm.email || !isValidEmailFormat(tutorForm.email)) {
                              setFormError('Please enter a valid, complete email address (e.g. name@domain.com) first.');
                              return;
                            }
                            if (isDisposableEmail(tutorForm.email)) {
                              setFormError('Disposable or temporary email addresses are not permitted. Please use your genuine email.');
                              return;
                            }
                            setFormError('');
                            setIsOtpModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-brand-800 hover:text-brand-900 hover:underline cursor-pointer"
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
                        value={tutorForm.email}
                        onChange={(e) => {
                          setTutorForm({ ...tutorForm, email: e.target.value });
                          setVerifiedOtp(''); // Invalidate OTP if email changes
                          setFormError('');
                        }}
                        placeholder="tutor@example.com"
                        className={`w-full text-xs py-2 pl-9 pr-3 rounded-xl border outline-none bg-stone-50/50 ${
                          tutorForm.email && isDisposableEmail(tutorForm.email)
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-stone-300 focus:border-brand-700'
                        }`}
                      />
                    </div>
                    {tutorForm.email && isDisposableEmail(tutorForm.email) && (
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
                      value={tutorForm.password}
                      onChange={(e) => setTutorForm({ ...tutorForm, password: e.target.value })}
                      placeholder="At least 8 characters with upper, lower, number & symbol"
                      className="w-full text-xs py-2 pl-9 pr-10 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
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
                  <PasswordStrengthIndicator password={tutorForm.password} email={tutorForm.email} />
                </div>

                {/* Mandatory Platform Policy Agreement Checkbox */}
                <PolicyAgreementCheckbox
                  id="tutor-policy-agreement"
                  role="tutor"
                  checked={agreedToPolicy}
                  onChange={(val) => {
                    setAgreedToPolicy(val);
                    if (val) setPolicyError(false);
                  }}
                  hasError={policyError}
                  errorMessage="You must agree to the platform policies to submit your tutor application."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Tutor Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Tutor Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom student link */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-3">
              <div className="flex items-center gap-1.5">
                <span>Looking for a private tutor instead?</span>
                <Link
                  to="/student/register"
                  className="font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
                >
                  <span>Student Registration</span>
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
        email={tutorForm.email}
        userName={tutorForm.name}
        onVerified={(otpCode) => {
          setVerifiedOtp(otpCode);
          setIsOtpModalOpen(false);
          proceedTutorRegistrationWithOtp(otpCode);
        }}
      />
    </div>
  );
}
