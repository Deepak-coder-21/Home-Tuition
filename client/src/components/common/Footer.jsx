import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  BookOpen,
  Users,
  Search,
  Send,
  Activity,
  Bell,
  Sliders,
  Database,
  Lock,
  Server,
  ExternalLink,
  FileCheck,
  Headphones,
  HeartHandshake
} from 'lucide-react';

export default function Footer() {
  const { currentRole, isAuthenticated } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings?.settings) || {};
  const logoPrefix = settings.logoPrefixText || 'Vidya';
  const logoHighlight = settings.logoHighlightText || 'Nest';
  const siteName = settings.siteName || `${logoPrefix}${logoHighlight}`;
  const companyName = settings.footerCompanyName || `${siteName} Education Technologies Pvt. Ltd.`;
  const copyrightYear = settings.footerCopyrightYear || new Date().getFullYear();
  const contactPhone = settings.contactPhone || '+91 (011) 4567-8900';
  const parentHelpline = settings.parentHelpline || contactPhone;
  const tutorSupportPhone = settings.tutorSupportPhone || '+91 (011) 4567-8901';
  const supportEmail = settings.supportEmail || 'support@vidyanest.in';
  const parentsEmail = settings.parentsEmail || 'parents@vidyanest.in';
  const tutorEmail = settings.verificationEmail || 'tutors@vidyanest.in';
  const adminOpsEmail = settings.adminOpsEmail || 'admin-ops@vidyanest.in';
  const officeAddress = settings.officeAddress || 'Sector 62, Noida, Uttar Pradesh 201309';
  const footerAboutText = settings.footerAboutText || "India's trusted human-curated home tutor discovery network. We rigorously verify educator degrees and criminal backgrounds so your child learns safely and excels.";

  const location = useLocation();

  const isAdmin = (isAuthenticated && currentRole === 'admin') || location.pathname.startsWith('/admin');
  const isTutor = !isAdmin && ((isAuthenticated && currentRole === 'tutor') || location.pathname.startsWith('/tutor'));
  const isStudent = !isAdmin && !isTutor && ((isAuthenticated && currentRole === 'student') || location.pathname.startsWith('/student'));

  // =========================================================================
  // 1. ADMIN PORTAL FOOTER (Executive Governance & Operational Desk)
  // =========================================================================
  if (isAdmin) {
    return (
      <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Executive Admin Operations Strip */}
          <div className="pb-8 mb-8 border-b border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-stone-900 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-white tracking-tight">
                    {logoPrefix}<span className="text-emerald-400">{logoHighlight}</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Central Admin Console
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Platform Verification, Document Audits & System Governance Infrastructure
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-300">
              <div className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Systems Operational (99.98% SLA)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-stone-300">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>MongoDB Atlas Sync: Active</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Super Admin Clearance</span>
              </div>
            </div>
          </div>

          {/* 4 Column Admin Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Portal Governance */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-4 h-4" />
                <span>Executive Governance</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/admin/portal?tab=overview" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Command Center Overview</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/portal?tab=tutors" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Teacher Verification & Document Audits</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/portal?tab=students" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Student Accounts Moderation</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/portal?tab=reviews" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Parent & Student Review Moderation</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/portal?tab=messages" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Urgent Platform Announcements</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Audit Standards & Verification */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-emerald-400">
                <FileCheck className="w-4 h-4" />
                <span>Audit & Standards</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-emerald-400 transition block">
                    Educator Verification Protocols
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-responsibility-policy" className="hover:text-emerald-400 transition block">
                    Zero Commission Compliance Charter
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-responsibility-policy" className="hover:text-emerald-400 transition block">
                    Platform Role & Liability Framework
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-emerald-400 transition block">
                    Code of Ethics & Doorstep Safety Norms
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-faq" className="hover:text-emerald-400 transition block">
                    Educator Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-emerald-400 transition block">
                    Terms & Conditions of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Cross-Portal Access */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-emerald-400">
                <ExternalLink className="w-4 h-4" />
                <span>Cross-Portal Access</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Public Home Page</span>
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Live Tutor Directory Search</span>
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>How Tuition Matching Works</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tutor/login" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Educator Network Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/login" className="hover:text-emerald-400 transition flex items-center gap-2">
                    <span>Parent & Student Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Internal IT & Tech Escalation Desk */}
            <div className="space-y-3 bg-stone-900/90 p-4 rounded-2xl border border-stone-800">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <Server className="w-4 h-4" />
                <span>IT Infrastructure & Escalations</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Emergency escalation desk for server health, database sync, or platform moderation emergencies:
              </p>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center gap-2 text-stone-200">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+91 (011) 4567-8999 (Staff Hot Desk)</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{adminOpsEmail}</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-800 flex items-center justify-between">
                <span>Server Region: AWS ap-south-1</span>
                <span className="text-emerald-400 font-bold">24x7 Monitored</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Terms */}
          <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© {copyrightYear} {companyName} Executive Administration Console. Internal Staff Use Only.</p>
            <div className="flex flex-wrap items-center gap-6 text-stone-400">
              <Link to="/tutor-responsibility-policy" className="hover:text-emerald-400 transition">
                Platform Responsibility Charter
              </Link>
              <Link to="/tutor-guidelines" className="hover:text-emerald-400 transition">
                Verification Guidelines
              </Link>
              <Link to="/terms-and-conditions" className="hover:text-emerald-400 transition">
                Terms & Conditions
              </Link>
              <Link to="/" className="hover:text-emerald-400 transition">
                Exit to Public Website →
              </Link>
            </div>
          </div>

        </div>
      </footer>
    );
  }

  // =========================================================================
  // 2. TUTOR / EDUCATOR SPECIFIC FOOTER
  // =========================================================================
  if (isTutor) {
    return (
      <footer className="bg-brand-950 text-stone-300 border-t border-brand-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          
          {/* Educator Banner Strip */}
          <div className="pb-10 mb-10 border-b border-brand-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-brand-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-white tracking-tight">
                    {logoPrefix}<span className="text-amber-400">{logoHighlight}</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Educator Network
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  The premier verified network for professional home & 1-on-1 private educators in India
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-300">
              <div className="flex items-center gap-1.5 bg-brand-900/80 px-3 py-1.5 rounded-xl border border-brand-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>0% Commission (Keep 100% Fee)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-900/80 px-3 py-1.5 rounded-xl border border-brand-800">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Full Doorstep Locations</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-900/80 px-3 py-1.5 rounded-xl border border-brand-800">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Direct Parents</span>
              </div>
            </div>
          </div>

          {/* 4 Column Educator Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Educator Workspace */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-amber-300">
                <Layers className="w-4 h-4" />
                <span>Educator Workspace</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/tutor/dashboard?tab=inbox" className="hover:text-amber-300 transition flex items-center gap-2">
                    <span>Student Inquiries Inbox</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tutor/dashboard?tab=profile" className="hover:text-amber-300 transition flex items-center gap-2">
                    <span>Profile & Rate Editor</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tutor/dashboard?tab=service_areas" className="hover:text-amber-300 transition flex items-center gap-2">
                    <span>Service Localities & Modes</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tutor/dashboard?tab=verification" className="hover:text-amber-300 transition flex items-center gap-2">
                    <span>Document Verification & ID Badges</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tutor/dashboard?tab=reviews" className="hover:text-amber-300 transition flex items-center gap-2">
                    <span>Parent Reviews & Ratings</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Teaching Resources */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-amber-300">
                <BookOpen className="w-4 h-4" />
                <span>Teaching Standards</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-amber-300 transition block">
                    Doorstep Safety & Ethics Protocol
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-amber-300 transition block">
                    First Trial Session Best Practices
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-amber-300 transition block">
                    CBSE / ICSE / IB Syllabus Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-guidelines" className="hover:text-amber-300 transition block">
                    Punctuality & Cancellation Norms
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Tutor Policies & Legal Disclaimer */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-amber-300">
                <Award className="w-4 h-4" />
                <span>Policies & Disclaimers</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/tutor-responsibility-policy" className="hover:text-amber-300 transition block text-amber-300/90 font-medium">
                    Platform Responsibility & Dispute Policy
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-responsibility-policy" className="hover:text-amber-300 transition block">
                    Zero Liability & Direct Agreement Charter
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-faq" className="hover:text-amber-300 transition block">
                    Educator FAQ & Common Questions
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-responsibility-policy" className="hover:text-amber-300 transition block">
                    Zero Commission Guarantee (100% Retained)
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-amber-300 transition block">
                    Terms & Conditions of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Educator Helpdesk & Support */}
            <div className="space-y-3 bg-brand-900/60 p-4 rounded-2xl border border-brand-800">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                <Phone className="w-4 h-4" />
                <span>Educator Priority Desk</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dedicated support line for verified teachers regarding inquiries, credentials, or schedules:
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tutorSupportPhone} (Tutor Line)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tutorEmail}</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-stone-400 border-t border-brand-800 flex items-center justify-between">
                <span>Mon – Sat: 9AM – 8PM IST</span>
                <Link to="/tutor-faq" className="text-amber-400 font-bold hover:underline">
                  FAQ Desk →
                </Link>
              </div>
            </div>
          </div>

          {/* Legal Responsibility & Dispute Disclaimer Banner */}
          <div className="bg-brand-900/80 border border-amber-400/30 rounded-2xl p-4 sm:p-5 my-8 flex items-start gap-3.5 text-xs text-stone-300 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300 block text-sm mb-1">
                Notice: Independent Platform & Mutual Responsibility Charter
              </span>
              <p className="text-stone-300">
                {siteName} operates strictly as an introductory matching directory. <strong>{siteName} does not take any responsibility or liability for disputes, misunderstandings, behavioural issues, payment defaults, or any conflicts between tutors and students or parents.</strong> All tuition arrangements, session schedules, and doorstep safety are strictly the mutual and direct private responsibility of parents and educators.
              </p>
              <Link to="/tutor-responsibility-policy" className="inline-block text-amber-300 font-bold underline hover:text-white pt-1">
                Read our detailed Platform Role & Responsibility Policy →
              </Link>
            </div>
          </div>

          {/* Bottom Copyright & Terms */}
          <div className="mt-8 pt-6 border-t border-brand-900/90 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© {copyrightYear} {siteName} Educator Network. Dedicated Educator Portal.</p>
            <div className="flex flex-wrap items-center gap-6 text-stone-400">
              <Link to="/tutor-responsibility-policy" className="hover:text-amber-300 transition">
                Responsibility & Liability Policy
              </Link>
              <Link to="/tutor-guidelines" className="hover:text-amber-300 transition">
                Educator Code of Conduct
              </Link>
              <Link to="/tutor-faq" className="hover:text-amber-300 transition">
                Tutor FAQ
              </Link>
              <Link to="/terms-and-conditions" className="hover:text-amber-300 transition">
                Terms & Conditions
              </Link>
              <Link to="/admin/login" className="hover:text-emerald-400 text-stone-400 flex items-center gap-1.5 transition font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // =========================================================================
  // 3. STUDENT & PARENT SPECIFIC FOOTER
  // =========================================================================
  if (isStudent) {
    return (
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          
          {/* Student & Parent Banner Strip */}
          <div className="pb-10 mb-10 border-b border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-white tracking-tight">
                    {logoPrefix}<span className="text-terracotta-500">{logoHighlight}</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30">
                    Student & Parent Workspace
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Safe, verified doorstep home tuition mentoring for Class 1 to 12 across India
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-300">
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Degrees & ID Proofs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Free Trial / Demo Consultations</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
                <HeartHandshake className="w-4 h-4 text-terracotta-400" />
                <span>0% Agency Markups or Commissions</span>
              </div>
            </div>
          </div>

          {/* 4 Column Student Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Student Workspace */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-terracotta-400">
                <Send className="w-4 h-4" />
                <span>Student & Parent Portal</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/student/dashboard?tab=inquiries" className="hover:text-terracotta-400 transition flex items-center gap-2">
                    <span>My Tuition Inquiries</span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/dashboard?tab=connected" className="hover:text-terracotta-400 transition flex items-center gap-2">
                    <span>Connected Educators</span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/dashboard?tab=profile" className="hover:text-terracotta-400 transition flex items-center gap-2">
                    <span>Update Student Profile & Grade</span>
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-terracotta-400 transition flex items-center gap-2">
                    <span>Find Verified Home Tutors</span>
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-terracotta-400 transition flex items-center gap-2">
                    <span>How Tuition Matching Works</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Grades & Academic Boards */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-terracotta-400">
                <BookOpen className="w-4 h-4" />
                <span>Grades & Academic Boards</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/search?class=Class+1+-+5+(Primary)" className="hover:text-terracotta-400 transition block">
                    Primary School (Class 1 - 5)
                  </Link>
                </li>
                <li>
                  <Link to="/search?class=Class+6+-+8+(Middle)" className="hover:text-terracotta-400 transition block">
                    Middle School (Class 6 - 8)
                  </Link>
                </li>
                <li>
                  <Link to="/search?class=Class+9+-+10+(Secondary)" className="hover:text-terracotta-400 transition block">
                    Secondary Boards (Class 9 - 10)
                  </Link>
                </li>
                <li>
                  <Link to="/search?class=Class+11+-+12+(Senior+Secondary)" className="hover:text-terracotta-400 transition block">
                    Senior Secondary (Class 11 - 12)
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-terracotta-400 transition block">
                    CBSE, ICSE, IB & Cambridge Tutors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Parent Safety & Mutual Policy */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-terracotta-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Safety & Parent Guidelines</span>
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>
                  <Link to="/safety-guidelines" className="hover:text-terracotta-400 transition block">
                    Home Tuition Safety Protocols
                  </Link>
                </li>
                <li>
                  <Link to="/responsibility-policy" className="hover:text-terracotta-400 transition block">
                    Parent & Tutor Mutual Charter
                  </Link>
                </li>
                <li>
                  <Link to="/responsibility-policy" className="hover:text-terracotta-400 transition block">
                    Dispute & Payment Agreement Policy
                  </Link>
                </li>
                <li>
                  <Link to="/tutor-faq" className="hover:text-terracotta-400 transition block">
                    Parent Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-terracotta-400 transition block">
                    Terms & Conditions of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Parent Counseling Desk */}
            <div className="space-y-3 bg-stone-800/60 p-4 rounded-2xl border border-stone-700">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-terracotta-400">
                <Phone className="w-4 h-4" />
                <span>Academic Matchmaking Desk</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Connect directly with our parent counseling team for personalized teacher recommendations:
              </p>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center gap-2 text-stone-200 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>{parentHelpline} (Parent Line)</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <Mail className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>{parentsEmail}</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-700 flex items-center justify-between">
                <span>Mon – Sun: 8AM – 9PM IST</span>
                <span className="text-emerald-400 font-bold">Free Assistance</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Terms */}
          <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© {copyrightYear} {companyName} Student & Parent Portal. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6 text-stone-400">
              <Link to="/responsibility-policy" className="hover:text-terracotta-400 transition">
                Responsibility & Liability Disclaimer
              </Link>
              <Link to="/safety-guidelines" className="hover:text-terracotta-400 transition">
                Safety Guidelines
              </Link>
              <Link to="/tutor-faq" className="hover:text-terracotta-400 transition">
                Parent FAQ
              </Link>
              <Link to="/terms-and-conditions" className="hover:text-terracotta-400 transition">
                Terms & Conditions
              </Link>
              <Link to="/admin/login" className="hover:text-emerald-400 text-stone-400 flex items-center gap-1.5 transition font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // =========================================================================
  // 4. STANDARD PUBLIC VISITOR FOOTER (Unauthenticated visitors)
  // =========================================================================
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-amber-200 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                {logoPrefix}<span className="text-terracotta-500">{logoHighlight}</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              {footerAboutText}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-stone-800/60 p-2.5 rounded-lg border border-stone-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Physical ID & Document Verified Tutors</span>
            </div>
          </div>

          {/* Col 2: Top Subjects */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Popular Subjects</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link to="/search?subject=Mathematics" className="hover:text-amber-300 transition">Class 9 - 12 Mathematics</Link></li>
              <li><Link to="/search?subject=Physics" className="hover:text-amber-300 transition">CBSE & ICSE Physics</Link></li>
              <li><Link to="/search?subject=Chemistry" className="hover:text-amber-300 transition">NEET & Board Chemistry</Link></li>
              <li><Link to="/search?subject=Computer+Science" className="hover:text-amber-300 transition">Python & Computer Science</Link></li>
              <li><Link to="/search?subject=Accountancy" className="hover:text-amber-300 transition">Class 11 - 12 Accounts & CA</Link></li>
              <li><Link to="/search?subject=English" className="hover:text-amber-300 transition">English Literature & Spoken</Link></li>
            </ul>
          </div>

          {/* Col 3: Cities Covered */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Tutors in Key Cities</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link to="/search?city=New+Delhi" className="hover:text-amber-300 transition">Home Tutors in Delhi NCR</Link></li>
              <li><Link to="/search?city=Mumbai" className="hover:text-amber-300 transition">Home Tutors in Mumbai</Link></li>
              <li><Link to="/search?city=Bengaluru" className="hover:text-amber-300 transition">Home Tutors in Bengaluru</Link></li>
              <li><Link to="/search?city=Pune" className="hover:text-amber-300 transition">Home Tutors in Pune</Link></li>
              <li><Link to="/search?city=Kolkata" className="hover:text-amber-300 transition">Home Tutors in Kolkata</Link></li>
              <li><Link to="/search?city=Jaipur" className="hover:text-amber-300 transition">Home Tutors in Jaipur</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact & Support</h4>
            <p className="text-sm text-stone-400">
              Speak directly with an Academic Counselor to find the right tutor match:
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-300">
              <Phone className="w-4 h-4 text-terracotta-400" />
              <span>{contactPhone} / 24x7</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-300">
              <Mail className="w-4 h-4 text-terracotta-400" />
              <span>{supportEmail}</span>
            </div>
            <div className="pt-2 text-xs text-stone-500">
              Registered Office: {officeAddress}
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {copyrightYear} {companyName} All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/responsibility-policy" className="hover:text-stone-400 transition">
              Responsibility & Liability Disclaimer
            </Link>
            <Link to="/safety-guidelines" className="hover:text-stone-400 transition">
              Safety Guidelines
            </Link>
            <Link to="/tutor-faq" className="hover:text-stone-400 transition">
              FAQ
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-stone-400 transition">
              Terms & Conditions
            </Link>
            <Link to="/admin/login" className="hover:text-emerald-400 text-stone-400 flex items-center gap-1.5 transition font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
