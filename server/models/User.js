import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  locality: {
    type: String,
    trim: true
  },
  houseLocation: {
    type: String,
    trim: true,
    default: ''
  },
  pincode: {
    type: String,
    trim: true,
    default: ''
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  // Student specific details
  studentName: {
    type: String,
    trim: true,
    default: ''
  },
  studentGrade: {
    type: String,
    trim: true,
    default: ''
  },
  board: {
    type: String,
    trim: true,
    default: ''
  },
  school: {
    type: String,
    trim: true,
    default: ''
  },
  subjectsNeeded: {
    type: String,
    trim: true,
    default: ''
  },
  preferredMode: {
    type: String,
    trim: true,
    default: 'home_visit'
  },
  learningGoals: {
    type: String,
    trim: true,
    default: ''
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  agreedToPolicy: {
    type: Boolean,
    default: false
  },
  agreedToPolicyAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
