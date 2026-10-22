import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Award, 
  HeartHandshake, 
  FileCheck,
  Scale,
  Sparkles
} from 'lucide-react';

export default function TutorGuidelinesPage() {
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';
  return (
    <div className="min-h-screen bg-warm-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back link */}
        <div>
          <Link
            to="/tutor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-900 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Educator Dashboard</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-brand-950 text-white rounded-3xl p-8 sm:p-10 shadow-soft border border-brand-900 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Educator Professional Guidelines</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Teaching Standards & Doorstep Conduct Protocol
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            As a verified educator on {siteName}, you represent the highest standard of academic rigor and student mentorship. Follow these guidelines to maintain outstanding parent reviews, high retention, and safe teaching environments.
          </p>
        </div>

        {/* RESPONSIBILITY CALLOUT ALERT */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-amber-950 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm">Reminder: Private Direct Engagement</span>
            <p className="text-stone-700 leading-relaxed">
              {siteName} connects verified tutors directly with students. All lesson scheduling, payment transactions, safety assessments, and mutual expectations are the direct, private responsibility of parents and educators.
            </p>
            <Link to="/tutor/responsibility-policy" className="inline-block text-amber-800 font-bold underline hover:text-amber-950 pt-0.5">
              Read our Platform Role & Mutual Responsibility Policy →
            </Link>
          </div>
        </div>

        {/* CORE GUIDELINES CARDS */}
        <div className="space-y-6">

          {/* 1. Professional Doorstep Protocol */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Doorstep Teaching Etiquette (Home Visits)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-800" />
                  <span>Punctuality & Communication</span>
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Always arrive 5 minutes before the scheduled session. If unforeseen traffic or transit delays occur, inform the parent via WhatsApp or phone call at least 30 minutes in advance.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Identity Verification on First Visit</span>
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Carry your physical Aadhaar, PAN card, or Driver's License to present to the parent during your introductory session to build immediate mutual trust.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-700" />
                  <span>Professional Boundaries</span>
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Conduct lessons exclusively in common areas or open study rooms where a parent or guardian is nearby. Maintain purely academic communication with students at all times.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>Attire & Deportment</span>
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Dress in smart, formal, or business casual attire suitable for an academic environment. Mobile phones should be placed on silent mode during lesson hours.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Introductory Trial Session Structure */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Conducting an Effective Trial / Intro Session
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              The first 30-45 minute trial session determines whether the student's learning style aligns with your pedagogy. Recommended flow:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <span className="font-bold text-stone-900 block">Diagnostic Assessment (15 Mins)</span>
                  <span className="text-stone-600">Review the student's latest test papers, school textbooks, and pinpoint specific conceptual bottlenecks in the subject.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <span className="font-bold text-stone-900 block">Micro-Lesson Demonstration (20 Mins)</span>
                  <span className="text-stone-600">Teach one focused sub-topic using intuitive real-world examples to demonstrate your clear pedagogical method.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <span className="font-bold text-stone-900 block">Parent Debrief & Milestone Agreement (10 Mins)</span>
                  <span className="text-stone-600">Discuss proposed weekly schedule, monthly fee, and target goals with parents before confirming regular classes.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Transparent Direct Payments */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Fee Terms & Direct Parent Payments
              </h2>
            </div>
            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <p>
                VidyaNest does not take cuts or charge commission on your earnings. To prevent payment misunderstandings:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                  <span className="font-bold text-stone-900 block mb-1">✓ Written Fee Confirmation</span>
                  <span>Confirm the agreed monthly package (e.g. ₹9,000 for 12 sessions) over WhatsApp/SMS before commencing.</span>
                </div>
                <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                  <span className="font-bold text-stone-900 block mb-1">✓ Attendance & Session Log</span>
                  <span>Keep a dated session log signed or acknowledged by the parent at the end of each teaching week.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <Link
            to="/tutor/responsibility-policy"
            className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Read Mutual Responsibility & Liability Policy</span>
          </Link>

          <Link
            to="/tutor/dashboard"
            className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Go to Tutor Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
