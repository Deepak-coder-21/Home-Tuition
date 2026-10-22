import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  recipientTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    default: null
  },
  tutorName: {
    type: String,
    default: ''
  },
  tutorEmail: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    enum: ['all', 'tutor', 'student'],
    default: 'tutor'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['alert', 'warning', 'info', 'success'],
    default: 'warning'
  },
  category: {
    type: String,
    enum: ['document_reminder', 'system', 'announcement', 'audit'],
    default: 'document_reminder'
  },
  reminderNumber: {
    type: Number,
    default: 1
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: '/tutor/dashboard?tab=verification'
  },
  sender: {
    type: String,
    default: 'VidyaNest Credential Compliance Desk'
  }
}, {
  timestamps: true
});

// Automatic memory cleanup: purge notice documents after 7 days (604,800 seconds)
noticeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
