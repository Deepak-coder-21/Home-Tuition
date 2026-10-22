import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true
  },
  tutorName: {
    type: String,
    required: true
  },
  studentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  studentName: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  board: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  locality: {
    type: String,
    required: true
  },
  houseLocation: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  landmark: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'New Delhi'
  },
  state: {
    type: String,
    default: 'Delhi NCR'
  },
  pincode: {
    type: String,
    default: ''
  },
  fullAddress: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'home_visit'
  },
  preferredDays: {
    type: String,
    default: '3 days / week'
  },
  preferredTime: {
    type: String,
    default: 'Evening'
  },
  budgetPerMonth: {
    type: Number,
    required: true
  },
  studentNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  responseNote: {
    type: String,
    default: ''
  },
  acceptedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
