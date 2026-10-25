import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendInquiry, sendInquiryAsync } from '../../store/slices/inquiriesSlice';
import { X, CheckCircle, Send, Calendar, Clock, MapPin, BookOpen, AlertCircle, LogIn, UserPlus, ShieldAlert } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPincodeLocation } from '../../services/locationService';

export default function InquiryModal({ tutor, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, currentRole } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    subject: "",
    grade: "",
    board: "CBSE",
    mode: "home_visit",
    locality: "",
    city: "",
    state: "",
    houseLocation: "",
    landmark: "",
    pincode: "",
    preferredDays: "3 days / week (e.g. Mon, Wed, Fri)",
    preferredTime: "5:00 PM - 6:30 PM",
    budgetPerMonth: 8000,
    studentNotes: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync form data whenever modal opens or currentUser / tutor changes
  useEffect(() => {
    if (isOpen && tutor) {
      setFormData({
        studentName: currentUser?.studentName || currentUser?.name || "",
        parentName: currentUser?.name || "",
        parentPhone: currentUser?.phone || "",
        parentEmail: currentUser?.email || "",
        subject: tutor?.subjects?.[0] || "",
        grade: tutor?.classes?.[0] || "",
        board: tutor?.boards?.[0] || "CBSE",
        mode: tutor?.modes?.[0] || "home_visit",
        locality: currentUser?.locality || (tutor?.location?.localities?.[0] || ""),
        city: currentUser?.city || tutor?.location?.city || "New Delhi",
        state: currentUser?.state || tutor?.location?.state || "Delhi NCR",
        houseLocation: currentUser?.houseLocation || currentUser?.homeAddress || "",
        landmark: currentUser?.landmark || "",
        pincode: currentUser?.pincode || "",
        preferredDays: "3 days / week (e.g. Mon, Wed, Fri)",
        preferredTime: "5:00 PM - 6:30 PM",
        budgetPerMonth: tutor?.rates?.monthly || 8000,
        studentNotes: ""
      });
      setSubmitted(false);
      setErrorMessage("");
    }
  }, [isOpen, tutor, currentUser]);

  const handlePincodeChange = async (pin) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: cleaned }));
    if (/^\d{6}$/.test(cleaned)) {
      const loc = await getPincodeLocation(cleaned);
      if (loc && loc.matchedState) {
        setFormData(prev => ({
          ...prev,
          state: loc.matchedState || loc.state,
          city: loc.matchedDistrict || loc.district || prev.city,
          locality: prev.locality ? prev.locality : (loc.places?.[0]?.name || '')
        }));
      }
    }
  };

  if (!isOpen || !tutor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Strict validation: must be authenticated as student/parent
    if (!isAuthenticated || !currentUser) {
      setErrorMessage("You must log in first to send a tuition inquiry. Please sign in or register.");
      return;
    }

    const token = localStorage.getItem('vidyanest_token');
    if (!token) {
      setErrorMessage("No active session found. Please log in first then send.");
      return;
    }

    setSubmitting(true);

    const addressParts = [
      formData.houseLocation,
      formData.landmark ? `Landmark: ${formData.landmark}` : null,
      formData.locality,
      formData.city,
      formData.state,
      formData.pincode
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const inquiryPayload = {
      tutorId: tutor._id || tutor.id,
      tutorName: tutor.name,
      ...formData,
      houseLocation: formData.houseLocation,
      landmark: formData.landmark,
      locality: formData.locality,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      fullAddress: fullAddress || `${formData.locality}, ${formData.city}`
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inquiryPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit inquiry to educator');
      }

      const returnedInquiry = data.inquiry || inquiryPayload;
      dispatch(sendInquiry({
        ...inquiryPayload,
        ...returnedInquiry,
        id: returnedInquiry._id || returnedInquiry.id,
        tutorId: returnedInquiry.tutor?._id || returnedInquiry.tutor || inquiryPayload.tutorId
      }));

      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send inquiry. Please ensure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  const isStudentOrParent = isAuthenticated && (currentRole === 'student' || !currentRole);
  const isTutorAccount = isAuthenticated && currentRole === 'tutor';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={tutor.avatar}
              alt={tutor.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-400"
            />
            <div>
              <h3 className="font-serif text-lg font-bold">Request Tuition with {tutor.name}</h3>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                  Monthly: ₹{tutor.rates?.monthly?.toLocaleString('en-IN') || tutor.rates?.monthly}/mo
                </span>
                <span className="text-brand-200 text-[11px]">
                  (₹{tutor.rates?.hourly}/hr • ~12 sessions)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-full text-brand-200 hover:text-white hover:bg-brand-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-stone-900">Tuition Request Sent!</h4>
            <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
              Your inquiry has been successfully delivered to <strong>{tutor.name}</strong>. The tutor will review your requirements and schedule availability.
            </p>
            <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 text-xs text-stone-600 text-left space-y-1.5">
              <div className="font-semibold text-stone-900">What happens next?</div>
              <div>• {tutor.name} typically responds within 2-4 hours.</div>
              <div>• You will receive an SMS and dashboard notification when accepted.</div>
              <div>• A free 30-minute introductory phone call will be arranged.</div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                to="/student/dashboard"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold rounded-xl text-sm transition text-center"
              >
                Track in My Inquiries
              </Link>
              <button
                onClick={handleResetAndClose}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (!isAuthenticated || !currentUser) ? (
          /* Without login - not able to send inquiry: First login then send */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200 shadow-soft">
              <LogIn className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 border border-amber-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Student Login Required</span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-stone-900">
                Please Log In First
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                To guarantee authentic tuition requests and ensure {tutor.name} can review your requirements and respond directly to you, <strong>you must log in to your account first before sending an inquiry</strong>.
              </p>
            </div>

            <div className="bg-warm-50/80 border border-warm-200 rounded-2xl p-4 text-xs text-stone-600 max-w-md mx-auto text-left space-y-2">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Why log in first?
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                • <strong>Direct Connection:</strong> Your inquiry will appear in {tutor.name}'s Educator Dashboard inbox.
              </p>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                • <strong>Real-time Status:</strong> View real-time Accept & Reject decisions in your Student Portal.
              </p>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                • <strong>Contact Unlock:</strong> Direct teacher contact phone numbers unlock immediately once accepted.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 max-w-md mx-auto">
              <Link
                to="/student/auth?mode=login"
                state={{ from: location }}
                onClick={handleResetAndClose}
                className="w-full py-3 px-5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log In as Student / Parent
              </Link>

              <Link
                to="/student/auth?mode=register"
                state={{ from: location }}
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-5 bg-white hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-sm border border-stone-300 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                New Student? Register Free
              </Link>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="text-xs font-semibold text-stone-400 hover:text-stone-600 pt-1"
              >
                Cancel and return
              </button>
            </div>
          </div>
        ) : isTutorAccount ? (
          /* Tutor role detected */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center border border-blue-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-stone-900">
              Educator Account Active
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              You are currently logged in with an Educator profile (<strong>{currentUser?.name}</strong>). Sending home tuition requests is reserved for students and parents.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link
                to="/student/auth?mode=login"
                onClick={handleResetAndClose}
                className="py-2.5 px-5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold rounded-xl text-sm transition"
              >
                Log In as Student
              </Link>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2.5 px-5 bg-stone-100 text-stone-700 font-bold rounded-xl text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Zero advance booking fees. You only pay after attending a trial session and confirming mutual satisfaction.
              </span>
            </div>

            {/* Student & Parent Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="e.g. Arjun Verma"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="e.g. Vikram Verma"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="+91 98112 34567"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            {/* Subject & Class Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject Needed</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                >
                  {tutor.subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Class / Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                >
                  {tutor.classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Board</label>
                <select
                  value={formData.board}
                  onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                >
                  {tutor.boards.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teaching Mode */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Teaching Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
              >
                {tutor.modes.includes('home_visit') && (
                  <option value="home_visit">🏠 Home Visit (Teacher visits student doorstep)</option>
                )}
                {tutor.modes.includes('online') && (
                  <option value="online">💻 Online 1-on-1 Class</option>
                )}
                {tutor.modes.includes('tutor_place') && (
                  <option value="tutor_place">🏫 At Tutor's Residence / Studio</option>
                )}
              </select>
            </div>

            {/* Student Full Location Details */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <MapPin className="w-4 h-4 text-terracotta-600" />
                  <span>Student Location Details</span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Shared with tutor</span>
              </div>

              {/* Exact Doorstep / House Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Doorstep / House / Flat No. & Building <span className="text-terracotta-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.houseLocation}
                  onChange={(e) => setFormData({ ...formData, houseLocation: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                  placeholder="e.g. Flat 402, Block B, Silver Oak Apartments"
                />
              </div>

              {/* Locality & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Locality / Sector / Area <span className="text-terracotta-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                    placeholder="e.g. Greater Kailash II"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Prominent Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                    placeholder="e.g. Near M-Block Market & Park"
                  />
                </div>
              </div>

              {/* City, State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                    placeholder="e.g. New Delhi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State / UT</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                    placeholder="e.g. Delhi NCR"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none bg-white"
                    placeholder="e.g. 110048"
                  />
                </div>
              </div>

              {/* Full Address Preview */}
              {(formData.houseLocation || formData.locality) && (
                <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/80">
                  <span className="font-semibold text-stone-800">Preview for Tutor: </span>
                  {[
                    formData.houseLocation,
                    formData.landmark ? `(Landmark: ${formData.landmark})` : null,
                    formData.locality,
                    formData.city,
                    formData.state,
                    formData.pincode
                  ].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Schedule & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Days</label>
                <input
                  type="text"
                  value={formData.preferredDays}
                  onChange={(e) => setFormData({ ...formData, preferredDays: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="e.g. 3 days / week (Mon, Wed, Fri)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Time Window</label>
                <input
                  type="text"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none"
                  placeholder="e.g. 5:00 PM - 6:30 PM"
                />
              </div>
            </div>

            {/* Learning Goals / Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Student Learning Needs / Goals (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.studentNotes}
                onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none resize-none"
                placeholder="Mention specific chapters, upcoming exams, or areas where the student needs special focus..."
              />
            </div>

            {/* Highlighted Monthly Fee Package Callout */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  Agreed Monthly Package
                </span>
                <span className="text-xs text-stone-600">
                  Standard package (~12 sessions/month • ₹{tutor.rates?.hourly}/hr)
                </span>
              </div>
              <div className="text-right">
                <span className="font-serif text-xl font-bold text-amber-950 block">
                  ₹{tutor.rates?.monthly?.toLocaleString('en-IN') || tutor.rates?.monthly}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">per month</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
