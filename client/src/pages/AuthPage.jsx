import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { login, registerStudent, registerTutor, clearAuthError } from '../store/slices/authSlice';
import { addNewTutor } from '../store/slices/tutorsSlice';
import { useLocationData } from '../hooks/useLocationData';
import { lookupPincode, getLiveDistricts } from '../services/locationService';
import SearchablePlaceSelect from '../components/common/SearchablePlaceSelect';
import {
  SUBJECTS_LIST,
  CLASSES_LIST,
  BOARDS_LIST,
  TEACHING_MODES,
  QUALIFICATIONS_LIST,
  QUALIFICATIONS_CATEGORIES
} from '../data/mockData';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
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
  Search
} from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') || 'student';

  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'student' | 'tutor' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Policy states
  const [studentAgreed, setStudentAgreed] = useState(false);
  const [tutorAgreed, setTutorAgreed] = useState(false);
  const [studentPolicyError, setStudentPolicyError] = useState(false);
  const [tutorPolicyError, setTutorPolicyError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { authError, isAuthenticated, currentRole } = useSelector((state) => state.auth);

  // If already or newly authenticated, redirect appropriately
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
        return;
      }
      if (currentRole === 'admin') navigate('/admin/portal', { replace: true });
      else if (currentRole === 'tutor') navigate('/tutor/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate, location.state]);


  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Register Form state
  const [studentForm, setStudentForm] = useState({
    name: '', // parent name
    studentName: '',
    studentGrade: CLASSES_LIST[2], // Class 9-10
    board: 'CBSE',
    state: 'Delhi NCR',
    city: 'New Delhi',
    locality: '',
    houseLocation: '',
    phone: '',
    email: '',
    password: ''
  });

  // Tutor Register Form state
  const [tutorForm, setTutorForm] = useState({
    name: '',
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
    tagline: '',
    qualification: QUALIFICATIONS_LIST[0],
    experienceYears: 5,
    state: 'Delhi NCR',
    city: 'New Delhi',
    localities: '',
    houseLocation: '',
    subjects: ['Mathematics'],
    classes: [CLASSES_LIST[2], CLASSES_LIST[3]],
    boards: ['CBSE', 'ICSE / ISC'],
    modes: ['home_visit', 'online'],
    hourlyRate: 625,
    monthlyRate: 7500,
    phone: '',
    email: '',
    password: '',
    bio: ''
  });

  // Dynamic Location API Hooks
  const studentLoc = useLocationData(studentForm.state, studentForm.city);
  const tutorLoc = useLocationData(tutorForm.state, tutorForm.city);
  const [studentPincode, setStudentPincode] = useState('');
  const [isLookingUpStudentPin, setIsLookingUpStudentPin] = useState(false);
  const [tutorPincode, setTutorPincode] = useState('');
  const [isLookingUpTutorPin, setIsLookingUpTutorPin] = useState(false);

  const handleStudentPinLookup = async (pin) => {
    setStudentPincode(pin);
    if (/^\d{6}$/.test(pin.trim())) {
      setIsLookingUpStudentPin(true);
      const res = await lookupPincode(pin.trim());
      setIsLookingUpStudentPin(false);
      if (res && res.state) {
        setStudentForm(prev => ({
          ...prev,
          state: res.state,
          city: res.district,
          locality: res.places?.[0]?.name ? `${res.places[0].name}` : prev.locality
        }));
      }
    }
  };

  const handleTutorPinLookup = async (pin) => {
    setTutorPincode(pin);
    if (/^\d{6}$/.test(pin.trim())) {
      setIsLookingUpTutorPin(true);
      const res = await lookupPincode(pin.trim());
      setIsLookingUpTutorPin(false);
      if (res && res.state) {
        setTutorForm(prev => ({
          ...prev,
          state: res.state,
          city: res.district
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormError('');
    dispatch(clearAuthError());
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
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          role: selectedRole === 'admin' ? 'admin' : selectedRole
        })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(sanitizeErrorMessage(data.message, 'Invalid email or password.'));
        return;
      }
      if (data.token) {
        localStorage.setItem('vidyanest_token', data.token);
      }
      dispatch(login({
        user: data.user,
        role: data.user.role
      }));
    } catch {
      setIsSubmitting(false);
      setFormError('Unable to connect to authentication server. Please check your network connection.');
    }
  };

  const handleStudentRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setStudentPolicyError(false);

    // 1. Email check
    if (!studentForm.email || !isValidEmailFormat(studentForm.email)) {
      setFormError('Please enter a valid, complete email address (e.g. name@domain.com).');
      return;
    }
    if (isDisposableEmail(studentForm.email)) {
      setFormError('Disposable or temporary email addresses are not permitted.');
      return;
    }

    // 2. Strong password check
    const passCheck = checkPasswordStrength(studentForm.password, studentForm.email);
    if (!passCheck.isValid) {
      setFormError('Please create a strong password that meets all 4 security criteria (8+ chars, upper, lower, number & symbol).');
      return;
    }

    // 3. Policy agreement check
    if (!studentAgreed) {
      setStudentPolicyError(true);
      setFormError('You must review and agree to the platform policy and safety guidelines to register.');
      return;
    }

    setIsSubmitting(true);
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
      agreedToPolicy: true,
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
      setIsSubmitting(false);

      if (!res.ok) {
        setFormError(sanitizeErrorMessage(data.message, 'Registration failed. Please check your information.'));
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
    } catch {
      setIsSubmitting(false);
      setFormError('Unable to connect to registration server. Please check your network connection.');
    }
  };

  const handleTutorRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setTutorPolicyError(false);

    // 1. Email check
    if (!tutorForm.email || !isValidEmailFormat(tutorForm.email)) {
      setFormError('Please enter a valid, complete email address (e.g. name@domain.com).');
      return;
    }
    if (isDisposableEmail(tutorForm.email)) {
      setFormError('Disposable or temporary email addresses are not permitted.');
      return;
    }

    // 2. Strong password check
    const passCheck = checkPasswordStrength(tutorForm.password, tutorForm.email);
    if (!passCheck.isValid) {
      setFormError('Please create a strong password that meets all 4 security criteria (8+ chars, upper, lower, number & symbol).');
      return;
    }

    // 3. Policy agreement check
    if (!tutorAgreed) {
      setTutorPolicyError(true);
      setFormError('You must review and agree to the platform policy and safety guidelines to register.');
      return;
    }

    setIsSubmitting(true);
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
          agreedToPolicy: true,
          agreedToPolicyAt: new Date().toISOString(),
          phone: tutorForm.phone.trim(),
          tagline: tutorForm.tagline.trim(),
          qualification: tutorForm.qualification,
          experienceYears: Number(tutorForm.experienceYears) || 3,
          state: tutorForm.state,
          city: tutorForm.city,
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
        verificationDetails: {
          idProof: "Government ID Uploaded (Under Review)",
          degreeProof: "Degree Certificate Uploaded (Under Review)",
          addressProof: "Locality Address Proof Uploaded",
          verifiedAt: null
        },
        location: {
          state: tutorForm.state,
          city: tutorForm.city,
          houseLocation: tutorForm.houseLocation || '',
          localities: tutorForm.localities.split(',').map(s => s.trim()).filter(Boolean),
          pincodes: []
        },
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
          "Newly verified educator on VidyaNest",
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
    } catch {
      setIsSubmitting(false);
      setFormError('Unable to connect to registration server. Please check your network connection.');
    }
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

  const handleApplyPrimaryPreset = () => {
    setTutorForm({
      ...tutorForm,
      qualification: "D.El.Ed / D.Ed (Diploma in Elementary Education)",
      classes: ["Class 1 - 5 (Primary)"],
      subjects: [
        "All Primary Subjects (Class 1 - 5 General: Maths, English, EVS, Hindi)",
        "Handwriting, Phonics & Reading",
        "Environmental Studies (EVS)"
      ],
      tagline: "Dedicated Primary Teacher | All General Subjects (Class 1-5)",
      hourlyRate: 500,
      monthlyRate: 5500
    });
  };

  const toggleBoard = (b) => {
    const boards = tutorForm.boards.includes(b)
      ? tutorForm.boards.filter(item => item !== b)
      : [...tutorForm.boards, b];
    setTutorForm({ ...tutorForm, boards });
  };

  const toggleMode = (m) => {
    const modes = tutorForm.modes.includes(m)
      ? tutorForm.modes.filter(item => item !== m)
      : [...tutorForm.modes, m];
    setTutorForm({ ...tutorForm, modes });
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">

      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-brand-800 text-amber-200 flex items-center justify-center shadow">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Vidya<span className="text-terracotta-600">Nest</span>
          </span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          {authMode === 'login'
            ? 'Sign in to access your tuition inquiries, schedules, and verified tutor network.'
            : 'Join India\'s most trusted community of parents, students, and home tutors.'}
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-elevated overflow-hidden">

        {/* Top Toggle: Sign In vs Register */}
        <div className="grid grid-cols-2 border-b border-stone-200 text-center font-bold text-sm bg-warm-50/50">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); dispatch(clearAuthError()); }}
            className={`py-4 transition ${authMode === 'login'
                ? 'bg-white text-brand-900 border-b-2 border-brand-800'
                : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedRole === 'tutor') {
                navigate('/tutor/register');
              } else {
                navigate('/student/register');
              }
            }}
            className="py-4 transition text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            Register Account
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-6">

          {/* Role Selection Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${selectedRole === 'student'
                    ? 'border-terracotta-600 bg-terracotta-50/50 text-stone-900'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedRole === 'student' ? 'bg-terracotta-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Student / Parent</div>
                  <div className="text-[10px] text-stone-500 leading-tight mt-0.5">Find home tutors</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('tutor')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${selectedRole === 'tutor'
                    ? 'border-brand-800 bg-brand-50/50 text-stone-900'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedRole === 'tutor' ? 'bg-brand-800 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Tutor / Teacher</div>
                  <div className="text-[10px] text-stone-500 leading-tight mt-0.5">Provide tuition</div>
                </div>
              </button>

              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 col-span-2 sm:col-span-1 ${selectedRole === 'admin'
                      ? 'border-emerald-700 bg-emerald-50/50 text-stone-900'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedRole === 'admin' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Admin Portal</div>
                    <div className="text-[10px] text-stone-500 leading-tight mt-0.5">Verification staff</div>
                  </div>
                </button>
              )}
            </div>
          </div>



          {/* Auth Error Notification */}
          {(formError || authError) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{sanitizeErrorMessage(formError || authError)}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: LOGIN FORM                                    */}
          {/* ======================================================== */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'tutor'
                        ? 'tutor@vidyanest.com'
                        : selectedRole === 'admin'
                          ? 'admin@domain.com'
                          : 'student@vidyanest.com'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-brand-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-terracotta-600 hover:text-terracotta-700 font-semibold cursor-pointer hover:underline"
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
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-brand-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to {selectedRole === 'student' ? 'Parent' : selectedRole === 'tutor' ? 'Tutor' : 'Admin'} Dashboard</span>
                )}
              </button>

            </form>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: STUDENT / PARENT REGISTRATION                 */}
          {/* ======================================================== */}
          {authMode === 'register' && selectedRole === 'student' && (
            <form onSubmit={handleStudentRegisterSubmit} className="space-y-4">
              <div className="bg-terracotta-50/70 border border-terracotta-200/70 p-3 rounded-xl text-xs text-terracotta-900 flex items-start gap-2">
                <Users className="w-4 h-4 text-terracotta-700 shrink-0 mt-0.5" />
                <span>
                  Registering as a <strong>Parent / Student</strong> allows you to book home visits, review tutor credentials, and track session inquiries without commission.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parent / Guardian Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="e.g. Meera Kapur"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Student's Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.studentName}
                    onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })}
                    placeholder="e.g. Rhea Kapur"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Student Grade / Class</label>
                  <select
                    value={studentForm.studentGrade}
                    onChange={(e) => setStudentForm({ ...studentForm, studentGrade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none bg-white"
                  >
                    {CLASSES_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Curriculum / Board</label>
                  <select
                    value={studentForm.board}
                    onChange={(e) => setStudentForm({ ...studentForm, board: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none bg-white"
                  >
                    {BOARDS_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Selection with Free PIN Code & India Post Live API */}
              <div className="p-3.5 rounded-2xl bg-warm-50/70 border border-warm-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                    Student Address & Locality
                  </span>
                </div>

                {/* Quick 6-digit PIN Code Lookup */}
                <div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={studentPincode}
                      onChange={(e) => handleStudentPinLookup(e.target.value)}
                      placeholder="Enter 6-digit PIN code to auto-detect State, District & Village (e.g. 800001, 110001)"
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 bg-white outline-none focus:border-terracotta-600"
                    />
                    {isLookingUpStudentPin && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta-600 absolute right-3 top-2.5" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">State / UT</label>
                    <select
                      value={studentForm.state}
                      onChange={async (e) => {
                        const newState = e.target.value;
                        setStudentForm(prev => ({ ...prev, state: newState, city: '', locality: '' }));
                        const dists = await getLiveDistricts(newState);
                        if (dists && dists.length > 0) {
                          setStudentForm(prev => ({ ...prev, city: dists[0] }));
                        }
                      }}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300 outline-none bg-white font-medium"
                    >
                      <option value="">Select State ({studentLoc.states.length})</option>
                      {studentLoc.states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-stone-600">District / City</label>
                      {studentLoc.isLoadingDistricts && (
                        <Loader2 className="w-3 h-3 animate-spin text-terracotta-600" />
                      )}
                    </div>
                    <select
                      value={studentForm.city}
                      onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value, locality: '' })}
                      disabled={studentLoc.isLoadingDistricts}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300 outline-none bg-white font-medium disabled:opacity-60"
                    >
                      <option value="">
                        {studentLoc.isLoadingDistricts
                          ? 'Loading districts...'
                          : `Select District (${studentLoc.districts.length})`}
                      </option>
                      {studentLoc.districts.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-stone-600">
                        Village / Town / Place
                      </label>
                      {studentLoc.isLoadingPlaces && (
                        <Loader2 className="w-3 h-3 animate-spin text-terracotta-600" />
                      )}
                    </div>
                    <SearchablePlaceSelect
                      value={studentForm.locality}
                      onChange={(val) => setStudentForm({ ...studentForm, locality: val })}
                      places={studentLoc.places}
                      cityName={studentForm.city}
                      placeholder={studentLoc.isLoadingPlaces ? 'Loading villages...' : 'Type to search village, town or place...'}
                      isLoading={studentLoc.isLoadingPlaces}
                      id="student-village-locality-search"
                    />
                  </div>
                </div>

                {/* Option to type Actual Location of House */}
                <div className="pt-2 border-t border-warm-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="text-terracotta-600">🏠</span>
                      <span>Actual Location of House (House/Flat No., Building, Street, Landmark):</span>
                    </label>
                    <span className="text-[10px] text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded font-medium border border-terracotta-200">
                      Doorstep Address
                    </span>
                  </div>
                  <input
                    type="text"
                    value={studentForm.houseLocation || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, houseLocation: e.target.value })}
                    placeholder="e.g. Flat 302, Block B, Sunshine Heights, Near Shivalik Hospital"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-terracotta-600 bg-white placeholder-stone-400 font-medium"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Enter your actual doorstep location so tutors can reach directly to your home for tuition.
                  </p>
                </div>

                {studentForm.city && studentLoc.places.length > 0 && (
                  <div className="text-[10px] text-emerald-800 flex items-center gap-1 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>
                      {studentLoc.places.length} official villages & localities loaded for <strong>{studentForm.city}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contact Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="parent@example.com"
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      studentForm.email && isDisposableEmail(studentForm.email)
                        ? 'border-red-400'
                        : 'border-stone-300'
                    }`}
                  />
                  {studentForm.email && isDisposableEmail(studentForm.email) && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">
                      ⚠️ Disposable/burner emails are blocked. Please use your real email.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Set Strong Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder="At least 8 characters with upper, lower, number & symbol"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none"
                />
                <PasswordStrengthIndicator password={studentForm.password} email={studentForm.email} />
              </div>

              <PolicyAgreementCheckbox
                id="auth-student-policy"
                role="student"
                checked={studentAgreed}
                onChange={(val) => {
                  setStudentAgreed(val);
                  if (val) setStudentPolicyError(false);
                }}
                hasError={studentPolicyError}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Student Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Parent Account & Start Searching</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: TUTOR / TEACHER REGISTRATION                  */}
          {/* ======================================================== */}
          {authMode === 'register' && selectedRole === 'tutor' && (
            <form onSubmit={handleTutorRegisterSubmit} className="space-y-4">
              <div className="bg-brand-50 border border-brand-200 p-3 rounded-xl text-xs text-brand-900 flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>
                  Educator registration: Select your qualifications, preferred classes, and visiting localities to receive verified student requests directly.
                </span>
              </div>

              {/* Primary Teacher & General Subjects Quick Preset */}
              <div className="bg-amber-50 border border-amber-200/90 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Primary Teacher or College Student teaching general subjects?
                    </span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      1-click shortcut to auto-select Class 1-5 and All-in-One Primary General Subjects (Maths, English, EVS, Hindi).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyPrimaryPreset}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition shadow-sm"
                >
                  🎒 Apply Primary Preset
                </button>
              </div>

              {/* Profile Photo Upload / Selection */}
              <div className="flex items-center justify-between gap-4 p-3.5 bg-warm-50/80 rounded-2xl border border-warm-200">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={tutorForm.avatar}
                      alt="Avatar preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-800 shadow-sm"
                    />
                    <label
                      className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-stone-900 p-1 rounded-lg shadow cursor-pointer border border-white"
                      title="Upload Photo"
                    >
                      <Camera className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTutorPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Tutor Profile Photo (Optional)
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Upload from device or keep pre-selected professional avatar.
                    </p>
                  </div>
                </div>

                <label className="cursor-pointer px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTutorPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name (with Prefix if any)</label>
                  <input
                    type="text"
                    required
                    value={tutorForm.name}
                    onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                    placeholder="e.g. Dr. Sunil Nair / Priya Sen"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Professional Tagline</label>
                  <input
                    type="text"
                    required
                    value={tutorForm.tagline}
                    onChange={(e) => setTutorForm({ ...tutorForm, tagline: e.target.value })}
                    placeholder="e.g. Primary Educator / 10+ Yrs CBSE Mathematics Faculty"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800"
                  />
                </div>
              </div>

              {/* Qualification, Experience, Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Highest Qualification (Inter / Bachelor / Master / Teaching Cert)
                  </label>
                  <select
                    value={tutorForm.qualification}
                    onChange={(e) => setTutorForm({ ...tutorForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none bg-white font-medium text-stone-800 focus:border-brand-800"
                  >
                    {QUALIFICATIONS_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={`── ${cat.category} ──`} className="font-bold text-brand-900 bg-stone-100">
                        {cat.options.map((opt) => (
                          <option key={opt} value={opt} className="font-normal text-stone-800 bg-white">
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Selected: <strong className="text-brand-900">{tutorForm.qualification}</strong>
                  </span>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={tutorForm.experienceYears}
                    onChange={(e) => setTutorForm({ ...tutorForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Monthly Tuition Fee (₹ / month)
                  </label>
                  <input
                    type="number"
                    min="1500"
                    step="250"
                    required
                    value={tutorForm.monthlyRate}
                    onChange={(e) => {
                      const monthly = Number(e.target.value);
                      setTutorForm({
                        ...tutorForm,
                        monthlyRate: monthly,
                        hourlyRate: Math.round(monthly / 12)
                      });
                    }}
                    placeholder="e.g. 7500"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800 font-semibold text-brand-950"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    ≈ ₹{Math.round(tutorForm.monthlyRate / 12)} / hr (avg. 12 classes)
                  </span>
                </div>
              </div>

              {/* WHICH CLASSES PREFERRED TO TEACH */}
              <div className="p-4 rounded-2xl bg-warm-50/80 border border-warm-200/90 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-900">
                      Which Classes Do You Prefer to Teach? *
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Select all student grades you want to accept inquiries for:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTutorForm({ ...tutorForm, classes: CLASSES_LIST })}
                      className="text-[11px] font-bold text-brand-800 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => setTutorForm({ ...tutorForm, classes: ["Class 1 - 5 (Primary)"] })}
                      className="text-[11px] font-bold text-terracotta-600 hover:underline"
                    >
                      Primary Only
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => setTutorForm({ ...tutorForm, classes: ["Class 9 - 10 (Secondary)", "Class 11 - 12 (Senior Secondary)"] })}
                      className="text-[11px] font-bold text-brand-800 hover:underline"
                    >
                      Secondary / 11-12
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {CLASSES_LIST.map((cls) => {
                    const isSelected = tutorForm.classes.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => toggleClass(cls)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${isSelected
                            ? 'bg-brand-800 text-white font-bold shadow-sm'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                      >
                        <span>{cls}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tutor Service Location & Visiting Localities with Live API */}
              <div className="p-3.5 rounded-2xl bg-warm-50/70 border border-warm-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-800" />
                    Teaching Base & Service Areas
                  </span>
                </div>

                {/* Quick 6-digit PIN Code Lookup */}
                <div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={tutorPincode}
                      onChange={(e) => handleTutorPinLookup(e.target.value)}
                      placeholder="Enter 6-digit PIN code to auto-detect State & District (e.g. 560034, 110001)"
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 bg-white outline-none focus:border-brand-800"
                    />
                    {isLookingUpTutorPin && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-800 absolute right-3 top-2.5" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">State / UT</label>
                    <select
                      value={tutorForm.state}
                      onChange={async (e) => {
                        const newState = e.target.value;
                        setTutorForm(prev => ({ ...prev, state: newState, city: '', localities: '' }));
                        const dists = await getLiveDistricts(newState);
                        if (dists && dists.length > 0) {
                          setTutorForm(prev => ({ ...prev, city: dists[0] }));
                        }
                      }}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium outline-none"
                    >
                      <option value="">Select State ({tutorLoc.states.length})</option>
                      {tutorLoc.states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-stone-600">District / City</label>
                      {tutorLoc.isLoadingDistricts && (
                        <Loader2 className="w-3 h-3 animate-spin text-brand-800" />
                      )}
                    </div>
                    <select
                      value={tutorForm.city}
                      onChange={(e) => setTutorForm({ ...tutorForm, city: e.target.value, localities: '' })}
                      disabled={tutorLoc.isLoadingDistricts}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium outline-none disabled:opacity-60"
                    >
                      <option value="">
                        {tutorLoc.isLoadingDistricts
                          ? 'Loading districts...'
                          : `Select District (${tutorLoc.districts.length})`}
                      </option>
                      {tutorLoc.districts.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-stone-700">
                      Visiting Villages & Places for Home Visits (Comma separated or click below)
                    </label>
                    {tutorLoc.isLoadingPlaces && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-800">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Querying villages...</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={tutorForm.localities}
                    onChange={(e) => setTutorForm({ ...tutorForm, localities: e.target.value })}
                    placeholder="e.g. Type or click suggested places/villages below"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800 bg-white"
                  />
                  {tutorLoc.places.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                        <span>Click to add/remove localities in {tutorForm.city}:</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          {tutorLoc.places.length} postal villages / places available
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white rounded-xl border border-stone-200/80">
                        {tutorLoc.places.slice(0, 30).map((place) => {
                          const isAdded = tutorForm.localities.includes(place);
                          return (
                            <button
                              type="button"
                              key={place}
                              onClick={() => {
                                const current = tutorForm.localities ? tutorForm.localities.split(',').map(s => s.trim()).filter(Boolean) : [];
                                let updated;
                                if (current.includes(place)) {
                                  updated = current.filter(p => p !== place);
                                } else {
                                  updated = [...current, place];
                                }
                                setTutorForm({ ...tutorForm, localities: updated.join(', ') });
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] transition ${isAdded
                                  ? 'bg-brand-800 text-white font-bold shadow-xs'
                                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                            >
                              + {place} {isAdded && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Option to type Tutor's Actual House / Residence Location */}
                <div className="pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="text-brand-800">🏠</span>
                      <span>Actual Location of House / Studio (House/Flat No., Street, Landmark):</span>
                    </label>
                    <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-medium border border-brand-200">
                      Tutor Residence
                    </span>
                  </div>
                  <input
                    type="text"
                    value={tutorForm.houseLocation || ''}
                    onChange={(e) => setTutorForm({ ...tutorForm, houseLocation: e.target.value })}
                    placeholder="e.g. House No. 42, 2nd Floor, Near Main Market"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-brand-800 bg-white placeholder-stone-400 font-medium"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Your base residential location for identity verification and students visiting your home.
                  </p>
                </div>
              </div>

              {/* Subjects Selection */}
              <div className="space-y-2 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900">
                    Subjects You Teach ({tutorForm.subjects.length} selected)
                  </label>
                  <span className="text-[11px] text-stone-500">Tap to select / deselect</span>
                </div>

                {/* Primary & General Subjects Group */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-wide block">
                    ★ Primary & General School Subjects (All-in-One Options)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECTS_LIST.slice(0, 6).map((sub) => {
                      const isSelected = tutorForm.subjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition text-left ${isSelected
                              ? 'bg-terracotta-600 text-white font-bold shadow-sm'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                        >
                          {sub} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Core & Higher Secondary Subjects Group */}
                <div className="space-y-1 pt-2 border-t border-stone-200/80">
                  <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wide block">
                    ★ Specialized Secondary & Senior Subjects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECTS_LIST.slice(6).map((sub) => {
                      const isSelected = tutorForm.subjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${isSelected
                              ? 'bg-brand-800 text-white font-bold shadow-sm'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                        >
                          {sub} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Teaching Modes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Supported Teaching Modes</label>
                <div className="flex flex-wrap gap-2">
                  {TEACHING_MODES.map((mode) => {
                    const isSelected = tutorForm.modes.includes(mode.id);
                    return (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${isSelected ? 'border-brand-800 bg-brand-50 text-brand-900' : 'border-stone-200 text-stone-600'
                          }`}
                      >
                        {mode.label} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={tutorForm.phone}
                    onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={tutorForm.email}
                    onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                    placeholder="tutor@example.com"
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      tutorForm.email && isDisposableEmail(tutorForm.email)
                        ? 'border-red-400'
                        : 'border-stone-300'
                    }`}
                  />
                  {tutorForm.email && isDisposableEmail(tutorForm.email) && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">
                      ⚠️ Disposable/burner emails are blocked. Please use your real email.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Set Strong Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={tutorForm.password}
                    onChange={(e) => setTutorForm({ ...tutorForm, password: e.target.value })}
                    placeholder="At least 8 characters with upper, lower, number & symbol"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none"
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={tutorForm.password} email={tutorForm.email} />

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  After registration, you will be placed in the Admin Verification queue to audit degree certificates before the public verified badge is unlocked.
                </span>
              </div>

              <PolicyAgreementCheckbox
                id="auth-tutor-policy"
                role="tutor"
                checked={tutorAgreed}
                onChange={(val) => {
                  setTutorAgreed(val);
                  if (val) setTutorPolicyError(false);
                }}
                hasError={tutorPolicyError}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Educator Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Register Educator Profile & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

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
