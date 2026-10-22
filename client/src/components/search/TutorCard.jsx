import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import VerifiedBadge from '../common/VerifiedBadge';
import ModeBadge from '../common/ModeBadge';
import InquiryModal from '../common/InquiryModal';
import { MapPin, Briefcase, GraduationCap, IndianRupee, ArrowRight, Send } from 'lucide-react';

export default function TutorCard({ tutor }) {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 shadow-soft hover:shadow-card transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Top Row: Avatar, Main Info, Verified */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-200 shadow-sm"
              />
              {tutor.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Identity & Degree Verified">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Link
                  to={`/tutors/${tutor.id || tutor._id}`}
                  className="font-serif text-lg sm:text-xl font-bold text-stone-900 hover:text-brand-800 transition truncate"
                >
                  {tutor.name}
                </Link>
                <VerifiedBadge isVerified={tutor.isVerified} />
              </div>

              <p className="text-xs text-stone-600 line-clamp-1 font-medium">
                {tutor.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-stone-500">
                <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} />
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  {tutor.experienceYears} yrs exp.
                </span>
              </div>
            </div>
          </div>

          {/* Qualification & Locality */}
          <div className="bg-warm-50/70 rounded-xl p-3 space-y-1.5 text-xs border border-warm-100">
            <div className="flex items-center gap-2 text-stone-700">
              <GraduationCap className="w-3.5 h-3.5 text-brand-700 shrink-0" />
              <span className="truncate font-medium">{tutor.qualification || 'Verified Educator'}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
              <span className="truncate">
                {tutor.location?.city || 'India'}
                {tutor.location?.localities && tutor.location.localities.length > 0
                  ? ` (${tutor.location.localities.slice(0, 3).join(', ')})`
                  : ''}
              </span>
            </div>
          </div>

          {/* Subjects & Boards Chips */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {(tutor.subjects || []).map((sub) => (
                <span
                  key={sub}
                  className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-xs font-semibold"
                >
                  {sub}
                </span>
              ))}
              {(tutor.boards || []).map((board) => (
                <span
                  key={board}
                  className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 text-xs font-medium"
                >
                  {board}
                </span>
              ))}
            </div>

            {/* Teaching Modes */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(tutor.modes || []).map((mode) => (
                <ModeBadge key={mode} mode={mode} />
              ))}
            </div>
          </div>

        </div>

        {/* Card Footer: Highlighted Monthly Pricing & CTAs */}
        <div className="px-5 py-4 bg-gradient-to-b from-stone-50/90 to-amber-50/30 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl px-3.5 py-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wider text-amber-900">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Monthly Package
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl sm:text-2xl font-black text-amber-950">
                ₹{tutor.rates?.monthly ? tutor.rates.monthly.toLocaleString('en-IN') : (tutor.rates?.hourly ? (tutor.rates.hourly * 12).toLocaleString('en-IN') : 'Contact')}
              </span>
              <span className="text-xs font-bold text-amber-800">/ month</span>
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              ₹{tutor.rates?.hourly || '500'}/hr • 12 classes/mo
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/tutors/${tutor.id || tutor._id}`}
              className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition"
            >
              Profile
            </Link>
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              Book / Inquiry
            </button>
          </div>
        </div>
      </div>

      <InquiryModal
        tutor={tutor}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
