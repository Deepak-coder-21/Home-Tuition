import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Scale, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  FileText,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function TutorResponsibilityPolicyPage() {
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';
  return (
    <div className="min-h-screen bg-warm-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Navigation */}
        <div>
          <Link
            to="/tutor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-900 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Educator Dashboard</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 shadow-soft border border-stone-800 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Disclaimer & Mutual Responsibility Charter</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Platform Role & Mutual Responsibility Policy
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Please read this policy carefully. {siteName} functions solely as an introductory discovery network connecting independent tutors and parents. <strong>{siteName} does NOT take any responsibility or liability for any dispute, conflict, behavioral issue, financial discrepancy, or mishap between tutors, students, and parents.</strong>
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Effective Date: March 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Applicable to: All Tutors, Students & Parents
            </span>
          </div>
        </div>

        {/* CRITICAL WARNING BANNER */}
        <div className="bg-amber-50 border-2 border-amber-300/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">
                Key Principle: Absolute Mutual Responsibility
              </h2>
              <p className="text-xs text-amber-800 font-medium">
                Parents and Teachers are directly and exclusively responsible for their own conduct, safety, vetting, and agreements.
              </p>
            </div>
          </div>
          <div className="bg-white/80 p-4 rounded-xl border border-amber-200/80 text-xs text-stone-700 space-y-2 leading-relaxed">
            <p>
              <strong>1. No Intermediary Liability:</strong> {siteName} does not employ, manage, supervise, or control private home tutors, nor does it control or inspect the premises of students' homes. We do not act as an escrow agent, guarantor, or arbiter.
            </p>
            <p>
              <strong>2. Direct Private Arrangements:</strong> All teaching arrangements, hourly or monthly fees, payment dates, class schedules, doorstep access, and learning expectations are privately contracted between the parent/guardian and the independent educator.
            </p>
            <p>
              <strong>3. Independent Due Diligence:</strong> While {siteName} provides physical identity and credential audit checks, parents are strongly encouraged to independently verify tutor credentials and supervise all home tutoring sessions. Tutors must similarly evaluate their own commute safety and working comfort.
            </p>
          </div>
        </div>

        {/* DETAILED POLICY CLAUSES */}
        <div className="space-y-6">

          {/* Section 1: Nature of the Platform */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Discovery & Introductory Role Only
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              VidyaNest acts solely as a self-service technological directory to help students discover qualified educators based on subject, grade, and geographic locality. VidyaNest is not a tutoring agency, coaching institute, or school. Acceptance of an inquiry establishes a direct, independent relationship solely between the tutor and the parent/student.
            </p>
            <ul className="text-xs text-stone-600 space-y-2 pl-4 list-disc">
              <li>Tutors operate as independent freelance professionals, not employees, agents, or partners of VidyaNest.</li>
              <li>VidyaNest does not set teaching methodologies, syllabi, test papers, or academic targets.</li>
              <li>VidyaNest does not represent or guarantee any particular academic score, test rank, or exam outcome.</li>
            </ul>
          </div>

          {/* Section 2: Zero Responsibility for Disputes & Conduct */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-red-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-red-100">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-red-950">
                Disclaimer of Liability for Conduct, Disputes & Incidents
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              VIDYANEST EXPRESSLY DISCLAIMS ANY AND ALL LIABILITY OR RESPONSIBILITY ARISING FROM:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 space-y-1">
                <span className="font-bold text-red-950 block">Disagreements & Arguments</span>
                <span className="text-stone-600 leading-relaxed block">
                  Disputes over syllabus coverage, teaching speed, student homework completion, student attentiveness, or teaching style differences.
                </span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 space-y-1">
                <span className="font-bold text-red-950 block">Financial & Fee Disputes</span>
                <span className="text-stone-600 leading-relaxed block">
                  Delayed payments, non-payment by parents, advance fee refunds, fee renegotiations, or cancellation penalties.
                </span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 space-y-1">
                <span className="font-bold text-red-950 block">Punctuality & Cancellations</span>
                <span className="text-stone-600 leading-relaxed block">
                  Missed classes, late arrivals, last-minute cancellations by either tutor or parent, or rescheduling friction.
                </span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 space-y-1">
                <span className="font-bold text-red-950 block">Doorstep & Premises Incidents</span>
                <span className="text-stone-600 leading-relaxed block">
                  Any physical mishap, property damage, loss of personal items, or interpersonal altercation occurring at the student's residence or tutor's study space.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Arrangements & 100% Direct Payout */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Direct Financial Dealings & 0% Commission
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              VidyaNest charges <strong>0% commission</strong> on tutoring earnings. All payments are made directly between the parent and the tutor via UPI, bank transfer, or cash:
            </p>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2 text-stone-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Platform Escrow:</strong> VidyaNest does not collect, hold, or disburse monthly tuition fees.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Agreed Payment Terms:</strong> Both parties must agree in writing (e.g. WhatsApp/SMS) on payment milestones (per session, weekly, or month-end).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Fee Recovery Service:</strong> If a parent fails to pay or a tutor fails to conduct agreed sessions after receiving advance, VidyaNest does not act as a debt collection or refund agency. Legal recourse remains between the private parties.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Home Visit Safety & Doorstep Protocols */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Mandatory Home Visit Safety Protocols
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-warm-50/80 p-4 rounded-xl border border-warm-200/80 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-terracotta-600" />
                  <span>Responsibilities for Parents</span>
                </h4>
                <ul className="space-y-1.5 text-stone-600 list-disc pl-4">
                  <li>An adult family member should remain present in the home during tuition hours.</li>
                  <li>Classes should be conducted in an open, visible area (e.g. study room with open doors or living area).</li>
                  <li>Verify the tutor's government identity card physically on their first visit.</li>
                  <li>Clearly specify family house rules regarding entry, exit, and timing.</li>
                </ul>
              </div>

              <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-200/80 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-800" />
                  <span>Responsibilities for Tutors</span>
                </h4>
                <ul className="space-y-1.5 text-stone-600 list-disc pl-4">
                  <li>Carry original or digital copies of government photo ID on your introductory visit.</li>
                  <li>Strictly maintain professional educator decorum and respectful boundaries at all times.</li>
                  <li>Do not engage in discussions unrelated to the student's academic curriculum.</li>
                  <li>Evaluate the commute route and doorstep location prior to accepting visits.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Platform Moderation Rights */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                What VidyaNest DOES Provide: Moderation & Blacklisting
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              While VidyaNest does not intervene in financial or behavioral disputes, we maintain zero tolerance for unlawful, abusive, or dangerous conduct. In the event of credible complaints:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Immediate Delisting</span>
                <span className="text-stone-500 block">Tutors or parents violating safety standards will have their profile revoked immediately.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Permanent Blacklist</span>
                <span className="text-stone-500 block">Offenders will be blocked by phone, email, and ID from re-registering on the platform.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Law Enforcement Cooperation</span>
                <span className="text-stone-500 block">VidyaNest fully cooperates with police investigations and court orders as required by law.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Contact Support Helpdesk Callout */}
        <div className="bg-brand-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold">Have Questions or Need to Report an Incident?</h3>
            <p className="text-xs text-brand-200">
              Our trust & moderation team reviews serious safety reports within 4 hours.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:trust@vidyanest.in"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-brand-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Report to Trust Desk</span>
            </a>
            <Link
              to="/tutor/faq"
              className="px-4 py-2.5 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl border border-brand-700 transition"
            >
              Educator FAQ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
