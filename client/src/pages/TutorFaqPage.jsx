import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  AlertTriangle, 
  Phone, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Scale, 
  IndianRupee, 
  MapPin 
} from 'lucide-react';

export default function TutorFaqPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';

  const faqs = [
    {
      q: `Does ${siteName} take any responsibility if there is a dispute, conflict, or non-payment between me and a parent/student?`,
      highlight: true,
      a: `No. ${siteName} is strictly an introductory matching platform and expressly disclaims all responsibility or liability for disputes, disagreements, payment defaults, scheduling conflicts, or any 'mess' between tutors and students or parents. All tuition agreements, fees, session dates, doorstep safety, and conduct are strictly the direct and mutual responsibility of the educator and the parent/student.`
    },
    {
      q: `How do I receive payments from parents? Does ${siteName} charge any commission?`,
      a: `${siteName} charges 0% commission on your tutoring fees. You keep 100% of your earnings. Parents pay you directly via your personal UPI (Google Pay, PhonePe, Paytm), IMPS/NEFT bank transfer, or cash. We do not hold payments in escrow or take any middleman fee.`
    },
    {
      q: "How do tuition inquiries work on VidyaNest?",
      a: "When a parent or student discovers your profile in search results, they submit a detailed inquiry specifying their subject, grade, board, doorstep address, and preferred time slots. This inquiry lands in your Educator Dashboard inbox. You have full freedom to review their location, schedule, and proposed fee before choosing to Accept or Decline."
    },
    {
      q: "Can I view the student's full location before deciding to accept?",
      a: "Yes! VidyaNest provides the student's complete doorstep address, neighborhood locality, city, pincode, and prominent landmark directly on the inquiry card in your dashboard. You can also click 'Google Maps' to instantly view the travel route and commute time from your location."
    },
    {
      q: "What should I do if a parent fails to pay the agreed monthly fee?",
      a: "Because all payment arrangements are privately contracted between you and the parent, VidyaNest does not act as a debt collection or recovery agency. We strongly advise confirming fees in writing over WhatsApp before commencing classes and collecting dues per session or weekly in advance until mutual trust is established. You may also report persistent non-paying accounts to trust@vidyanest.in for platform review."
    },
    {
      q: "What safety precautions should I observe when visiting a student's home?",
      a: "Always verify the student's address prior to travel. On your introductory visit, introduce yourself to an adult parent or guardian, carry your physical photo ID, and ensure lessons take place in an open, visible area (e.g. living room or study with doors open). If at any point you feel uncomfortable or unsafe, you have the absolute right to discontinue the session."
    },
    {
      q: "How does tutor verification work on VidyaNest?",
      a: "To earn the verified educator badge, our administrative compliance team audits your government photo ID (Aadhaar/PAN/Passport) and your highest academic degree or teaching certification. Profiles with verified credentials receive up to 4x higher inquiry volume from parents."
    },
    {
      q: "What if a student or parent writes an unfair or false review on my profile?",
      a: "Tutors can request an administrative audit of any review that violates community standards (e.g. profanity, false allegations, or harassment). The VidyaNest moderation team reviews moderation tickets within 48 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-warm-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Link */}
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
        <div className="bg-brand-950 text-white rounded-3xl p-8 sm:p-10 shadow-soft border border-brand-900 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Educator Helpdesk & Knowledge Base</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Frequently Asked Questions for Tutors
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Everything you need to know about receiving doorstep student inquiries, zero-commission payments, conduct protocols, and our mutual responsibility charter.
          </p>
        </div>

        {/* PROMINENT RESPONSIBILITY DISCLAIMER BANNER */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xs flex items-start gap-4 text-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <span className="font-bold text-amber-950 text-sm block">
              Important: VidyaNest Dispute & Liability Disclaimer
            </span>
            <p className="text-stone-700">
              VidyaNest is a pure technological discovery facilitator. <strong>VidyaNest does not take any responsibility for any dispute, friction, behavioral issue, or payment default between tutors and parents/students.</strong> Both parties enter private tutoring agreements at their own discretion and sole responsibility.
            </p>
            <Link
              to="/tutor/responsibility-policy"
              className="inline-flex items-center gap-1 text-amber-900 font-bold underline hover:text-amber-950 pt-1"
            >
              <span>Read Full Platform Role & Mutual Responsibility Policy</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition overflow-hidden shadow-2xs ${
                  faq.highlight
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-stone-900"
                >
                  <span className="flex items-center gap-2">
                    {faq.highlight && (
                      <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        Important
                      </span>
                    )}
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand-800 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Priority Support Box */}
        <div className="bg-brand-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold">Still Have Questions or Need Help?</h3>
            <p className="text-xs text-brand-200">
              Our Educator Relations Team is available Monday through Saturday.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+9101145678901"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-brand-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 (011) 4567-8901</span>
            </a>
            <a
              href="mailto:tutors@vidyanest.in"
              className="px-4 py-2.5 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl border border-brand-700 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>tutors@vidyanest.in</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
