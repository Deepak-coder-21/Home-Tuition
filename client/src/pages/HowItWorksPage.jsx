import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Search, 
  Send, 
  Calendar, 
  CheckCircle, 
  MapPin, 
  IndianRupee,
  ArrowRight,
  FileCheck,
  HeartHandshake,
  Lock
} from 'lucide-react';

export default function HowItWorksPage() {
  const { currentRole, isAuthenticated } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';
  const isStudentLoggedIn = isAuthenticated && currentRole === 'student';
  const isTutorLoggedIn = isAuthenticated && currentRole === 'tutor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>Transparent & Direct 1-on-1 Tutoring</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          How {siteName} Works
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {isStudentLoggedIn
            ? `Learn how ${siteName} makes finding, connecting with, and hiring verified 1-on-1 home tutors for your child simple, safe, and transparent.`
            : isTutorLoggedIn
            ? `Learn how ${siteName} helps passionate educators grow their independent tutoring practice and connect directly with genuine students.`
            : `Whether you are a parent looking for a trusted home tutor or a passionate educator ready to mentor students in your neighborhood, ${siteName} makes the connection seamless and secure.`}
        </p>
      </div>

      {/* For Students & Parents (Shown for students and visitors; hidden for tutors) */}
      {!isTutorLoggedIn && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-soft space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">For Parents & Students</h2>
              <p className="text-xs text-stone-500">Step-by-step journey to find your ideal tutor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-100 space-y-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-stone-900">Location & Subject Search</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Enter your state, city, or locality. Filter by subject, class (Class 1-12, JEE/NEET), board, and budget.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-100 space-y-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-stone-900">Verify Credentials & Reviews</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Examine genuine teacher degrees, past parent reviews, teaching modes (Home Visit, Online), and rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-100 space-y-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-stone-900">Send Tuition Inquiry</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Specify your child's learning goals and preferred days. Submit with zero upfront fee or agency commission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-100 space-y-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-sm text-stone-900">Trial Class & Ongoing Learning</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                When accepted, speak directly with the tutor, arrange an introductory session, and monitor progress.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <span>Search Verified Tutors Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isStudentLoggedIn && (
              <Link
                to="/student/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition"
              >
                <Send className="w-4 h-4 text-terracotta-600" />
                <span>View My Tuition Requests</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Safety & Quality Standards for Parents (Dedicated section for logged-in students) */}
      {isStudentLoggedIn && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-soft space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Safety & Quality Standards for Parents
              </h2>
              <p className="text-xs text-stone-500">How we protect students and ensure authentic home tutoring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">100% ID & Degree Screening</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tutor educational certificates, degrees, and government ID proofs are manually audited by our moderation team prior to verification badge approval.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Direct Mutual Agreement</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                No middleman commissions or inflated rates. Discuss tutoring schedule, tuition venue, and fees directly with the educator.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Safe In-Home Tutoring</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We advise holding sessions in common household study areas and setting clear mutual attendance rules with the educator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* For Tutors (Hidden when student is logged in!) */}
      {!isStudentLoggedIn && (
        <div className="bg-brand-900 text-white rounded-3xl p-8 sm:p-12 border border-brand-800 shadow-soft space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-800 text-amber-200 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">For Tutors & Teachers</h2>
              <p className="text-xs text-brand-200">How to grow your tutoring practice with genuine students</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-300 text-brand-950 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-white">Submit Profile & Documents</h3>
              <p className="text-xs text-brand-200 leading-relaxed">
                Upload your degrees, ID proof, and specify your subjects, boards, and hourly / monthly pricing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-300 text-brand-950 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-white">Admin Verification Audit</h3>
              <p className="text-xs text-brand-200 leading-relaxed">
                Our compliance team reviews credentials to award the green "Verified Tutor" badge for high parent trust.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-300 text-brand-950 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-white">Set Your Service Localities</h3>
              <p className="text-xs text-brand-200 leading-relaxed">
                Choose the exact sectors, pincodes, and modes (Home Visits, Online, or at your residence) you prefer.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-300 text-brand-950 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-sm text-white">Accept Direct Inquiries</h3>
              <p className="text-xs text-brand-200 leading-relaxed">
                Review student schedules in your dashboard inbox, accept matching inquiries, and keep 100% of your fee.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={isTutorLoggedIn ? "/tutor/dashboard" : "/tutor/register"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-brand-950 text-xs font-bold rounded-xl shadow transition"
            >
              <span>{isTutorLoggedIn ? "Open Tutor Dashboard" : "Become a Tutor Today"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
