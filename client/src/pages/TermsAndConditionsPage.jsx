import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  BookOpen,
  Users,
  GraduationCap,
  Lock,
  HeartHandshake,
  UserCheck,
  Ban,
  Building,
  Printer
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const settings = useSelector((state) => state.settings?.settings) || {};
  const logoPrefix = settings.logoPrefixText || 'Vidya';
  const logoHighlight = settings.logoHighlightText || 'Nest';
  const siteName = settings.siteName || `${logoPrefix}${logoHighlight}`;
  const companyName = settings.footerCompanyName || `${siteName} Education Technologies Pvt. Ltd.`;
  const supportEmail = settings.supportEmail || 'support@vidyanest.in';
  const contactPhone = settings.contactPhone || '+91 (011) 4567-8900';
  const officeAddress = settings.officeAddress || 'Sector 62, Noida, Uttar Pradesh 201309';

  const [activeSection, setActiveSection] = useState('section-1');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const tableOfContents = [
    { id: 'section-1', title: '1. Introduction & Acceptance of Terms' },
    { id: 'section-2', title: '2. Nature of Platform & Intermediary Role' },
    { id: 'section-3', title: '3. User Eligibility & Minor Protection' },
    { id: 'section-4', title: '4. Account Registration & Email Verification' },
    { id: 'section-5', title: '5. Educator Verification & Document Integrity' },
    { id: 'section-6', title: '6. Direct Payments & 0% Platform Commission' },
    { id: 'section-7', title: '7. Lesson Logistics & Doorstep Safety Norms' },
    { id: 'section-8', title: '8. Prohibited Conduct & Zero Child Harm Policy' },
    { id: 'section-9', title: '9. Parent Reviews, Ratings & Content Rules' },
    { id: 'section-10', title: '10. Intellectual Property Rights' },
    { id: 'section-11', title: '11. Disclaimer of Warranties & Outcomes' },
    { id: 'section-12', title: '12. Limitation of Liability & Indemnification' },
    { id: 'section-13', title: '13. Suspension & Account Termination' },
    { id: 'section-14', title: '14. Governing Law & Grievance Redressal' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-brand-900 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs transition cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Document</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-soft border border-brand-800 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>Official User Agreement</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Terms & Conditions of Service
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            This document is a legally binding electronic agreement between you ("User", "Parent", "Student", or "Educator") and {companyName} governing your access to and utilization of the {siteName} home tuition discovery network.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-stone-400 border-t border-white/10">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Effective Date: March 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Document Version: 2.4 (IT Act 2000 Compliant)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              Jurisdiction: Republic of India
            </span>
          </div>
        </div>

        {/* Four Key Pillars Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Matchmaking Portal</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We operate exclusively as a discovery directory. We are not an employer, tuition agency, or placement bureau.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Document Vetted</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Educators submit government photo ID and degree certificates audited by staff prior to official badge grant.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-terracotta-500/10 text-terracotta-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5 text-terracotta-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">0% Commission</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No middleman cuts or agency markups. Parents pay educators 100% directly without escrow deductions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Direct Responsibility</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Session schedules, doorstep safety, and fee schedules are directly negotiated between parents and teachers.
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Navigation + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Table of Contents (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20 bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-brand-800" />
              <span>Table of Contents</span>
            </div>
            <nav className="space-y-1 text-xs max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
                    activeSection === item.id
                      ? 'bg-brand-50 text-brand-950 font-bold border border-brand-200'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[10px] opacity-40">→</span>
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-2">
              <p>
                Have questions regarding compliance or terms?
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="font-bold text-terracotta-600 hover:underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>

          {/* Main Legal Clauses */}
          <div className="lg:col-span-8 space-y-6">

            {/* SECTION 1 */}
            <section id="section-1" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Introduction & Acceptance of Terms
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  1.1. <strong>Binding Legal Contract:</strong> Welcome to {siteName}. These Terms and Conditions of Service ("Terms") constitute a legally binding electronic agreement between you ("User", "you", or "your") and {companyName} ("Company", "{siteName}", "we", "us", or "our"), formulated pursuant to the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
                </p>
                <p>
                  1.2. <strong>Affirmation of Consent:</strong> By accessing our website, creating an account, browsing educator profiles, submitting tuition inquiries, registering as an educator, or clicking "I Agree" during onboarding, you explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms, our <Link to="/responsibility-policy" className="text-terracotta-600 font-bold underline">Platform Role & Responsibility Policy</Link>, and our <Link to="/safety-guidelines" className="text-terracotta-600 font-bold underline">Safety Guidelines</Link>.
                </p>
                <p>
                  1.3. <strong>Immediate Revocation upon Dissent:</strong> If you do not agree to every provision contained within these Terms, you must immediately refrain from creating an account and cease all utilization of our portal and services.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="section-2" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Nature of Platform & Intermediary Role
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  2.1. <strong>Intermediary Classification:</strong> {siteName} operates strictly as an intermediary technology portal and online discovery directory within the meaning of Section 2(1)(w) and Section 79 of the Information Technology Act, 2000.
                </p>
                <p>
                  2.2. <strong>Independent Contractor Relationship:</strong> Educators registered on {siteName} are independent freelance professionals. {siteName} is not a coaching institute, school, educational board, tutor agency, employment agency, or labor contractor. No educator is an employee, servant, partner, agent, or representative of {siteName}.
                </p>
                <p>
                  2.3. <strong>Absence of Employer-Employee Nexus:</strong> {siteName} does not dictate teaching hours, methodologies, textbooks, or curricula. Educators retain full professional autonomy in their educational service delivery.
                </p>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Notice:</strong> {siteName} does not act as an escrow holder, guarantor, arbitrator, or insurer for private home tuition interactions.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="section-3" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  User Eligibility & Minor Protection
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  3.1. <strong>Majority Requirement:</strong> You must be at least 18 years of age and legally competent to enter into a binding contract under the Indian Contract Act, 1872, to create an account on {siteName}.
                </p>
                <p>
                  3.2. <strong>Minor Accounts via Parents Only:</strong> Students under 18 years of age ("Minors") are strictly prohibited from independently creating accounts or communicating with tutors without direct parental oversight. All student registrations must be executed, monitored, and consented to by a parent or legal guardian.
                </p>
                <p>
                  3.3. <strong>Parental Custody During Home Sessions:</strong> Parents and guardians covenant that an adult family member or guardian shall be present within the home premises throughout the entirety of any offline doorstep tutoring session.
                </p>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="section-4" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Account Registration & Email Verification
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  4.1. <strong>Authentic Credentials Mandatory:</strong> Users agree to provide true, accurate, current, and complete personal, geographic, and academic information during registration.
                </p>
                <p>
                  4.2. <strong>Real Email & OTP Enforcement:</strong> All users must verify their email address through a mandatory one-time password (OTP). <strong>The use of temporary, disposable, burner, or fake email domains is strictly forbidden.</strong> Any account created using automated or disposable email generators will be permanently terminated without notice.
                </p>
                <p>
                  4.3. <strong>Password Security:</strong> Users are responsible for creating passwords meeting our strict complexity rules (minimum 8 characters, containing uppercase, lowercase, numerical digits, and special symbols). You are solely responsible for maintaining the confidentiality of your login credentials.
                </p>
                <p>
                  4.4. <strong>No Account Transfer:</strong> Accounts are personal and non-transferable. You may not sell, lease, or sub-license your account to any other individual or agency.
                </p>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="section-5" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Educator Verification & Document Integrity
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  5.1. <strong>Mandatory Document Submissions:</strong> Educators seeking public directory listing must submit valid government-issued photo identification (Aadhaar Card, Indian Passport, or Voter ID) and verifiable highest academic degree certificates.
                </p>
                <p>
                  5.2. <strong>Significance of the "Verified" Badge:</strong> The verified status badge displayed on an educator's profile certifies solely that {siteName}'s administrative staff have audited the educator's submitted documents against platform compliance standards.
                </p>
                <p>
                  5.3. <strong>No Endorsement or Character Warranty:</strong> A verification badge <strong>does not</strong> constitute an endorsement, character warranty, moral certification, continuous physical guarantee, or criminal background guarantee. Parents are required to perform their own independent due diligence, inspect original hard-copy certificates, and assess educator suitability prior to commencing classes.
                </p>
                <p>
                  5.4. <strong>Document Forgery Penalty:</strong> Submitting altered, forged, fraudulent, or impersonated documents will lead to immediate permanent ban, forfeiture of profile listings, and reporting to legal authorities.
                </p>
              </div>
            </section>

            {/* SECTION 6 */}
            <section id="section-6" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Direct Payments & 0% Platform Commission
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  6.1. <strong>Zero Commission Guarantee:</strong> {siteName} does NOT charge commission cuts, percentage royalties, or referral cuts from educator tuition earnings. Educators retain 100% of the tuition fees mutually agreed upon with parents.
                </p>
                <p>
                  6.2. <strong>Direct Financial Settlement:</strong> All financial transactions, monthly tuition fees, hourly rates, and payment terms are executed directly between the parent/student and the educator via cash, direct UPI, or bank transfer.
                </p>
                <p>
                  6.3. <strong>No Financial Intermediation or Refunds:</strong> {siteName} does not collect, receive, hold, or escrow tuition payments. Consequently, {siteName} has zero financial liability, makes no tuition refunds, and shall not be drawn into fee disputes, advance payments, cancellations, or payment defaults.
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="section-7" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  7
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Lesson Logistics & Doorstep Safety Norms
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  7.1. <strong>Private Mutual Arrangements:</strong> Class timings, holiday schedules, syllabus pacing, and cancellation rules are to be mutually agreed in writing (email or messaging) directly between the tutor and the parent.
                </p>
                <p>
                  7.2. <strong>Open Door & Transparent Study Area:</strong> Offline home tuition must always take place in a well-lit common area of the residence (such as a living room, dining area, or study with open doors). Tutoring inside closed private bedrooms is strictly discouraged.
                </p>
                <p>
                  7.3. <strong>Right to Discontinue:</strong> Both educators and parents reserve the unconditional right to discontinue lessons at any juncture if they observe inappropriate conduct, safety violations, or mutual incompatibility.
                </p>
              </div>
            </section>

            {/* SECTION 8 */}
            <section id="section-8" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm">
                  8
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Prohibited Conduct & Zero Child Harm Policy
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  8.1. <strong>Absolute Zero Tolerance for Child Abuse:</strong> Any form of verbal abuse, physical chastisement, inappropriate physical contact, sexual harassment, emotional intimidation, or exploitation of minor students is strictly illegal under the Protection of Children from Sexual Offences (POCSO) Act, 2012, and Indian law.
                </p>
                <p>
                  8.2. <strong>Immediate Legal Reporting:</strong> In the event of any allegation or suspicion of child abuse, {siteName} will immediately deactivate the accused party's account and cooperate fully with law enforcement authorities.
                </p>
                <p>
                  8.3. <strong>Prohibited Platform Activities:</strong> Users shall not:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                  <li>Use automated web crawlers, scrapers, or bots to harvest tutor phone numbers or platform data;</li>
                  <li>Post misleading, defamatory, obscene, or fraudulent material;</li>
                  <li>Impersonate any person or entity, or falsely state or misrepresent academic qualifications;</li>
                  <li>Attempt to disrupt server infrastructure or reverse engineer platform algorithms;</li>
                  <li>Send unsolicited promotional messages, multi-level marketing solicitations, or spam.</li>
                </ul>
              </div>
            </section>

            {/* SECTION 9 */}
            <section id="section-9" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  9
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Parent Reviews, Ratings & Content Rules
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  9.1. <strong>Authentic Experience Requirement:</strong> Reviews and star ratings may only be submitted by registered students or parents who have genuinely engaged with the educator for at least 30 days following an accepted tuition inquiry.
                </p>
                <p>
                  9.2. <strong>Fair Feedback & Defamation Prohibition:</strong> Reviews must represent honest, constructive academic experiences. Users may not post abusive, slanderous, extortionate, or vindictive remarks.
                </p>
                <p>
                  9.3. <strong>Editorial Moderation Rights:</strong> {siteName} reserves the right, in its sole discretion, to investigate, moderate, or remove reviews that violate content guidelines, contain foul language, or represent proven malicious smear campaigns.
                </p>
              </div>
            </section>

            {/* SECTION 10 */}
            <section id="section-10" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  10
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Intellectual Property Rights
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  10.1. <strong>Proprietary Assets:</strong> All trademarks, logos, service marks, website architecture, user interface elements, graphic designs, algorithms, codebases, and domain names associated with {siteName} are the exclusive intellectual property of {companyName}.
                </p>
                <p>
                  10.2. <strong>Limited License:</strong> Users are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the platform solely for personal, non-commercial home tutor matching purposes.
                </p>
                <p>
                  10.3. <strong>User Content License:</strong> By posting profile details, photographs, or reviews on {siteName}, you grant the Company a royalty-free, worldwide license to host, display, and index such material across the platform.
                </p>
              </div>
            </section>

            {/* SECTION 11 */}
            <section id="section-11" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  11
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Disclaimer of Warranties & Academic Outcomes
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  11.1. <strong>"As Is" Service Delivery:</strong> The {siteName} platform, directory listings, search filters, and verification features are provided strictly on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, statutory, or implied.
                </p>
                <p>
                  11.2. <strong>No Warranty of Academic Outcomes:</strong> {siteName} expressly disclaims any warranty that home tutoring arranged via the platform will guarantee specific school examination marks, entrance ranks, competitive test qualifications, or behavioral transformations. Academic achievement depends on individual student diligence and private teaching efficacy.
                </p>
                <p>
                  11.3. <strong>Uptime & Connectivity:</strong> While we endeavor to maintain uninterrupted platform availability, we do not warrant that our servers will be error-free, immune to cyber attacks, or perpetually accessible.
                </p>
              </div>
            </section>

            {/* SECTION 12 */}
            <section id="section-12" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  12
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Limitation of Liability & Indemnification
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  12.1. <strong>Liability Cap:</strong> To the maximum extent permitted under applicable law, {companyName}, its directors, officers, employees, and agents shall NOT be liable for any direct, indirect, incidental, punitive, special, or consequential damages resulting from:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Any personal injury, theft, property loss, or damage occurring on private home premises;</li>
                  <li>Any financial defaults, fee disputes, or non-payment between tutors and parents;</li>
                  <li>Any cancellations, tardiness, or breach of private teaching agreements;</li>
                  <li>Any defamatory or inappropriate conduct between users.</li>
                </ul>
                <p>
                  12.2. <strong>Statutory Cap:</strong> In any circumstance where liability is judicially determined, the Company's aggregate liability to any user shall be strictly limited to the amount paid by that user to {siteName} in the preceding 3 months, or INR ₹1,000, whichever is lower.
                </p>
                <p>
                  12.3. <strong>Indemnity Obligation:</strong> You agree to defend, indemnify, and hold harmless {companyName}, its officers, and affiliates against any claims, losses, liabilities, costs, or legal fees arising from your use of the platform, your breach of these Terms, or your private offline conduct.
                </p>
              </div>
            </section>

            {/* SECTION 13 */}
            <section id="section-13" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  13
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Suspension & Account Termination
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  13.1. <strong>Administrative Action:</strong> {siteName} reserves the absolute right to suspend, restrict, block, or delete any student, parent, or tutor account without prior notice if we determine, in our sole discretion, that a user has:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Breached any provision of these Terms or related platform policies;</li>
                  <li>Submitted fake, disposable, or unverified email addresses;</li>
                  <li>Uploaded forged, altered, or suspicious identity or degree documents;</li>
                  <li>Received verified complaints from parents or teachers regarding abusive or unsafe behavior;</li>
                  <li>Engaged in spamming or platform data harvesting.</li>
                </ul>
                <p>
                  13.2. <strong>Account Deletion by User:</strong> You may request deletion of your account at any time by contacting our administrative desk at {supportEmail}.
                </p>
              </div>
            </section>

            {/* SECTION 14 */}
            <section id="section-14" className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-sm">
                  14
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Governing Law & Grievance Redressal
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                <p>
                  14.1. <strong>Jurisdiction:</strong> These Terms shall be interpreted and governed exclusively by the laws of the Republic of India. The courts of competent jurisdiction located at New Delhi / Gautam Buddha Nagar (Noida), Uttar Pradesh, India, shall have exclusive territorial jurisdiction over any disputes arising under this agreement.
                </p>
                <p>
                  14.2. <strong>Arbitration:</strong> Any dispute or difference arising out of or in connection with these Terms shall first be attempted to be resolved amicably through good-faith mutual negotiations for a period of 30 days before initiating any formal legal proceedings.
                </p>
                <p>
                  14.3. <strong>Designated Grievance Officer:</strong> In compliance with the Information Technology Act, 2000, and rules framed thereunder, the contact details of the Grievance Redressal Officer are provided below:
                </p>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 space-y-1.5">
                  <div className="font-bold text-stone-900 text-sm">Grievance & Legal Compliance Desk</div>
                  <div><strong>Entity:</strong> {companyName}</div>
                  <div><strong>Registered Office:</strong> {officeAddress}</div>
                  <div><strong>Email:</strong> {supportEmail} (Subject: "Grievance Redressal")</div>
                  <div><strong>Telephone:</strong> {contactPhone} (Mon–Fri, 10:00 AM – 6:00 PM IST)</div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* BOTTOM CONFIRMATION & CROSS-LINKS BOX */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Clear Policies Build Safe Learning Relationships
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            By registering with {siteName}, both educators and parents partner with mutual respect, commitment to child safety, and high academic integrity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-bold">
            <Link
              to="/responsibility-policy"
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
            >
              Responsibility & Liability Policy →
            </Link>
            <Link
              to="/safety-guidelines"
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
            >
              Doorstep Safety Guidelines →
            </Link>
            <Link
              to="/faq"
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
            >
              Frequently Asked Questions →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
