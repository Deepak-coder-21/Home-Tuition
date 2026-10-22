import SiteSettings from '../models/SiteSettings.js';

// Default initial config values
const DEFAULT_SETTINGS = {
  siteName: 'VidyaNest',
  siteTagline: "India's Trusted In-Home & 1-on-1 Tuition Network",
  logoPrefixText: 'Vidya',
  logoHighlightText: 'Nest',
  metaDescription: 'Discover verified educators for primary schooling, board exams, and competitive preps.',
  contactPhone: '+91 (011) 4567-8900',
  parentHelpline: '+91 (011) 4567-8900',
  tutorSupportPhone: '+91 98711 54321',
  supportEmail: 'support@vidyanest.in',
  verificationEmail: 'verification@vidyanest.in',
  parentsEmail: 'parents@vidyanest.in',
  adminOpsEmail: 'admin-ops@vidyanest.in',
  officeAddress: 'Sector 62, Noida, Uttar Pradesh 201309',
  workingHours: 'Mon – Sun: 8:00 AM – 9:00 PM IST',
  homeHeroBadge: "India's Trusted In-Home & 1-on-1 Tuition Network",
  homeHeroTitle: 'Personalized Home Tuition for Every Student',
  homeHeroHighlightText: 'Every Student',
  homeHeroSubtitle: 'Discover verified educators for primary schooling, board exams, and Olympiads. Background-checked, university-verified, and teaching at your doorstep.',
  homeStats: {
    stat1Value: '12,000+',
    stat1Label: 'Happy Families',
    stat2Value: '2,500+',
    stat2Label: 'Verified Tutors',
    stat3Value: '98%',
    stat3Label: 'Score Improvement',
    stat4Value: '100%',
    stat4Label: 'Physical ID & Background Checked'
  },
  homeTrustPledgeTitle: 'Physical ID & Academic Document Verification Pledge',
  homeTrustPledgeSubtitle: 'Every educator profile undergoes rigorous government photo ID audit, university marksheet evaluation, and residence verification.',
  studentPortalTitle: 'Student & Parent Learning Console',
  studentPortalWelcome: 'Manage tuition requests, track direct phone numbers of accepted home educators, and submit verified session evaluations.',
  studentGuidelinesNotice: 'Safety Tip: Always verify educator credentials during the first visit. Tutors unlock rating reviews after 1 month of tuition acceptance.',
  tutorPortalTitle: 'Educator Dashboard & Class Management',
  tutorPortalWelcome: 'Receive direct student inquiries, manage your teaching calendar, and upload credentials for the green Verified Educator checkmark badge.',
  tutorVerificationDeskNotice: 'VidyaNest requires physical degree certificates and government ID proofs. Audits typically complete within 24 business hours.',
  footerCompanyName: 'VidyaNest Education Technologies Pvt. Ltd.',
  footerAboutText: "India's trusted human-curated home tutor discovery network. We rigorously verify educator degrees and criminal backgrounds so your child learns safely and excels.",
  footerCopyrightYear: '2026'
};

// @desc    Get active site settings (Public for all visitors)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'primary_site_settings' });

    if (!settings) {
      settings = await SiteSettings.create({
        key: 'primary_site_settings',
        ...DEFAULT_SETTINGS
      });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve settings at this time.' });
  }
};

// @desc    Update site settings (Admin only)
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'primary_site_settings' });

    if (!settings) {
      settings = new SiteSettings({ key: 'primary_site_settings' });
    }

    const updates = { ...req.body };

    // Disallow overriding schema internal fields
    delete updates.key;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Apply updates
    Object.keys(updates).forEach((field) => {
      if (typeof updates[field] === 'object' && updates[field] !== null && !Array.isArray(updates[field])) {
        // Deep merge for nested objects like homeStats
        settings[field] = {
          ...(settings[field] ? (settings[field].toObject ? settings[field].toObject() : settings[field]) : {}),
          ...updates[field]
        };
      } else {
        settings[field] = updates[field];
      }
    });

    const saved = await settings.save();

    res.json({
      success: true,
      message: 'Website settings updated successfully! Changes are live across the entire website.',
      settings: saved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update website settings.' });
  }
};

// @desc    Reset site settings to default (Admin only)
// @route   POST /api/settings/reset
// @access  Private (Admin only)
export const resetSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'primary_site_settings' });

    if (settings) {
      Object.assign(settings, DEFAULT_SETTINGS);
      await settings.save();
    } else {
      settings = await SiteSettings.create({
        key: 'primary_site_settings',
        ...DEFAULT_SETTINGS
      });
    }

    res.json({
      success: true,
      message: 'Website settings restored to defaults.',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset website settings.' });
  }
};
