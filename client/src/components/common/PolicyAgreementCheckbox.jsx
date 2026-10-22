import React from 'react';
import { ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

export default function PolicyAgreementCheckbox({
  id = 'policy-agreement',
  checked,
  onChange,
  role = 'student', // 'student' | 'tutor'
  hasError = false,
  errorMessage = ''
}) {
  const settings = useSelector((state) => state.settings?.settings) || {};
  const siteName = settings.siteName || 'VidyaNest';
  const isTutor = role === 'tutor';
  const policyLink = isTutor ? '/tutor-responsibility-policy' : '/responsibility-policy';
  const guidelinesLink = isTutor ? '/tutor-guidelines' : '/safety-guidelines';

  return (
    <div className={`p-3 rounded-xl transition border ${
      hasError 
        ? 'bg-red-50/70 border-red-300 ring-1 ring-red-300' 
        : checked
        ? 'bg-emerald-50/40 border-emerald-300/80'
        : 'bg-stone-50 border-stone-200'
    }`}>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-brand-800 rounded border-stone-300 focus:ring-brand-700 cursor-pointer accent-brand-800 shrink-0"
        />
        <label htmlFor={id} className="text-xs text-stone-700 leading-relaxed cursor-pointer select-none">
          <span>I have read and unconditionally agree to {siteName}'s </span>
          <Link
            to="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-terracotta-600 hover:text-terracotta-700 underline inline-flex items-center gap-0.5"
          >
            <span>Terms & Conditions</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
          <span>, </span>
          <Link
            to={policyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-terracotta-600 hover:text-terracotta-700 underline inline-flex items-center gap-0.5"
          >
            <span>Responsibility Policy</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
          <span>, and </span>
          <Link
            to={guidelinesLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-terracotta-600 hover:text-terracotta-700 underline inline-flex items-center gap-0.5"
          >
            <span>Safety Guidelines</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
          <span>. I understand this platform connects independent parties and does not employ tutors.</span>
        </label>
      </div>

      {hasError && (
        <div className="mt-2 pt-2 border-t border-red-200/60 flex items-center gap-1.5 text-[11px] text-red-600 font-semibold animate-shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage || 'You must agree to the platform policies to complete registration.'}</span>
        </div>
      )}
    </div>
  );
}
