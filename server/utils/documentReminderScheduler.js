import TutorProfile from '../models/TutorProfile.js';
import User from '../models/User.js';
import Notice from '../models/Notice.js';

let lastRunTime = null;
let schedulerIntervalId = null;

/**
 * Check all tutors and send 24-hour automated document upload reminder notices
 * @param {Object} options
 * @param {boolean} options.forceSend - If true, bypasses the 24-hour time gate (useful for manual admin test triggers)
 */
export const checkAndSendDocumentReminders = async ({ forceSend = false } = {}) => {
  const result = {
    timestamp: new Date().toISOString(),
    checkedCount: 0,
    eligibleCount: 0,
    remindersSent: 0,
    details: []
  };

  try {
    lastRunTime = new Date();

    // Find all unverified tutors
    const tutors = await TutorProfile.find({ isVerified: false }).populate('user', 'email name phone');
    result.checkedCount = tutors.length;

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    for (const tutor of tutors) {
      // Check if tutor has not uploaded required documents
      const hasUploadedDocs = Array.isArray(tutor.verificationDocuments) && 
        tutor.verificationDocuments.length > 0 &&
        tutor.verificationDocuments.some(d => d.fileUrl && !d.fileUrl.includes('Pending'));

      // If tutor already uploaded valid documents, skip them
      if (hasUploadedDocs) continue;

      result.eligibleCount++;

      const createdAtMs = new Date(tutor.createdAt || now).getTime();
      const lastSentMs = tutor.lastDocumentReminderSentAt ? new Date(tutor.lastDocumentReminderSentAt).getTime() : null;
      const reminderCount = tutor.documentReminderCount || 0;

      let isDue = false;
      let reason = '';

      if (forceSend) {
        isDue = true;
        reason = 'Admin forced manual reminder dispatch';
      } else if (reminderCount === 0) {
        // Case 1: First reminder after 24 hours of account creation
        const msSinceRegistration = now - createdAtMs;
        if (msSinceRegistration >= TWENTY_FOUR_HOURS_MS) {
          isDue = true;
          reason = `Account registered ${(msSinceRegistration / (1000 * 60 * 60)).toFixed(1)} hours ago with no documents uploaded.`;
        }
      } else {
        // Case 2: Repeat reminder every 24 hours after the last reminder
        const msSinceLastReminder = now - (lastSentMs || createdAtMs);
        if (msSinceLastReminder >= TWENTY_FOUR_HOURS_MS) {
          isDue = true;
          reason = `Last notice was sent ${(msSinceLastReminder / (1000 * 60 * 60)).toFixed(1)} hours ago. 24-hour repeat cycle triggered.`;
        }
      }

      if (isDue) {
        const nextReminderNumber = reminderCount + 1;
        const title = nextReminderNumber === 1
          ? 'Action Required: Submit Verification Documents (First 24-Hour Notice)'
          : `Important: Submit Verification Documents (24-Hour Follow-up #${nextReminderNumber})`;

        const message = nextReminderNumber === 1
          ? `Hello ${tutor.name}, welcome to VidyaNest! It has been over 24 hours since your educator profile was created, but your mandatory verification documents (Government Photo ID, Degree Proof, and Address Proof) have not been submitted yet. Please upload them in your dashboard to undergo administrative audit and unlock student inquiries.`
          : `Hello ${tutor.name}, this is an automated 24-hour follow-up notice regarding your pending verification documents. Your profile remains unverified and concealed from parent search listings until your credentials are submitted and audited by the compliance team. Please upload your documents now.`;

        // Clean memory: delete any previous reminder notice for this tutor before sending the next one
        await Notice.deleteMany({
          category: 'document_reminder',
          $or: [
            { recipientTutor: tutor._id },
            { recipientUser: tutor.user?._id || tutor.user }
          ]
        });

        // 1. Create persistent Notice in database
        const notice = await Notice.create({
          recipientUser: tutor.user?._id || tutor.user || null,
          recipientTutor: tutor._id,
          tutorName: tutor.name,
          tutorEmail: tutor.user?.email || tutor.email || '',
          targetRole: 'tutor',
          title,
          message,
          type: nextReminderNumber === 1 ? 'warning' : 'alert',
          category: 'document_reminder',
          reminderNumber: nextReminderNumber,
          actionUrl: '/tutor/dashboard?tab=verification',
          sender: 'VidyaNest Educator Verification Desk'
        });

        // 2. Update TutorProfile record with tracking info
        tutor.documentReminderCount = nextReminderNumber;
        tutor.lastDocumentReminderSentAt = new Date();
        await tutor.save();

        result.remindersSent++;
        result.details.push({
          tutorId: tutor._id,
          tutorName: tutor.name,
          reminderNumber: nextReminderNumber,
          noticeId: notice._id,
          reason
        });

        console.log(`[Document Reminder] Sent Notice #${nextReminderNumber} to ${tutor.name} (${tutor._id})`);
      }
    }

    return result;
  } catch (error) {
    console.error('[Document Reminder Error]:', error);
    throw error;
  }
};

