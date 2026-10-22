import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../store/slices/filtersSlice';
import TutorCard from '../components/search/TutorCard';
import { SUBJECTS_LIST, CLASSES_LIST } from '../data/mockData';
import { useLocationData } from '../hooks/useLocationData';
import { 
  Search, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Award,
  Sparkles,
  Compass,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tutors } = useSelector((state) => state.tutors);
  const { isAuthenticated, currentRole } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const isTutorLoggedIn = isAuthenticated && currentRole === 'tutor';

  const { states: availableStates, isLoadingStates } = useLocationData();

  const [searchState, setSearchState] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchClass, setSearchClass] = useState('');

  const verifiedTutors = tutors.filter(t => t.isVerified && !t.isBlocked);
  const featuredTutors = (verifiedTutors.length > 0 ? verifiedTutors : tutors.filter(t => !t.isBlocked)).slice(0, 3);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    dispatch(setFilter({ key: 'selectedState', value: searchState || '' }));
    dispatch(setFilter({ key: 'selectedCity', value: '' }));
    dispatch(setFilter({ key: 'selectedLocality', value: '' }));
    if (searchSubject) dispatch(setFilter({ key: 'selectedSubject', value: searchSubject }));
    if (searchClass) dispatch(setFilter({ key: 'selectedClass', value: searchClass }));
    navigate('/search');
  };

  const handleQuickSubject = (subject) => {
    dispatch(setFilter({ key: 'selectedSubject', value: subject }));
    navigate('/search');
  };

  const handleQuickState = (state) => {
    dispatch(setFilter({ key: 'selectedState', value: state }));
    dispatch(setFilter({ key: 'selectedCity', value: '' }));
    dispatch(setFilter({ key: 'selectedLocality', value: '' }));
    navigate('/search');
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 bg-gradient-to-b from-warm-100/70 via-stone-50 to-white rounded-3xl border border-stone-200/70 p-6 sm:p-12 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.homeHeroBadge || "India's Trusted In-Home & 1-on-1 Tuition Network"}</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
            {settings.homeHeroTitle || "Personalized Home Tuition for Every Student"}
          </h1>
          
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {settings.homeHeroSubtitle || "Discover verified educators for primary schooling, board exams, and Olympiads. Background-checked, university-verified, and teaching at your doorstep."}
          </p>
        </div>

        {/* Hero Quick Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 p-2 rounded-2xl shadow-soft backdrop-blur-xs border border-warm-200/80">
            <form 
              onSubmit={handleHeroSearch}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-elevated border border-stone-200 text-left grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* State Selection */}
              <div className="sm:col-span-4 relative">
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                  State / Region
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
                  <select
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full text-xs font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="">
                      {isLoadingStates && availableStates.length === 0 
                        ? "Loading States from Postal Network..." 
                        : `All States & UTs of India (${availableStates.length} States)`}
                    </option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="sm:col-span-4 relative border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                  Subject
                </label>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-700 shrink-0" />
                  <select
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full text-xs font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="">Any Subject</option>
                    {SUBJECTS_LIST.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class Selection & Search Button */}
              <div className="sm:col-span-4 flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                    Class / Grade
                  </label>
                  <select
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                    className="w-full text-xs font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="">All Classes</option>
                    {CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Find</span>
                </button>
              </div>
            </form>

            {/* Quick Filter Tags: Popular Subjects & States */}
            <div className="space-y-1.5 pt-2.5">
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-stone-600">
                <span className="font-semibold text-stone-400 text-[11px]">Popular Subjects:</span>
                {['Mathematics', 'Physics', 'Chemistry', 'Computer Science & Python', 'Economics'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleQuickSubject(sub)}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs transition"
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-stone-600">
                <span className="font-semibold text-stone-400 text-[11px]">Browse by State:</span>
                {['Delhi NCR', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Tamil Nadu'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleQuickState(st)}
                    className="px-2.5 py-0.5 rounded-full bg-warm-50 border border-warm-200/90 hover:border-terracotta-400 text-stone-700 hover:text-terracotta-700 text-xs transition font-medium"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Social Proof Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-stone-200/80 text-center">
            <div>
              <div className="font-serif text-3xl font-bold text-brand-900">{settings.homeStats?.stat1Value || "12,000+"}</div>
              <div className="text-xs text-stone-500 font-medium mt-1">{settings.homeStats?.stat1Label || "Happy Families"}</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-brand-900">{settings.homeStats?.stat2Value || "2,500+"}</div>
              <div className="text-xs text-stone-500 font-medium mt-1">{settings.homeStats?.stat2Label || "Verified Tutors"}</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-brand-900">{settings.homeStats?.stat3Value || "98%"}</div>
              <div className="text-xs text-stone-500 font-medium mt-1">{settings.homeStats?.stat3Label || "Score Improvement"}</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-brand-900">{settings.homeStats?.stat4Value || "100%"}</div>
              <div className="text-xs text-stone-500 font-medium mt-1">{settings.homeStats?.stat4Label || "Physical ID & Background Checked"}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS (Parents vs Tutors) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            Simple & Transparent
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            How {settings.siteName || 'VidyaNest'} Connects You
          </h2>
          <p className="text-stone-600 text-sm">
            Designed for busy parents seeking safe, expert academic mentorship at home, and for dedicated educators wanting genuine students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* For Parents */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-soft space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-terracotta-50 text-terracotta-700 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>For Parents & Students</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Find your ideal home tutor in 3 steps
            </h3>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Search by Locality & Subject</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Filter verified educators who visit your specific sector or pincode for CBSE, ICSE, or competitive exams.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Review Verified Credentials & Rates</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Check genuine degree transcripts, ID verification stamps, past parent reviews, and transparent pricing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Send Direct Request & Trial Session</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Send your schedule needs. The tutor calls you directly to organize an introductory trial session.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 pt-2"
            >
              <span>Explore Available Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Tutors */}
          <div className="bg-brand-900 text-white rounded-3xl p-8 border border-brand-800 shadow-soft space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-800 text-amber-200 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>For Qualified Tutors</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Teach in your neighborhood on your terms
            </h3>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-800 text-amber-200 font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Build Your Professional Profile</h4>
                  <p className="text-xs text-brand-200 mt-1">
                    Showcase your degrees, board expertise, teaching style, and set your own hourly or monthly fees.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-800 text-amber-200 font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Specify Your Travel Localities</h4>
                  <p className="text-xs text-brand-200 mt-1">
                    Define the exact cities, pincodes, and teaching modes (Home Visit, Online, or at your place) you cater to.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-800 text-amber-200 font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Receive Direct Tuition Inquiries</h4>
                  <p className="text-xs text-brand-200 mt-1">
                    Accept inquiries that match your schedule, connect with parents directly, and keep 100% of your earnings.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to={isTutorLoggedIn ? "/tutor/dashboard" : "/tutor/register"}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 pt-2"
            >
              <span>{isTutorLoggedIn ? "Go to Tutor Dashboard" : "Register as an Educator"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. FEATURED VERIFIED TUTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Verified Educators
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Featured Home Tutors
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Hand-picked teachers with stellar ratings and proven student results.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-800 hover:text-brand-900 hover:underline"
          >
            <span>Browse All {tutors.length} Tutors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTutors.map((tutor) => (
            <TutorCard key={tutor.id || tutor._id} tutor={tutor} />
          ))}
        </div>
      </section>

      {/* 4. TRUST & VERIFICATION PLEDGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>The 4-Point Tutor Trust Protocol</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              {settings.homeTrustPledgeTitle || "Safety and academic excellence are not optional. We verify every tutor."}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Government ID Validation</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Every tutor uploads Aadhaar, Voter ID or Passport verified by our compliance team.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">University Degree & Marksheet Audit</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    We verify graduation and post-graduation degrees from recognized institutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Residential Address Proof</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Electricity bills or registered rent agreements confirm physical locality presence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Parent Ratings & Feedback</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Only authentic students who have booked classes can leave verified reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            Real Experiences
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            Loved by Parents & Students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
              "Finding a reliable physics tutor for Class 12 CBSE in South Delhi was stressful until we discovered Dr. Rajesh Sharma on VidyaNest. Truly personal attention and zero hassle."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center">
                SM
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Sanjay Mehra</h4>
                <p className="text-[11px] text-stone-500">Parent of Class 12 student, New Delhi</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
              "Pooja ma'am in Koramangala completely changed my daughter's mindset about math. Her grades went from 60s to 92 in ICSE. Transparent fee and punctual visits."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-terracotta-100 text-terracotta-800 font-bold text-xs flex items-center justify-center">
                MH
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Meenakshi Hegde</h4>
                <p className="text-[11px] text-stone-500">Parent, Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
              "As a tutor myself, VidyaNest has provided genuine, serious students in my local area without taking exorbitant agency cuts. Highly recommend both parents and educators."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center">
                AB
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Amitabh Banerjee</h4>
                <p className="text-[11px] text-stone-500">Chemistry Tutor, Kolkata</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-card">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold max-w-xl mx-auto leading-tight">
            Ready to match with a dedicated tutor in your neighborhood?
          </h2>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            Browse verified profiles, compare reviews, and book an introductory session today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/search"
              className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              Browse Verified Tutors
            </Link>
            <Link
              to={isTutorLoggedIn ? "/tutor/dashboard" : "/tutor/register"}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition"
            >
              {isTutorLoggedIn ? "Educator Dashboard" : "Join as an Educator"}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
