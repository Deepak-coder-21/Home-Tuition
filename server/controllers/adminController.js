import TutorProfile from '../models/TutorProfile.js';
import Inquiry from '../models/Inquiry.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Notice from '../models/Notice.js';
import { checkAndSendDocumentReminders, getDocumentReminderStats, cleanNoticeMemory } from '../utils/documentReminderScheduler.js';

// @desc    Get tutor verification queue
// @route   GET /api/admin/verification-queue
// @access  Private (Admin only)
export const getVerificationQueue = async (req, res) => {
  try {
    const pendingTutors = await TutorProfile.find({ isVerified: false }).sort({ createdAt: -1 });
    const verifiedTutors = await TutorProfile.find({ isVerified: true }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      pendingCount: pendingTutors.length,
      verifiedCount: verifiedTutors.length,
      pendingTutors,
      verifiedTutors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve verification audit queue.' });
  }
};

// @desc    Approve or revoke tutor verification badge
// @route   PUT /api/admin/tutors/:id/verify
// @access  Private (Admin only)
export const verifyTutorStatus = async (req, res) => {
  try {
    const { isVerified, notes } = req.body;
    const tutor = await TutorProfile.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    /* === [START DEMO LOGIN FEATURE - TUTOR VERIFY SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      const simulatedTutor = tutor.toObject ? tutor.toObject() : { ...tutor };
      simulatedTutor.isVerified = !!isVerified;
      simulatedTutor.verificationStatus = isVerified ? 'verified' : 'rejected';
      simulatedTutor.isDemo = true;
      return res.json({
        success: true,
        isDemo: true,
        message: isVerified 
          ? 'Tutor verification simulated in Demo Mode: changes are not saved in demo login.' 
          : 'Tutor rejection simulated in Demo Mode: changes are not saved in demo login.',
        tutor: simulatedTutor
      });
    }
    /* === [END DEMO LOGIN FEATURE - TUTOR VERIFY SAFEGUARD] === */

    tutor.isVerified = !!isVerified;
    tutor.verificationStatus = isVerified ? 'verified' : 'rejected';
    if (!tutor.verificationDetails) tutor.verificationDetails = {};
    tutor.verificationDetails.verifiedAt = isVerified ? new Date() : null;

    if (tutor.verificationDocuments && tutor.verificationDocuments.length > 0) {
      tutor.verificationDocuments.forEach(doc => {
        doc.status = isVerified ? 'approved' : 'rejected';
        if (notes) doc.notes = notes;
      });
    }

    const updated = await tutor.save();

    // Clean memory: If verified, permanently remove any document reminder notices for this tutor
    if (isVerified) {
      await Notice.deleteMany({
        category: 'document_reminder',
        $or: [
          { recipientTutor: tutor._id },
          { recipientUser: tutor.user }
        ]
      });
    }

    res.json({
      success: true,
      message: isVerified ? 'Tutor credentials approved & verified' : 'Tutor credentials rejected',
      tutor: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update verification status.' });
  }
};

// @desc    Get platform overview stats for admin
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const totalTutors = await TutorProfile.countDocuments();
    const verifiedTutors = await TutorProfile.countDocuments({ isVerified: true });
    const pendingAudits = await TutorProfile.countDocuments({ isVerified: false });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInquiries = await Inquiry.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      stats: {
        totalTutors,
        verifiedTutors,
        pendingAudits,
        totalStudents,
        totalInquiries,
        totalReviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load dashboard statistics.' });
  }
};

// @desc    Trigger automated 24-hour document reminder scan manually
// @route   POST /api/admin/trigger-document-reminders
// @access  Private (Admin only)
export const triggerDocumentReminders = async (req, res) => {
  try {
    if (req.isDemo || req.user?.isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        message: 'Document reminder scan simulated in Demo Mode (no real emails sent or DB modified).',
        result: { remindersSent: 0, eligibleTutorsCount: 0 }
      });
    }

    const { forceSend } = req.body || {};
    const result = await checkAndSendDocumentReminders({ forceSend: !!forceSend });

    res.json({
      success: true,
      message: `24-Hour Document reminder scan completed. Dispatched ${result.remindersSent} notices.`,
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to execute reminder scan.' });
  }
};

// @desc    Get automated document reminder status and telemetry
// @route   GET /api/admin/document-reminder-status
// @access  Private (Admin only)
export const getDocumentReminderStatus = async (req, res) => {
  try {
    const telemetry = await getDocumentReminderStats();
    res.json({
      success: true,
      telemetry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load reminder status.' });
  }
};

// @desc    Get all registered students and parents for administrative management
// @route   GET /api/admin/students
// @access  Private (Admin only)
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load student directory.' });
  }
};

// @desc    Toggle block/unblock status for a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    /* === [START DEMO LOGIN FEATURE - USER BLOCK SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      const simulatedUser = user.toObject ? user.toObject() : { ...user };
      simulatedUser.isBlocked = !simulatedUser.isBlocked;
      simulatedUser.isDemo = true;
      return res.json({
        success: true,
        isDemo: true,
        message: simulatedUser.isBlocked 
          ? 'User suspension simulated in Demo Mode: changes are not saved in demo login.' 
          : 'User reactivation simulated in Demo Mode: changes are not saved in demo login.',
        user: simulatedUser
      });
    }
    /* === [END DEMO LOGIN FEATURE - USER BLOCK SAFEGUARD] === */
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      success: true,
      message: user.isBlocked ? 'User account suspended' : 'User account reactivated',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update user block state.' });
  }
};

// @desc    Permanently delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    /* === [START DEMO LOGIN FEATURE - USER DELETE SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        message: 'User deletion simulated in Demo Mode: changes are not saved in demo login.'
      });
    }
    /* === [END DEMO LOGIN FEATURE - USER DELETE SAFEGUARD] === */
    await user.deleteOne();
    res.json({
      success: true,
      message: 'User permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete user.' });
  }
};

// @desc    Manually clean notice memory / purge read, obsolete and expired notices
// @route   POST /api/admin/clean-notice-memory
// @access  Private (Admin only)
export const cleanNoticeMemoryAdmin = async (req, res) => {
  try {
    /* === [START DEMO LOGIN FEATURE - NOTICE CLEANUP SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        message: 'Notice memory cleanup simulated in Demo Mode: changes are not saved in demo login.',
        result: { totalCleaned: 0 }
      });
    }
    /* === [END DEMO LOGIN FEATURE - NOTICE CLEANUP SAFEGUARD] === */

    const result = await cleanNoticeMemory();
    res.json({
      success: true,
      message: `Notice memory successfully cleaned. Purged ${result.totalCleaned || 0} notices.`,
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clean notice memory.' });
  }
};



