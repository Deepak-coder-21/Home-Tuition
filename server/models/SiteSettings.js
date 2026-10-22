import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'primary_site_settings',
    unique: true
  },

  // 1. General Branding & Identity
  siteName: {
    type: String,
    default: 'VidyaNest'
  },
  siteTagline: {
    type: String,
    default: "India's Trusted In-Home & 1-on-1 Tuition Network"
  },
  logoPrefixText: {
    type: String,
    default: 'Vidya'
  },
  logoHighlightText: {
    type: String,
    default: 'Nest'
  },
  metaDescription: {
    type: String,
    default: 'Discover verified educators for primary schooling, board exams, and competitive preps.'
  },

  // 2. Contact & Helplines
  contactPhone: {
    type: String,
    default: '+91 (011) 4567-8900'
  },
  parentHelpline: {
    type: String,
    default: '+91 (011) 4567-8900'
  },
  tutorSupportPhone: {
    type: String,
    default: '+91 98711 54321'
  },
  supportEmail: {
    type: String,
    default: 'support@vidyanest.in'
  },
  verificationEmail: {
    type: String,
    default: 'verification@vidyanest.in'
  },
  parentsEmail: {
    type: String,
    default: 'parents@vidyanest.in'
  },
  adminOpsEmail: {
    type: String,
    default: 'admin-ops@vidyanest.in'
  },
  officeAddress: {
    type: String,
    default: 'Sector 62, Noida, Uttar Pradesh 201309'
  },
  workingHours: {
    type: String,
    default: 'Mon – Sun: 8:00 AM – 9:00 PM IST'
  },

  // 3. Home Portal Content
  homeHeroBadge: {
    type: String,
    default: "India's Trusted In-Home & 1-on-1 Tuition Network"
  },
  homeHeroTitle: {
    type: String,
    default: 'Personalized Home Tuition for Every Student'
  },
  homeHeroHighlightText: {
    type: String,
    default: 'Every Student'
  },
  homeHeroSubtitle: {
    type: String,
    default: 'Discover verified educators for primary schooling, board exams, and Olympiads. Background-checked, university-verified, and teaching at your doorstep.'
  },
  homeStats: {
    stat1Value: { type: String, default: '12,000+' },
    stat1Label: { type: String, default: 'Happy Families' },
    stat2Value: { type: String, default: '2,500+' },
    stat2Label: { type: String, default: 'Verified Tutors' },
    stat3Value: { type: String, default: '98%' },
    stat3Label: { type: String, default: 'Score Improvement' },
    stat4Value: { type: String, default: '100%' },
    stat4Label: { type: String, default: 'Physical ID & Background Checked' }
  },
  homeTrustPledgeTitle: {
    type: String,
    default: 'Physical ID & Academic Document Verification Pledge'
  },
  homeTrustPledgeSubtitle: {
    type: String,
    default: 'Every educator profile undergoes rigorous government photo ID audit, university marksheet evaluation, and residence verification.'
  },

  // 4. Student Portal Content
  studentPortalTitle: {
    type: String,
    default: 'Student & Parent Learning Console'
  },
  studentPortalWelcome: {
    type: String,
    default: 'Manage tuition requests, track direct phone numbers of accepted home educators, and submit verified session evaluations.'
  },
  studentGuidelinesNotice: {
    type: String,
    default: 'Safety Tip: Always verify educator credentials during the first visit. Tutors unlock rating reviews after 1 month of tuition acceptance.'
  },

  // 5. Teacher Portal Content
  tutorPortalTitle: {
    type: String,
    default: 'Educator Dashboard & Class Management'
  },
  tutorPortalWelcome: {
    type: String,
    default: 'Receive direct student inquiries, manage your teaching calendar, and upload credentials for the green Verified Educator checkmark badge.'
  },
  tutorVerificationDeskNotice: {
    type: String,
    default: 'VidyaNest requires physical degree certificates and government ID proofs. Audits typically complete within 24 business hours.'
  },

  // 6. Footer & Legal
  footerCompanyName: {
    type: String,
    default: 'VidyaNest Education Technologies Pvt. Ltd.'
  },
  footerAboutText: {
    type: String,
    default: "India's trusted human-curated home tutor discovery network. We rigorously verify educator degrees and criminal backgrounds so your child learns safely and excels."
  },
  footerCopyrightYear: {
    type: String,
    default: '2026'
  }
}, {
  timestamps: true
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export { SiteSettings };
export default SiteSettings;
