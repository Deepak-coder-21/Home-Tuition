import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addTutorReview } from '../store/slices/tutorsSlice';
import StarRating from '../components/common/StarRating';
import VerifiedBadge from '../components/common/VerifiedBadge';
import ModeBadge from '../components/common/ModeBadge';
import InquiryModal from '../components/common/InquiryModal';
import { 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Send, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Award, 
  MessageSquare, 
  Star,
  Loader2 
} from 'lucide-react';

export default function TutorDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { tutors, loading } = useSelector((state) => state.tutors);
  const { currentUser, currentRole } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';

  const tutor = tutors.find((t) => t.id === id || t._id === id);

  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newSubject, setNewSubject] = useState(tutor?.subjects?.[0] || 'Mathematics');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (loading && !tutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-700 animate-spin mx-auto" />
        <p className="text-stone-500 text-sm">Loading educator profile...</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Educator Profile Not Found</h2>
        <p className="text-stone-500 text-sm">This educator profile may have been updated or does not exist.</p>
        <Link to="/search" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-brand-900 transition">
          Return to All Tutors
        </Link>
      </div>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      setReviewError('Please log in as a student to submit a review.');
      return;
    }

    const reviewPayload = {
      studentName: currentUser?.studentName || currentUser?.name || "Verified Student",
      parentName: currentUser?.name || "Parent",
      rating: newRating,
      subject: newSubject,
      comment: newComment.trim()
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
          tutorId: tutor._id || tutor.id,
          ...reviewPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || 'Ratings can only be given after 1 month of accepting a tuition inquiry.');
        setIsSubmittingReview(false);
        return;
      }

      dispatch(addTutorReview({
        tutorId: tutor._id || tutor.id,
        review: data.review || reviewPayload
      }));

      setNewComment('');
      setReviewFormOpen(false);
    } catch (err) {
      setReviewError(err.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper to determine if a specific proof is approved/verified vs pending
  const getDocStatus = (proofText, docType) => {
    if (Array.isArray(tutor.verificationDocuments) && tutor.verificationDocuments.length > 0) {
      const match = tutor.verificationDocuments.find(d => d.docType === docType);
      if (match) {
        if (match.status === 'approved') return 'approved';
        if (match.status === 'rejected') return 'rejected';
        return 'pending';
      }
    }

    if (!proofText) return 'pending';
    const lower = String(proofText).toLowerCase();
    if (!tutor.isVerified || lower.includes('pending') || lower.includes('awaiting') || lower.includes('not uploaded') || lower.includes('review')) {
      return 'pending';
    }
    return 'approved';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back to search link */}
      <div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tutors Search</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-soft overflow-hidden">
        <div className="bg-gradient-to-r from-brand-900 to-brand-950 p-6 sm:p-10 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-lg"
              />
              {tutor.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-brand-900 shadow">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
                  {tutor.name}
                </h1>
                <VerifiedBadge isVerified={tutor.isVerified} size="lg" />
              </div>

              <p className="text-stone-300 text-sm sm:text-base font-medium max-w-2xl">
                {tutor.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-300 pt-1">
                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="font-bold text-white">{tutor.rating}</span>
                  <span>({tutor.reviewCount} parent reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-300" />
                  <span>{tutor.experienceYears} Years Experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>{tutor.location?.city || 'India'}{tutor.location?.state ? `, ${tutor.location.state}` : ''}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-gradient-to-br from-white/15 to-white/5 p-5 rounded-2xl border border-amber-400/30 shadow-lg shrink-0 backdrop-blur-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-amber-400/30">
                ⭐ Monthly Package
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-black text-amber-300 mt-0.5">
                ₹{tutor.rates?.monthly?.toLocaleString('en-IN') || tutor.rates?.monthly}
                <span className="text-xs text-white/90 font-sans font-medium"> / month</span>
              </div>
              <div className="text-xs text-stone-200 mt-1 font-medium">
                ₹{tutor.rates?.hourly}/hr • approx. 12 classes / month
              </div>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="mt-3 w-full px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Request Tuition
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="bg-warm-50 px-6 sm:px-10 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Available Modes:</span>
            <div className="flex flex-wrap gap-1.5">
              {(tutor.modes || []).map((m) => (
                <ModeBadge key={m} mode={m} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-600">
            <ShieldCheck className={`w-4 h-4 shrink-0 ${tutor.isVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span>{tutor.isVerified ? `Identity & Degrees audited by ${siteName} Admin` : 'Credentials submitted • Administrative audit pending'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Details & Side info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: About, Credentials, Subjects, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About & Teaching Philosophy */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-soft space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-700" />
              Teaching Philosophy & Background
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-normal">
              {tutor.bio}
            </p>

            {tutor.achievements && tutor.achievements.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Key Achievements & Credentials
                </h3>
                <ul className="space-y-2">
                  {tutor.achievements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Subjects & Curriculum Taught */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-soft space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Subjects & Curriculums Covered
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.subjects || []).map((sub) => (
                    <span key={sub} className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-900 font-bold text-xs">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Classes / Grades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.classes || []).map((cls) => (
                    <span key={cls} className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-semibold text-xs">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Education Boards
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.boards || []).map((b) => (
                    <span key={b} className="px-2.5 py-1 rounded-md bg-terracotta-50 text-terracotta-800 font-semibold text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews & Parent Feedback */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-soft space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-700" />
                  Parent & Student Reviews
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {tutor.reviewCount} verified session evaluations
                </p>
              </div>

              <button
                onClick={() => setReviewFormOpen(!reviewFormOpen)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition"
              >
                {reviewFormOpen ? 'Cancel Review' : '+ Leave a Review'}
              </button>
            </div>

            {/* Leave a review form */}
            {reviewFormOpen && (
              <form onSubmit={handleReviewSubmit} className="bg-warm-50 p-5 rounded-xl border border-warm-200 space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-stone-900">Add Your Experience with {tutor.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-lg border border-warm-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>1-Month Policy:</strong> Ratings and reviews unlock after 1 month (30 days) of accepted tuition to ensure 100% authentic evaluations.</span>
                  </div>
                </div>

                {reviewError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{reviewError}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-600">Your Rating:</span>
                  <StarRating rating={newRating} interactive={true} onRate={setNewRating} size="md" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Subject Taken</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-stone-300 bg-white"
                    >
                      {(tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects : ['General Tuition', 'Mathematics']).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Your Detailed Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe punctuality, teaching style, test preparation, and score improvements..."
                    className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:border-brand-700 outline-none resize-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}</span>
                </button>
              </form>
            )}

            {/* Review Items */}
            <div className="space-y-4">
              {(!tutor.reviews || tutor.reviews.length === 0) ? (
                <div className="text-center py-6 text-stone-500 text-xs">
                  No reviews submitted yet for this newly onboarded educator.
                </div>
              ) : (
                tutor.reviews.map((rev) => (
                  <div key={rev.id || rev._id} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={rev.rating} size="sm" />
                        <span className="text-xs font-bold text-stone-800">{rev.subject}</span>
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="text-[11px] font-semibold text-stone-500">
                      — {rev.studentName} {rev.parentName && `(Parent: ${rev.parentName})`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Location, Verification Documents, Booking Card */}
        <div className="space-y-6">
          
          {/* Quick Action Booking Card */}
          <div className="bg-brand-900 text-white rounded-2xl p-6 shadow-soft space-y-4">
            <h3 className="font-serif text-xl font-bold">Book a Trial Session</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Send a tuition request directly to {tutor.name}. Review schedules and proceed only after a trial session.
            </p>
            {/* Highlighted Monthly Fee Banner */}
            <div className="p-3.5 bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 rounded-xl space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                <span>Monthly Package Highlight</span>
                <span className="bg-amber-400/30 text-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">12 Classes</span>
              </div>
              <div className="font-serif text-2xl font-black text-amber-300">
                ₹{tutor.rates?.monthly?.toLocaleString('en-IN') || tutor.rates?.monthly}
                <span className="text-xs font-normal text-white/80 font-sans"> / month</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-300 pt-1 border-t border-white/10">
                <span>Per single session:</span>
                <span className="font-bold text-white">₹{tutor.rates?.hourly} / hr</span>
              </div>
            </div>
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Tuition Request
            </button>
          </div>

          {/* Service Area & Localities */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-soft space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta-600" />
              Service Localities
            </h3>
            <p className="text-xs text-stone-600">
              Available for home visits in the following localities within <strong>{tutor.location?.city || 'the area'}</strong>:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(tutor.location?.localities || []).map((loc) => (
                <span key={loc} className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-xs">
                  {loc}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 font-medium">
              PIN Codes covered: {tutor.location?.pincodes && tutor.location.pincodes.length > 0 ? tutor.location.pincodes.join(', ') : (tutor.location?.pincode || tutor.pincode || 'Contact for specific sector')}
            </div>
          </div>

          {/* Audit & Verification Transparency Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${tutor.isVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span>Verification Documents</span>
              </h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                tutor.isVerified 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {tutor.isVerified ? 'Audited & Verified' : 'Audit Pending'}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700">
              {/* Government ID */}
              {(() => {
                const status = getDocStatus(tutor.verificationDetails?.idProof, 'id_proof');
                const isApproved = status === 'approved';
                const isPending = status === 'pending';
                return (
                  <li className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50/70 border border-stone-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {isApproved ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="truncate">
                        Government ID: <strong className="text-stone-900">{tutor.verificationDetails?.idProof || (isPending ? 'Pending Upload' : 'Verified')}</strong>
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isPending 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {isApproved ? 'Verified ✓' : isPending ? 'Pending' : 'Action Needed'}
                    </span>
                  </li>
                );
              })()}

              {/* Academic Degrees */}
              {(() => {
                const status = getDocStatus(tutor.verificationDetails?.degreeProof, 'degree_certificate');
                const isApproved = status === 'approved';
                const isPending = status === 'pending';
                return (
                  <li className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50/70 border border-stone-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {isApproved ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="truncate">
                        Academic Degrees: <strong className="text-stone-900">{tutor.verificationDetails?.degreeProof || (isPending ? 'Pending Upload' : 'Verified')}</strong>
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isPending 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {isApproved ? 'Verified ✓' : isPending ? 'Pending' : 'Action Needed'}
                    </span>
                  </li>
                );
              })()}

              {/* Residence Proof */}
              {(() => {
                const status = getDocStatus(tutor.verificationDetails?.addressProof, 'address_proof');
                const isApproved = status === 'approved';
                const isPending = status === 'pending';
                return (
                  <li className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50/70 border border-stone-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {isApproved ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="truncate">
                        Residence Proof: <strong className="text-stone-900">{tutor.verificationDetails?.addressProof || (isPending ? 'Pending Upload' : 'Verified')}</strong>
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isPending 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {isApproved ? 'Verified ✓' : isPending ? 'Pending' : 'Action Needed'}
                    </span>
                  </li>
                );
              })()}
            </ul>

            {tutor.isVerified && tutor.verificationDetails?.verifiedAt ? (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60 font-medium mt-2 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All credentials audited and approved on {new Date(tutor.verificationDetails.verifiedAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-950 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 font-medium mt-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Credentials submitted • Under administrative compliance review</span>
              </div>
            )}
          </div>

        </div>

      </div>

      <InquiryModal
        tutor={tutor}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />

    </div>
  );
}
