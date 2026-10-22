import React from 'react';
import { Home, Video, Building2 } from 'lucide-react';

const MODE_MAP = {
  home_visit: {
    label: "Home Visit",
    icon: Home,
    colorClass: "bg-brand-50 text-brand-800 border-brand-200"
  },
  online: {
    label: "Online 1-on-1",
    icon: Video,
    colorClass: "bg-sky-50 text-sky-800 border-sky-200"
  },
  tutor_place: {
    label: "At Tutor's Place",
    icon: Building2,
    colorClass: "bg-stone-100 text-stone-700 border-stone-200"
  }
};

export default function ModeBadge({ mode }) {
  const meta = MODE_MAP[mode] || { label: mode, icon: Home, colorClass: "bg-stone-50 text-stone-700 border-stone-200" };
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${meta.colorClass}`}>
      <Icon className="w-3 h-3" />
      <span>{meta.label}</span>
    </span>
  );
}
