import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { checkPasswordStrength } from '../../utils/validation';

export default function PasswordStrengthIndicator({ password, email = '' }) {
  if (!password) return null;

  const strength = checkPasswordStrength(password, email);
  const { checks, score, label, color, isValid } = strength;

  const barColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-600'
  };

  const textColors = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-700'
  };

  return (
    <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs animate-fade-in">
      {/* Top Header: Strength Label & Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold">
          {isValid ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : score <= 1 ? (
            <ShieldAlert className="w-4 h-4 text-red-500" />
          ) : (
            <Shield className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-stone-600 text-[11px]">Password Strength:</span>
          <span className={`font-bold ${textColors[color] || 'text-stone-700'}`}>{label}</span>
        </div>
        <span className="text-[10px] text-stone-400">Must satisfy all 4 rules</span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = step <= score;
          return (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isFilled ? (barColors[color] || 'bg-stone-300') : 'bg-stone-200'
              }`}
            />
          );
        })}
      </div>

      {/* Requirement Badges */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {/* Min 8 chars */}
        <div className={`flex items-center gap-1.5 ${checks.minLength ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
            checks.minLength ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-stone-200 text-stone-400'
          }`}>
            {checks.minLength ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span>8+ characters</span>
        </div>

        {/* Uppercase & Lowercase */}
        <div className={`flex items-center gap-1.5 ${(checks.hasUpper && checks.hasLower) ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
            (checks.hasUpper && checks.hasLower) ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-stone-200 text-stone-400'
          }`}>
            {(checks.hasUpper && checks.hasLower) ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span>Letters (A-Z & a-z)</span>
        </div>

        {/* Number */}
        <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
            checks.hasNumber ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-stone-200 text-stone-400'
          }`}>
            {checks.hasNumber ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span>At least 1 number (0-9)</span>
        </div>

        {/* Special Character */}
        <div className={`flex items-center gap-1.5 ${checks.hasSpecial ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
            checks.hasSpecial ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-stone-200 text-stone-400'
          }`}>
            {checks.hasSpecial ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span>Special symbol (!@#$...)</span>
        </div>
      </div>

      {!checks.notCommon && (
        <p className="text-[11px] text-red-600 font-medium pt-0.5">
          ⚠️ Common or easily guessable password. Please choose a more complex phrase.
        </p>
      )}
    </div>
  );
}
