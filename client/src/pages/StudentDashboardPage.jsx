import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { addTutorReview } from '../store/slices/tutorsSlice';
import { fetchMyInquiries } from '../store/slices/inquiriesSlice';
import { updateStudentProfile, updateUserAvatar } from '../store/slices/authSlice';
import { lookupPincode, getPincodeLocation } from '../services/locationService';
import { CLASSES_LIST, BOARDS_LIST, SUBJECTS_LIST } from '../data/mockData';
import StarRating from '../components/common/StarRating';
import ModeBadge from '../components/common/ModeBadge';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  BookOpen, 
  Search, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  User,
  Save,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Home,
  Building,
  GraduationCap,
  Loader2,
  Check,
  Compass,
  AlertCircle,
  Bell,
  Ban,
  Lock,
  X
} from 'lucide-react';

const STUDENT_AVATAR_PRESETS = [
  {
    id: 's-av-1',
    label: 'Learner (Boy)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 's-av-2',
    label: 'Learner (Girl)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 's-av-3',
    label: 'High Schooler (Female)',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 's-av-4',
    label: 'High Schooler (Male)',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 's-av-5',
    label: 'Parent (Father)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 's-av-6',
    label: 'Parent (Mother)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  }
];

const TUITION_MODES = [
  { id: 'home_visit', label: 'Tutor Visits Home', desc: 'Tutor travels to student address', icon: Home },
  { id: 'tutor_place', label: 'At Tutor Residence', desc: 'Student travels to tutor center/home', icon: Building },
  { id: 'online', label: 'Online 1-on-1', desc: 'Live video sessions with screen sharing', icon: BookOpen }
];

export default function StudentDashboardPage() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { inquiries } = useSelector((state) => state.inquiries);
  const { tutors } = useSelector((state) => state.tutors);
  const { messages } = useSelector((state) => state.adminMessages || { messages: [] });
  const settings = useSelector((state) => state.settings?.settings) || {};
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchMyInquiries());
    // Auto-refresh inquiries periodically to reflect real-time Accept/Reject actions from teachers
    const interval = setInterval(() => {
      dispatch(fetchMyInquiries());
    }, 6000);

    const handleFocus = () => {
      dispatch(fetchMyInquiries());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  const [dismissedMsgIds, setDismissedMsgIds] = useState([]);

  // Active admin broadcast notices targeted to this student or all students
  const activeNotices = useMemo(() => {
    if (!messages) return [];
    return messages.filter(m => 
      !dismissedMsgIds.includes(m.id) &&
      (m.target === 'all' || m.target === 'students' || m.targetId === currentUser?.id)
    );
  }, [messages, dismissedMsgIds, currentUser?.id]);

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'inquiries'); // 'inquiries' | 'connected' | 'profile'
  const [reviewModalTutor, setReviewModalTutor] = useState(null);
  const [reviewInquiry, setReviewInquiry] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubject, setReviewSubject] = useState('Physics');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    studentName: currentUser?.studentName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    studentGrade: currentUser?.studentGrade || 'Class 11 - 12 (Senior Secondary)',
    board: currentUser?.board || 'CBSE',
    school: currentUser?.school || '',
    subjectsNeeded: currentUser?.subjectsNeeded || '',
    pincode: currentUser?.pincode || '',
    houseLocation: currentUser?.houseLocation || '',
    landmark: currentUser?.landmark || '',
    locality: currentUser?.locality || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    preferredMode: currentUser?.preferredMode || 'home_visit',
    learningGoals: currentUser?.learningGoals || '',
    avatar: currentUser?.avatar || ''
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinLookupMsg, setPinLookupMsg] = useState('');

  const tabsSectionRef = useRef(null);

  // Smoothly scroll down to the student tabs & requests area, accounting for sticky navbar
  const scrollToTabsSection = (behavior = 'smooth') => {
    if (tabsSectionRef.current) {
      const headerOffset = 95; // Offset for sticky pill navbar + top spacing
      const elementPosition = tabsSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior
      });
    }
  };

  // Sync tab with URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['inquiries', 'connected', 'profile'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('inquiries');
    }
  }, [searchParams]);

  // Auto-scroll to tabs section on initial load if tab parameter is specified
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const timer = setTimeout(() => {
        scrollToTabsSection('smooth');
      }, 250);
      return () => clearTimeout(timer);
    }
  }, []); // Run once on initial mount

  // Listen to cross-component tab switch requests (e.g. from Navbar on desktop or mobile menu)
  useEffect(() => {
    const handleSwitchTab = (e) => {
      const targetTab = e.detail;
      if (targetTab && ['inquiries', 'connected', 'profile'].includes(targetTab)) {
        setActiveTab(targetTab);
        setSearchParams({ tab: targetTab }, { replace: true });
        setTimeout(() => {
          scrollToTabsSection('smooth');
        }, 50);
      }
    };
    window.addEventListener('switch-student-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-student-tab', handleSwitchTab);
  }, [setSearchParams]);

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        studentName: currentUser.studentName || prev.studentName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        studentGrade: currentUser.studentGrade || prev.studentGrade,
        board: currentUser.board || prev.board,
        school: currentUser.school || prev.school,
        subjectsNeeded: currentUser.subjectsNeeded || prev.subjectsNeeded,
        pincode: currentUser.pincode || prev.pincode,
        houseLocation: currentUser.houseLocation || prev.houseLocation,
        landmark: currentUser.landmark || prev.landmark,
        locality: currentUser.locality || prev.locality,
        city: currentUser.city || prev.city,
        state: currentUser.state || prev.state,
        preferredMode: currentUser.preferredMode || prev.preferredMode,
        learningGoals: currentUser.learningGoals || prev.learningGoals,
        avatar: currentUser.avatar || prev.avatar
      }));
    }
  }, [currentUser]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const handlePinChange = async (pin) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    setProfileForm(prev => ({ ...prev, pincode: cleaned }));
    if (/^\d{6}$/.test(cleaned)) {
      setIsLookingUpPin(true);
      setPinLookupMsg('Detecting location...');
      try {
        const loc = await getPincodeLocation(cleaned);
        if (loc && loc.matchedState) {
          setProfileForm(prev => ({
            ...prev,
            state: loc.matchedState || loc.state,
            city: loc.matchedDistrict || loc.district || prev.city,
            locality: prev.locality ? prev.locality : ((loc.places && loc.places[0]?.name) || '')
          }));
          setPinLookupMsg(`Detected: ${loc.matchedDistrict || loc.district}, ${loc.matchedState || loc.state}`);
        } else {
          setPinLookupMsg('');
        }
      } catch {
        setPinLookupMsg('');
      } finally {
        setIsLookingUpPin(false);
      }
    } else {
      setPinLookupMsg('');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (token) {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileForm)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            dispatch(updateStudentProfile(data.user));
            if (data.user.avatar) {
              dispatch(updateUserAvatar({ id: data.user._id, avatar: data.user.avatar }));
            }
          }
        }
      }
      dispatch(updateStudentProfile(profileForm));
      if (profileForm.avatar && (currentUser?._id || currentUser?.id)) {
        dispatch(updateUserAvatar({ id: currentUser._id || currentUser.id, avatar: profileForm.avatar }));
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch {
      dispatch(updateStudentProfile(profileForm));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Accepted inquiries represent active connected tutors
  const acceptedInquiries = inquiries.filter(i => i.status === 'accepted');

  // Helper to determine if 1 month (30 days) has passed since tuition inquiry was accepted
  const getReviewEligibility = (inquiry) => {
    if (!inquiry || inquiry.status !== 'accepted') {
      return { eligible: false, message: 'Inquiry has not been accepted yet.' };
    }
    const acceptedDate = inquiry.acceptedAt || inquiry.updatedAt || inquiry.createdAt;
    const acceptedTime = new Date(acceptedDate).getTime();
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();
    const timeElapsed = now - acceptedTime;

    if (timeElapsed >= ONE_MONTH_MS) {
      return { eligible: true };
    }

    const remainingDays = Math.max(1, Math.ceil((ONE_MONTH_MS - timeElapsed) / (24 * 60 * 60 * 1000)));
    const unlockDate = new Date(acceptedTime + ONE_MONTH_MS).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return {
      eligible: false,
      daysRemaining: remainingDays,
      unlockDate,
      message: `Rating unlocks on ${unlockDate} (${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining) after 1 month of tuition.`
    };
  };

  const handleOpenReview = (tutor, inquiry) => {
    setReviewModalTutor(tutor);
    setReviewInquiry(inquiry || null);
    const tutorSubjects = tutor?.subjects || [];
    setReviewSubject(inquiry?.subject || tutorSubjects[0] || 'General Tuition');
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalTutor || !reviewComment.trim()) return;

    const reviewPayload = {
      studentName: currentUser?.studentName || currentUser?.name || "Student",
      parentName: currentUser?.name || "Parent",
      rating: reviewRating,
      subject: reviewSubject,
      comment: reviewComment.trim()
    };

    setReviewError('');
    setIsSubmittingReview(true);

    try {
      const token = localStorage.getItem('vidyanest_token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          tutorId: reviewModalTutor._id || reviewModalTutor.id,
          ...reviewPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || 'Unable to submit review. Reviews unlock after 1 month of accepted tuition.');
        setIsSubmittingReview(false);
        return;
      }

      dispatch(addTutorReview({
        tutorId: reviewModalTutor._id || reviewModalTutor.id,
        review: data.review || reviewPayload
      }));

      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalTutor(null);
        setReviewSuccess(false);
      }, 2000);
    } catch (err) {
      setReviewError(err.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative w-full overflow-x-clip">

      {/* Prominent Global Floating Save Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 bg-stone-900/95 text-white border-2 border-emerald-500 rounded-2xl shadow-2xl flex items-center gap-3.5 text-xs max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 pr-2">
            <div className="font-bold text-sm text-white">Profile Updated Successfully!</div>
            <div className="text-emerald-300 font-medium text-[11px] mt-0.5">
              Your student profile and home location are saved and active.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Portal Console Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-terracotta-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-800 max-w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-500/20 text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.studentPortalTitle || "Student & Parent Learning Console"}</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed mt-1">
            {settings.studentPortalWelcome || "Manage tuition requests, track direct phone numbers of accepted home educators, and submit verified session evaluations."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block text-xs">
            <div className="text-stone-400">Parent Helpline</div>
            <div className="font-bold text-amber-300">{settings.parentHelpline || settings.contactPhone || "+91 (011) 4567-8900"}</div>
          </div>
          <Link
            to="/search"
            className="px-4 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Find Tutors</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Safety & Guidelines Notice Banner */}
      {settings.studentGuidelinesNotice && (
        <div className="p-4 bg-terracotta-50 border border-terracotta-200 text-terracotta-900 rounded-2xl flex items-center gap-3 text-xs shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-terracotta-600 shrink-0" />
          <div className="flex-1 font-medium">
            {settings.studentGuidelinesNotice}
          </div>
        </div>
      )}

      {/* Account Blocked Alert Banner */}
      {currentUser?.isBlocked && (
        <div className="p-4 sm:p-5 bg-red-50 border-2 border-red-300 text-red-900 rounded-3xl shadow-sm flex items-start gap-3.5">
          <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm text-red-950">
              Administrative Notice: Account Privileges Suspended
            </div>
            <p className="mt-1 leading-relaxed text-red-800">
              Your student/parent account has been placed under administrative restriction by {settings.siteName || "VidyaNest"} compliance.
              {currentUser.blockedReason ? ` Reason: "${currentUser.blockedReason}".` : ''} While suspended, new tutor inquiries cannot be processed. To appeal or restore full access, please contact our administrative desk at <strong className="underline">{settings.supportEmail || "support@vidyanest.com"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Admin Important Messages & Broadcast Banners */}
      {activeNotices.length > 0 && (
        <div className="space-y-3">
          {activeNotices.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-start justify-between gap-3.5 ${
                msg.type === 'alert'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : msg.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : msg.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  msg.type === 'alert' ? 'bg-red-200 text-red-800' :
                  msg.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                  msg.type === 'info' ? 'bg-blue-200 text-blue-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{msg.title}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/60">
                      {msg.sender || 'Admin Desk'}
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">{msg.message}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissedMsgIds(prev => [...prev, msg.id])}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-lg transition shrink-0"
                title="Dismiss Notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Student Profile Overview Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 max-w-full">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 w-full md:w-auto flex-1">
          <div className="relative group shrink-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-terracotta-400 shadow-sm cursor-pointer hover:opacity-90 transition"
                onClick={() => handleTabChange('profile')}
                title="Click to update photo"
              />
            ) : (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-terracotta-100 text-terracotta-800 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-terracotta-200 cursor-pointer hover:bg-terracotta-200 transition"
                onClick={() => handleTabChange('profile')}
                title="Click to update profile"
              >
                {currentUser?.name?.charAt(0) || 'V'}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className="absolute -bottom-1 -right-1 p-1.5 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl shadow border-2 border-white transition cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold">
                <span>Parent / Student Account</span>
              </div>
              {(currentUser?.agreedToPolicyFormatted || currentUser?.agreedToPolicyDate) && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium" title={currentUser.agreedToPolicyFormatted || `Agreed on ${currentUser.agreedToPolicyDate}`}>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Policy Agreed: {currentUser.agreedToPolicyDate}</span>
                </div>
              )}
            </div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold text-stone-900 truncate">
              {currentUser?.name || 'Vikram Verma'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 truncate">
              Student: <strong className="text-stone-800">{currentUser?.studentName || 'Arjun Verma'}</strong> • {currentUser?.studentGrade || 'Class 11 - 12 (Senior Secondary)'} • {currentUser?.locality ? `${currentUser.locality}, ` : ''}{currentUser?.city || 'New Delhi'}
            </p>
            {currentUser?.houseLocation && (
              <div className="text-xs text-terracotta-800 bg-terracotta-50 px-2.5 py-1 rounded-lg border border-terracotta-200 inline-flex items-center gap-1.5 mt-1 font-medium max-w-full truncate">
                <span>🏠 Home:</span>
                <span className="truncate">{currentUser.houseLocation}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-terracotta-600 text-white border-terracotta-600'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-white' : 'text-terracotta-600'}`} />
            <span>Edit Profile</span>
          </button>

          <Link
            to="/search"
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap text-center"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover More Tutors</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        ref={tabsSectionRef}
        id="student-tabs-section"
        className="scroll-mt-24 sm:scroll-mt-28"
      >
        <div className="flex border-b border-stone-200 space-x-2 sm:space-x-6 text-xs sm:text-sm font-semibold relative overflow-x-auto no-scrollbar pb-0.5 overscroll-x-contain touch-pan-x">
          <button
            onClick={() => handleTabChange('inquiries')}
            className={`pb-3 px-2 sm:px-1 flex items-center gap-1.5 sm:gap-2 border-b-2 -mb-px whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'inquiries'
                ? 'border-terracotta-600 text-terracotta-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-4 h-4 text-terracotta-600 shrink-0" />
            <span>My Tuition Requests ({inquiries.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('connected')}
            className={`pb-3 px-2 sm:px-1 flex items-center gap-1.5 sm:gap-2 border-b-2 -mb-px whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'connected'
                ? 'border-terracotta-600 text-terracotta-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connected Tutors ({acceptedInquiries.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`pb-3 px-2 sm:px-1 flex items-center gap-1.5 sm:gap-2 border-b-2 -mb-px whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-terracotta-600 text-terracotta-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Update Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Inquiries List */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <Send className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">No Inquiries Sent Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Search verified home tutors by subject, board, and city to send a free tuition request.
              </p>
              <Link
                to="/search"
                className="inline-block px-4 py-2 bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Find Tutors
              </Link>
            </div>
          ) : (
            inquiries.map((inq) => {
              const tutorId = inq.tutorId || inq.tutor?._id || (typeof inq.tutor === 'string' ? inq.tutor : null);
              const matchedTutor = (inq.tutor && typeof inq.tutor === 'object' ? inq.tutor : null) ||
                tutors.find(t => (tutorId && (t.id === tutorId || t._id === tutorId)) || (inq.tutorName && t.name === inq.tutorName));
              const tutorAvatar = matchedTutor?.avatar || inq.tutor?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80";
              const tutorDisplayName = inq.tutorName || matchedTutor?.name || "Verified Tutor";

              return (
                <div
                  key={inq.id || inq._id}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-soft space-y-4 max-w-full"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={tutorAvatar}
                        alt={tutorDisplayName}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={tutorId ? `/tutors/${tutorId}` : '#'}
                          className="font-serif text-base sm:text-lg font-bold text-stone-900 hover:text-brand-800 transition truncate block"
                        >
                          {tutorDisplayName}
                        </Link>
                        <div className="text-xs text-stone-500 truncate">
                          Subject: <strong className="text-stone-800">{inq.subject}</strong> • {inq.grade} ({inq.board})
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="self-start sm:self-auto shrink-0">
                      {inq.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Awaiting Tutor Response</span>
                        </span>
                      )}
                      {inq.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Inquiry Accepted</span>
                        </span>
                      )}
                      {inq.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Unavailable at this time</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-warm-50/70 p-3 rounded-xl border border-warm-100 break-words">
                    <div>
                      <span className="text-stone-400 block font-medium">Mode & Full Location</span>
                      <span className="font-bold text-stone-800 block capitalize">{inq.mode?.replace('_', ' ')}</span>
                      <span className="text-stone-600 block text-[11px] mt-0.5 break-words">
                        {inq.fullAddress || (inq.houseLocation ? `${inq.houseLocation}, ${inq.locality}` : inq.locality)}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium">Requested Schedule</span>
                      <span className="font-bold text-stone-800 block">{inq.preferredDays} ({inq.preferredTime})</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-300/80 rounded-lg p-2">
                      <span className="text-amber-800 text-[10px] block font-extrabold uppercase tracking-wider">Agreed Monthly Package</span>
                      <span className="font-serif text-sm font-bold text-amber-950">₹{inq.budgetPerMonth?.toLocaleString('en-IN') || inq.budgetPerMonth} <span className="text-[11px] font-medium text-amber-800">/ mo</span></span>
                    </div>
                  </div>

                  {inq.studentNotes && (
                    <div className="text-xs text-stone-600 italic break-words">
                      "Notes: {inq.studentNotes}"
                    </div>
                  )}

                  {/* Tutor Response Note if available */}
                  {inq.responseNote && (
                    <div className="p-3 rounded-xl bg-brand-50/80 border border-brand-200 text-xs text-brand-900 break-words">
                      <strong>Tutor's Note:</strong> {inq.responseNote}
                    </div>
                  )}

                  {/* Actions for Accepted Inquiries */}
                  {inq.status === 'accepted' && (
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-stone-700 min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-700 break-all">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>Direct Phone: {matchedTutor?.phone || inq.tutorPhone || inq.tutor?.phone || '+91 98711 54321'}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-stone-500 break-all">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{matchedTutor?.email || inq.tutorEmail || inq.tutor?.email || 'tutor@vidyanest.in'}</span>
                        </span>
                      </div>

                      {(() => {
                        const eligibility = getReviewEligibility(inq);
                        if (eligibility.eligible) {
                          return (
                            <button
                              onClick={() => handleOpenReview(matchedTutor || { id: tutorId, _id: tutorId, name: tutorDisplayName, subjects: [inq.subject] }, inq)}
                              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 text-stone-900 fill-stone-900 shrink-0" />
                              <span>Rate & Review Tutor</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            type="button"
                            disabled
                            className="w-full sm:w-auto px-3.5 py-2 bg-stone-100 border border-stone-200 text-stone-500 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90 text-center"
                            title={eligibility.message}
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">Rating unlocks in {eligibility.daysRemaining}d ({eligibility.unlockDate})</span>
                          </button>
                        );
                      })()}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Connected Tutors */}
      {activeTab === 'connected' && (
        <div className="space-y-4">
          {acceptedInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <UserCheck className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">No Active Tutors Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Once a tutor accepts your inquiry, they will appear here with direct contact information.
              </p>
            </div>
          ) : (
            acceptedInquiries.map((inq) => {
              const tutorId = inq.tutorId || inq.tutor?._id || (typeof inq.tutor === 'string' ? inq.tutor : null);
              const matchedTutor = (inq.tutor && typeof inq.tutor === 'object' ? inq.tutor : null) ||
                tutors.find(t => (tutorId && (t.id === tutorId || t._id === tutorId)) || (inq.tutorName && t.name === inq.tutorName));
              const tutorAvatar = matchedTutor?.avatar || inq.tutor?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80";
              const tutorDisplayName = inq.tutorName || matchedTutor?.name || "Verified Tutor";
              const tutorPhone = matchedTutor?.phone || inq.tutorPhone || inq.tutor?.phone || "+91 98711 54321";

              return (
                <div
                  key={inq.id || inq._id}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 max-w-full"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <img
                      src={tutorAvatar}
                      alt={tutorDisplayName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-stone-200 shadow-sm shrink-0"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 truncate">
                        {tutorDisplayName}
                      </h3>
                      <p className="text-xs text-stone-600 truncate">
                        Teaching <strong>{inq.subject}</strong> for {inq.grade}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-300/80 text-amber-950 font-serif font-bold text-xs">
                          ₹{inq.budgetPerMonth?.toLocaleString('en-IN') || inq.budgetPerMonth} / month
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{tutorPhone}</span>
                        </div>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500">{inq.preferredDays}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={matchedTutor?._id ? `/tutors/${matchedTutor._id}` : (matchedTutor?.id ? `/tutors/${matchedTutor.id}` : (tutorId ? `/tutors/${tutorId}` : '#'))}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition"
                    >
                      View Profile
                    </Link>
                    {(() => {
                      const eligibility = getReviewEligibility(inq);
                      if (eligibility.eligible) {
                        return (
                          <button
                            onClick={() => handleOpenReview(matchedTutor || { id: tutorId, _id: tutorId, name: tutorDisplayName, subjects: [inq.subject] }, inq)}
                            className="px-4 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Review Session</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          type="button"
                          disabled
                          className="px-3.5 py-2 bg-stone-100 border border-stone-200 text-stone-500 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-90"
                          title={eligibility.message}
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rating unlocks in {eligibility.daysRemaining}d</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: Student & Parent Profile Editor */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-4 sm:space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-800 border border-terracotta-200 text-xs font-bold mb-2">
                <User className="w-3.5 h-3.5" />
                <span>Student & Parent Profile Management</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">Update Profile Details</h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Keep your contact, schooling, and home address current so prospective tutors can assist you effectively.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto justify-center px-6 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 self-stretch sm:self-auto shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Success Notification */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-sm text-emerald-900">Profile Updated Successfully!</div>
                <div className="text-emerald-700 font-normal mt-0.5">Your updated details are now active and will reflect across tutor requests.</div>
              </div>
            </div>
          )}

          {/* Section 1: Profile Photo Studio */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-terracotta-600" />
                  <span>Profile Photo</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select a student or parent avatar from presets, upload a photo, or paste an image link.
                </p>
              </div>
              {profileForm.avatar && (
                <button
                  type="button"
                  onClick={() => setProfileForm(prev => ({ ...prev, avatar: '' }))}
                  className="text-xs font-semibold text-stone-500 hover:text-red-600 self-start sm:self-auto cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {/* Photo Preview */}
              <div className="relative shrink-0">
                {profileForm.avatar ? (
                  <img
                    src={profileForm.avatar}
                    alt="Student Preview"
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-terracotta-400 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-terracotta-100 text-terracotta-800 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-dashed border-terracotta-300 shadow-inner">
                    {profileForm.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-terracotta-600 text-white rounded-xl shadow border-2 border-white">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full">
                  <label className="cursor-pointer px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-stone-300" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer justify-center"
                  >
                    {showUrlInput ? 'Hide URL Input' : 'Paste Image URL'}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                    />
                  </div>
                )}

                <div className="text-[11px] text-stone-500">
                  Tip: A clear portrait creates trust with home tutors.
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Or select a ready-to-use avatar:</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {STUDENT_AVATAR_PRESETS.map((preset) => {
                  const isSelected = profileForm.avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, avatar: preset.url }))}
                      className={`group p-2 rounded-xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-terracotta-600 bg-terracotta-50/60 ring-2 ring-terracotta-600/20 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-stone-200">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-terracotta-900/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-stone-700 leading-tight">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-5">
            <div className="pb-4 border-b border-stone-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-terracotta-600" />
                <span>Student & Parent Details</span>
              </h3>
              <p className="text-xs text-stone-500">Contact person and student identity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Parent / Guardian Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Vikram Verma"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student / Learner Full Name *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={profileForm.studentName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="e.g. Arjun Verma"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98112 34567"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">Shared with verified tutors once you connect.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Academic Profile */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-5">
            <div className="pb-4 border-b border-stone-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-terracotta-600" />
                <span>Academic Profile & Schooling</span>
              </h3>
              <p className="text-xs text-stone-500">Curriculum, standard, and target subjects</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Current Grade / Standard *
                </label>
                <select
                  value={profileForm.studentGrade}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, studentGrade: e.target.value }))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-white"
                >
                  {CLASSES_LIST.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Educational Board *
                </label>
                <select
                  value={profileForm.board}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, board: e.target.value }))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none bg-white"
                >
                  {BOARDS_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School / College Name
                </label>
                <input
                  type="text"
                  value={profileForm.school}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="e.g. Delhi Public School, R.K. Puram"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subjects Needing Tuition
                </label>
                <input
                  type="text"
                  value={profileForm.subjectsNeeded}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, subjectsNeeded: e.target.value }))}
                  placeholder="e.g. Physics, Mathematics, Chemistry"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
                <p className="text-[10px] text-stone-500 mt-1">Separate subjects with commas</p>
              </div>
            </div>
          </div>

          {/* Section 4: Home Tuition Address & Postal Lookup */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-5">
            <div className="pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-600" />
                  <span>Home Tuition Location & Address</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Where the tutor will conduct classes or calculate travel distance
                </p>
              </div>
              <span className="text-[11px] font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-1 rounded-full border border-terracotta-200 self-start sm:self-auto">
                Real-time Postal PIN Code Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  6-Digit Postal PIN Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={profileForm.pincode}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="e.g. 110048"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none font-mono"
                  />
                  {isLookingUpPin && (
                    <Loader2 className="w-4 h-4 text-terracotta-600 animate-spin absolute right-3 top-3" />
                  )}
                </div>
                {pinLookupMsg && (
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{pinLookupMsg}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. New Delhi"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  State / UT
                </label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g. Delhi NCR"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  House / Flat / Building No.
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profileForm.houseLocation}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, houseLocation: e.target.value }))}
                    placeholder="e.g. Flat 402, Block B, Silver Oak Apts"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Locality / Sector / Colony
                </label>
                <input
                  type="text"
                  value={profileForm.locality}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, locality: e.target.value }))}
                  placeholder="e.g. Greater Kailash II"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={profileForm.landmark}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="e.g. Near M-Block Market"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Tuition Mode & Learning Goals */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200 shadow-soft space-y-5">
            <div className="pb-4 border-b border-stone-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-terracotta-600" />
                <span>Tuition Preference & Learning Goals</span>
              </h3>
              <p className="text-xs text-stone-500">Your preferred teaching environment and special needs</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Preferred Tuition Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TUITION_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = profileForm.preferredMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, preferredMode: mode.id }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-terracotta-600 bg-terracotta-50/60 ring-2 ring-terracotta-600/20 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-terracotta-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-terracotta-900' : 'text-stone-800'}`}>
                          {mode.label}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {mode.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Learning Goals & Notes for Tutors
              </label>
              <textarea
                rows={3}
                value={profileForm.learningGoals}
                onChange={(e) => setProfileForm(prev => ({ ...prev, learningGoals: e.target.value }))}
                placeholder="Mention specific areas where student needs help, exam targets, preferred class schedule..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-terracotta-600 outline-none resize-none"
              />
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleTabChange('inquiries')}
              className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              Back to Inquiries
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {saveSuccess && (
                <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto justify-center px-7 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Review Modal */}
      {reviewModalTutor && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            {reviewSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-stone-900">Review Submitted!</h3>
                <p className="text-xs text-stone-600">
                  Thank you for rating {reviewModalTutor.name}. Your review helps other families make informed choices.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Review {reviewModalTutor.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Verified tuition feedback (unlocked after 1 month of tuition)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewModalTutor(null)}
                    className="text-stone-400 hover:text-stone-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {reviewError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Your Rating</label>
                  <StarRating rating={reviewRating} interactive={true} onRate={setReviewRating} size="md" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Subject</label>
                  <select
                    value={reviewSubject}
                    onChange={(e) => setReviewSubject(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-stone-300 outline-none"
                  >
                    {(reviewModalTutor.subjects && reviewModalTutor.subjects.length > 0
                      ? reviewModalTutor.subjects
                      : [reviewSubject || 'General Tuition', 'Mathematics', 'Science', 'English']
                    ).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Detailed Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe teaching method, student progress, clarity of explanations, punctuality..."
                    className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:border-brand-800 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalTutor(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1.5"
                  >
                    {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmittingReview ? 'Submitting...' : 'Publish Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
