import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';

export default function VerifiedBadge({ isVerified, size = "sm" }) {
  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}>
        <ShieldCheck className={size === 'lg' ? "w-4 h-4 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
        <span>Verified Tutor</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${
      size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
    }`}>
      <Clock className={size === 'lg' ? "w-3.5 h-3.5 text-amber-600" : "w-3 h-3 text-amber-600"} />
      <span>Verification In Review</span>
    </span>
  );
}
