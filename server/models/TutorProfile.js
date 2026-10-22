import mongoose from 'mongoose';

const tutorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    default: 'Qualified Home & Online Educator'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  avatarFileId: {
    type: String,
    default: null
  },
  qualification: {
    type: String,
    required: true
  },
  experienceYears: {
    type: Number,
    required: true,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  verificationDetails: {
    idProof: { type: String, default: 'Pending Upload' },
    degreeProof: { type: String, default: 'Pending Upload' },
    addressProof: { type: String, default: 'Pending Upload' },
    verifiedAt: { type: Date, default: null }
  },
  verificationDocuments: [{
    id: { type: String },
    docType: { type: String, required: true }, // 'id_proof' | 'degree_certificate' | 'address_proof' | 'experience_cert'
    docName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileId: { type: String, default: null }, // ImageKit asset fileId for deletion
    fileType: { type: String, default: 'image/jpeg' },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String, default: '' }
  }],
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    localities: [{ type: String }],
    pincodes: [{ type: String }]
  },
  modes: [{
    type: String,
    enum: ['home_visit', 'online', 'tutor_place']
  }],
  subjects: [{ type: String }],
  classes: [{ type: String }],
  boards: [{ type: String }],
  rates: {
    hourly: { type: Number, required: true },
    monthly: { type: Number, required: true }
  },
  bio: {
    type: String,
    default: ''
  },
  achievements: [{ type: String }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    default: null
  },
  documentReminderCount: {
    type: Number,
    default: 0
  },
  lastDocumentReminderSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const TutorProfile = mongoose.model('TutorProfile', tutorProfileSchema);
export default TutorProfile;
