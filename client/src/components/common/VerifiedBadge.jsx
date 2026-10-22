import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';

export default function VerifiedBadge({ isVerified, size = "sm" }) {
  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 sm:gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0 whitespace-nowrap shadow-2xs ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px] sm:text-[11px]'
      }`}>
        <ShieldCheck className={`shrink-0 ${size === 'lg' ? "w-4 h-4 text-emerald-600" : "w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600"}`} />
        <span className="leading-tight">Verified Tutor</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0 whitespace-nowrap shadow-2xs ${
      size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px] sm:text-[11px]'
    }`}>
      <Clock className={`shrink-0 ${size === 'lg' ? "w-3.5 h-3.5 text-amber-600" : "w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600"}`} />
      <span className="leading-tight">
        <span className={size === 'lg' ? '' : 'sm:hidden'}>In Review</span>
        {size !== 'lg' && <span className="hidden sm:inline">Verification In Review</span>}
      </span>
    </span>
  );
}