/**
 * Clean memory & purge read, expired, or obsolete notices
 */
export const cleanNoticeMemory = async () => {
  try {
    // 1. Delete all notices marked as read
    const readResult = await Notice.deleteMany({ isRead: true });

    // 2. Delete document reminder notices for tutors who already uploaded documents or are verified
    const tutorsWithDocsOrVerified = await TutorProfile.find({
      $or: [
        { isVerified: true },
        { verificationStatus: 'verified' },
        { 'verificationDocuments.0': { $exists: true } }
      ]
    }).select('_id user');

    const tutorIds = tutorsWithDocsOrVerified.map(t => t._id);
    const userIds = tutorsWithDocsOrVerified.map(t => t.user).filter(Boolean);

    const obsoleteResult = await Notice.deleteMany({
      category: 'document_reminder',
      $or: [
        { recipientTutor: { $in: tutorIds } },
        { recipientUser: { $in: userIds } }
      ]
    });

    const totalCleaned = (readResult.deletedCount || 0) + (obsoleteResult.deletedCount || 0);
    if (totalCleaned > 0) {
      console.log(`[Memory Cleanup] Purged ${totalCleaned} notice records from memory/database.`);
    }
    return {
      success: true,
      readCleaned: readResult.deletedCount || 0,
      obsoleteCleaned: obsoleteResult.deletedCount || 0,
      totalCleaned
    };
  } catch (err) {
    console.warn('[Memory Cleanup Warning]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Start the recurring background scheduler (runs check hourly to catch 24h marks)
 * @param {number} checkIntervalMinutes 
 */
export const startDocumentReminderScheduler = (checkIntervalMinutes = 60) => {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
  }

  console.log(`✓ Automated 24h Document Reminder Engine initialized (checking every ${checkIntervalMinutes} min)`);

  // Run initial check and memory cleanup 10 seconds after server launch so DB connection is established
  setTimeout(async () => {
    try {
      console.log('[Document Reminder] Running initial startup check for pending documents...');
      await cleanNoticeMemory();
      const summary = await checkAndSendDocumentReminders();
      console.log(`[Document Reminder] Startup scan complete: ${summary.remindersSent} notices dispatched.`);
    } catch (err) {
      console.warn('[Document Reminder] Startup scan warning:', err.message);
    }
  }, 10000);

  // Set recurring interval
  schedulerIntervalId = setInterval(async () => {
    try {
      console.log('[Document Reminder] Running recurring 24h reminder scan & memory cleanup...');
      await cleanNoticeMemory();
      const summary = await checkAndSendDocumentReminders();
      if (summary.remindersSent > 0) {
        console.log(`[Document Reminder] Dispatched ${summary.remindersSent} notices to tutors missing documents.`);
      }
    } catch (err) {
      console.error('[Document Reminder Scheduler Error]:', err.message);
    }
  }, checkIntervalMinutes * 60 * 1000);

  return schedulerIntervalId;
};

/**
 * Get current scheduler health and reminder statistics for Admin Portal telemetry
 */
export const getDocumentReminderStats = async () => {
  const totalUnverifiedWithoutDocs = await TutorProfile.countDocuments({
    isVerified: false,
    $or: [
      { verificationDocuments: { $size: 0 } },
      { verificationDocuments: { $exists: false } }
    ]
  });

  const totalRemindersDispatched = await Notice.countDocuments({ category: 'document_reminder' });
  const recentNotices = await Notice.find({ category: 'document_reminder' })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    schedulerActive: schedulerIntervalId !== null,
    checkIntervalMinutes: 60,
    lastRunTime: lastRunTime || new Date(),
    nextRunEstimate: new Date(Date.now() + 60 * 60 * 1000),
    totalUnverifiedWithoutDocs,
    totalRemindersDispatched,
    recentNotices
  };
};
