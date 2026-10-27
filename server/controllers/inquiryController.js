import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';
import TutorProfile from '../models/TutorProfile.js';

// @desc    Send tuition inquiry to a tutor
// @route   POST /api/inquiries
// @access  Private (Authenticated Student/Parent)
export const createInquiry = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required. Please log in first to send an inquiry.' });
    }

    const {
      tutorId,
      tutorName,
      studentName,
      parentName,
      parentPhone,
      parentEmail,
      grade,
      board,
      subject,
      locality,
      houseLocation,
      address,
      landmark,
      city,
      state,
      pincode,
      fullAddress,
      mode,
      preferredDays,
      preferredTime,
      budgetPerMonth,
      studentNotes
    } = req.body;

    let tutor = null;
    if (tutorId && mongoose.Types.ObjectId.isValid(tutorId)) {
      tutor = await TutorProfile.findById(tutorId);
    }
    if (!tutor && tutorId && mongoose.Types.ObjectId.isValid(tutorId)) {
      tutor = await TutorProfile.findOne({ user: tutorId });
    }
    if (!tutor && tutorName) {
      tutor = await TutorProfile.findOne({
        name: { $regex: new RegExp(`^${tutorName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    if (!tutor && tutorId) {
      tutor = await TutorProfile.findOne({ id: tutorId });
    }

    if (!tutor) {
      return res.status(404).json({ message: `Tutor not found: ${tutorName || tutorId}` });
    }

    const calculatedFullAddress = fullAddress || [
      houseLocation || address,
      landmark ? `Landmark: ${landmark}` : null,
      locality,
      city,
      state,
      pincode
    ].filter(Boolean).join(', ') || locality;

    /* === [START DEMO LOGIN FEATURE - INQUIRY CREATION SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      const simulatedInquiry = {
        _id: new mongoose.Types.ObjectId().toString(),
        tutor: tutor._id,
        tutorName: tutor.name,
        studentUser: req.user._id,
        studentName: studentName || req.user.studentName || req.user.name,
        parentName: parentName || req.user.name,
        parentPhone: parentPhone || req.user.phone || '+91 98000 00001',
        parentEmail: parentEmail || req.user.email || 'student.demo@vidyanest.com',
        grade: grade || req.user.studentGrade || 'Class 9 - 10 (Secondary)',
        board: board || req.user.board || 'CBSE',
        subject: subject || 'General',
        locality: locality || req.user.locality || 'Local',
        houseLocation: houseLocation || address || req.user.houseLocation || '',
        landmark: landmark || '',
        city: city || req.user.city || 'New Delhi',
        state: state || req.user.state || 'Delhi NCR',
        pincode: pincode || req.user.pincode || '',
        fullAddress: calculatedFullAddress,
        mode: mode || 'home_visit',
        preferredDays: preferredDays || '3 days / week',
        preferredTime: preferredTime || '5:00 PM - 6:30 PM',
        budgetPerMonth: Number(budgetPerMonth) || tutor.rates?.monthly || 8000,
        studentNotes: studentNotes || '',
        status: 'pending',
        createdAt: new Date(),
        isDemo: true
      };
      return res.status(201).json({
        success: true,
        isDemo: true,
        message: 'Inquiry simulated in Demo Mode: changes are not saved in demo login.',
        inquiry: simulatedInquiry
      });
    }
    /* === [END DEMO LOGIN FEATURE - INQUIRY CREATION SAFEGUARD] === */

    const inquiry = await Inquiry.create({
      tutor: tutor._id,
      tutorName: tutor.name,
      studentUser: req.user._id,
      studentName: studentName || req.user.studentName || req.user.name,
      parentName: parentName || req.user.name,
      parentPhone: parentPhone || req.user.phone || '',
      parentEmail: parentEmail || req.user.email || '',
      grade: grade || req.user.studentGrade || 'Class 9 - 10 (Secondary)',
      board: board || req.user.board || 'CBSE',
      subject: subject || 'General',
      locality: locality || req.user.locality || 'Local',
      houseLocation: houseLocation || address || req.user.houseLocation || '',
      landmark: landmark || '',
      city: city || req.user.city || 'New Delhi',
      state: state || req.user.state || 'Delhi NCR',
      pincode: pincode || req.user.pincode || '',
      fullAddress: calculatedFullAddress,
      mode: mode || 'home_visit',
      preferredDays: preferredDays || '3 days / week',
      preferredTime: preferredTime || '5:00 PM - 6:30 PM',
      budgetPerMonth: Number(budgetPerMonth) || tutor.rates?.monthly || 8000,
      studentNotes: studentNotes || '',
      status: 'pending'
    });

    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('tutor', 'name avatar rating headline phone email location rates');

    res.status(201).json({
      success: true,
      inquiry: populatedInquiry || inquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to submit inquiry. Please try again later.' });
  }
};

// @desc    Get user inquiries (Student's sent requests OR Tutor's inbox OR Admin platform list)
// @route   GET /api/inquiries/my
// @access  Private
export const getMyInquiries = async (req, res) => {
  try {
    let inquiries;

    if (req.user.role === 'admin') {
      // Platform administrator has full oversight of all genuine inquiries
      inquiries = await Inquiry.find()
        .populate('tutor', 'name avatar rating headline phone email location rates')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'tutor') {
      const tutorProfile = await TutorProfile.findOne({ user: req.user._id });
      const orQueries = [];
      if (tutorProfile) {
        orQueries.push({ tutor: tutorProfile._id });
      }
      if (req.user.name) {
        orQueries.push({
          tutorName: { $regex: new RegExp(`^${req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }

      inquiries = await Inquiry.find(orQueries.length > 0 ? { $or: orQueries } : { tutorName: req.user.name })
        .populate('tutor', 'name avatar rating headline phone email location rates')
        .sort({ createdAt: -1 });
    } else {
      // Authenticated Student / Parent - strictly retrieve real user inquiries
      const emailFilter = req.user.email 
        ? { parentEmail: { $regex: new RegExp(`^${req.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        : null;

      const orConditions = [{ studentUser: req.user._id }];
      if (emailFilter) {
        orConditions.push(emailFilter);
      }

      inquiries = await Inquiry.find({ $or: orConditions })
        .populate('tutor', 'name avatar rating headline phone email location rates')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: inquiries.length,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve inquiries.' });
  }
};

// @desc    Accept or reject tuition inquiry
// @route   PUT /api/inquiries/:id/status
// @access  Private (Tutor or Admin)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, responseNote } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'accepted' or 'rejected'" });
    }

    let inquiry = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      inquiry = await Inquiry.findById(req.params.id);
    }
    if (!inquiry) {
      inquiry = await Inquiry.findOne({ id: req.params.id });
    }

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found in database' });
    }

    // Verify ownership: Admin can always update. Tutor must own this inquiry.
    if (req.user.role !== 'admin') {
      const tutorProfile = await TutorProfile.findOne({ user: req.user._id });
      const isOwnerProfile = tutorProfile && inquiry.tutor && (inquiry.tutor.toString() === tutorProfile._id.toString());
      const isOwnerName = inquiry.tutorName && req.user.name && (inquiry.tutorName.trim().toLowerCase() === req.user.name.trim().toLowerCase());

      if (!isOwnerProfile && !isOwnerName) {
        return res.status(403).json({ message: 'Not authorized to update this inquiry' });
      }
    }

    /* === [START DEMO LOGIN FEATURE - INQUIRY STATUS SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        message: 'Inquiry status update simulated in Demo Mode: changes are not saved in demo login.',
        inquiry: {
          ...(inquiry.toObject ? inquiry.toObject() : inquiry),
          status,
          responseNote,
          acceptedAt: status === 'accepted' ? new Date() : null,
          isDemo: true
        }
      });
    }
    /* === [END DEMO LOGIN FEATURE - INQUIRY STATUS SAFEGUARD] === */

    inquiry.status = status;
    if (responseNote !== undefined) inquiry.responseNote = responseNote;
    if (status === 'accepted') {
      inquiry.acceptedAt = new Date();
    } else {
      inquiry.acceptedAt = null;
    }

    const updatedInquiry = await inquiry.save();

    const populatedInquiry = await Inquiry.findById(updatedInquiry._id)
      .populate('tutor', 'name avatar rating headline phone email location rates');

    res.json({
      success: true,
      inquiry: populatedInquiry || updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update inquiry status.' });
  }
};
