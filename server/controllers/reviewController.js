import mongoose from 'mongoose';
import Review from '../models/Review.js';
import TutorProfile from '../models/TutorProfile.js';
import Inquiry from '../models/Inquiry.js';

// @desc    Check if authenticated student is eligible to review a tutor (1 month after accepted inquiry)
// @route   GET /api/reviews/eligibility/:tutorId
// @access  Private (Authenticated Student)
export const checkReviewEligibility = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ eligible: false, message: 'Please log in to check review eligibility.' });
    }

    const { tutorId } = req.params;
    let tutor = null;
    if (mongoose.Types.ObjectId.isValid(tutorId)) {
      tutor = await TutorProfile.findById(tutorId);
    }
    if (!tutor) {
      tutor = await TutorProfile.findOne({ id: tutorId });
    }
    if (!tutor) {
      return res.status(404).json({ eligible: false, message: 'Tutor not found' });
    }

    const studentQueries = [{ studentUser: req.user._id }];
    if (req.user.email) {
      studentQueries.push({
        parentEmail: { $regex: new RegExp(`^${req.user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }

    const acceptedInquiries = await Inquiry.find({
      tutor: tutor._id,
      status: 'accepted',
      $or: studentQueries
    }).sort({ acceptedAt: 1, createdAt: 1 });

    if (!acceptedInquiries || acceptedInquiries.length === 0) {
      return res.json({
        eligible: false,
        reason: 'no_accepted_inquiry',
        message: 'You can only review a tutor after they have accepted your tuition inquiry and at least 1 month has passed.'
      });
    }

    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    const eligibleInquiry = acceptedInquiries.find(inq => {
      const accDate = inq.acceptedAt || inq.updatedAt || inq.createdAt;
      return (now - new Date(accDate).getTime()) >= ONE_MONTH_MS;
    });

    if (!eligibleInquiry) {
      const earliestInq = acceptedInquiries[0];
      const accDate = earliestInq.acceptedAt || earliestInq.updatedAt || earliestInq.createdAt;
      const accTime = new Date(accDate).getTime();
      const timeElapsed = now - accTime;
      const remainingDays = Math.max(1, Math.ceil((ONE_MONTH_MS - timeElapsed) / (24 * 60 * 60 * 1000)));
      const unlockDate = new Date(accTime + ONE_MONTH_MS).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return res.json({
        eligible: false,
        reason: 'time_remaining',
        daysRemaining: remainingDays,
        unlockDate,
        message: `Ratings unlock after 1 month of accepted tuition. You can review this teacher on ${unlockDate} (${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining).`
      });
    }

    // Check if student already gave a review
    const existingReview = await Review.findOne({
      tutor: tutor._id,
      $or: [
        { studentUser: req.user._id },
        { inquiry: eligibleInquiry._id }
      ]
    });

    return res.json({
      eligible: true,
      hasReviewed: !!existingReview,
      existingReview,
      message: existingReview ? 'You have already reviewed this tutor (you can update your feedback).' : 'You are eligible to review this tutor.'
    });
  } catch (error) {
    res.status(500).json({ eligible: false, message: 'Unable to check review eligibility.' });
  }
};

// @desc    Add or update review for a tutor (Enforces 1 month of accepted inquiry)
// @route   POST /api/reviews
// @access  Private (Authenticated Student)
export const addReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required. Please log in as a student to submit a rating.' });
    }

    const { tutorId, studentName, parentName, rating, subject, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5 stars.' });
    }

    let tutor = null;
    if (mongoose.Types.ObjectId.isValid(tutorId)) {
      tutor = await TutorProfile.findById(tutorId);
    }
    if (!tutor) {
      tutor = await TutorProfile.findOne({ id: tutorId });
    }
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Rule: Students can give teacher rating only after 1 month of accepted inquiry
    const studentQueries = [{ studentUser: req.user._id }];
    if (req.user.email) {
      studentQueries.push({
        parentEmail: { $regex: new RegExp(`^${req.user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }

    const acceptedInquiries = await Inquiry.find({
      tutor: tutor._id,
      status: 'accepted',
      $or: studentQueries
    }).sort({ acceptedAt: 1, createdAt: 1 });

    if (!acceptedInquiries || acceptedInquiries.length === 0) {
      return res.status(403).json({
        message: 'Reviews are only allowed for students with an accepted inquiry with this educator.'
      });
    }

    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    const eligibleInquiry = acceptedInquiries.find(inq => {
      const accDate = inq.acceptedAt || inq.updatedAt || inq.createdAt;
      return (now - new Date(accDate).getTime()) >= ONE_MONTH_MS;
    });

    if (!eligibleInquiry) {
      const earliestInq = acceptedInquiries[0];
      const accDate = earliestInq.acceptedAt || earliestInq.updatedAt || earliestInq.createdAt;
      const accTime = new Date(accDate).getTime();
      const timeElapsed = now - accTime;
      const remainingDays = Math.max(1, Math.ceil((ONE_MONTH_MS - timeElapsed) / (24 * 60 * 60 * 1000)));
      const unlockDate = new Date(accTime + ONE_MONTH_MS).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return res.status(403).json({
        message: `Ratings unlock after 1 month of accepted tuition. You can review this teacher on ${unlockDate} (${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining).`,
        daysRemaining: remainingDays,
        unlockDate
      });
    }

    // Create or update review
    let review = await Review.findOne({
      tutor: tutor._id,
      $or: [
        { studentUser: req.user._id },
        { inquiry: eligibleInquiry._id }
      ]
    });

    if (review) {
      review.rating = Number(rating);
      if (subject) review.subject = subject;
      if (comment) review.comment = comment.trim();
      review.studentName = studentName || req.user.studentName || req.user.name;
      review.parentName = parentName || req.user.name;
      await review.save();
    } else {
      review = await Review.create({
        tutor: tutor._id,
        studentUser: req.user._id,
        inquiry: acceptedInquiry._id,
        studentName: studentName || req.user.studentName || req.user.name,
        parentName: parentName || req.user.name,
        rating: Number(rating),
        subject: subject || acceptedInquiry.subject || 'General Tuition',
        comment: comment ? comment.trim() : ''
      });
    }

    // Recalculate tutor's real average rating and review count from MongoDB
    const allReviews = await Review.find({ tutor: tutor._id });
    const count = allReviews.length;
    const avgRating = count > 0 
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

    tutor.rating = avgRating;
    tutor.reviewCount = count;
    await tutor.save();

    res.status(201).json({
      success: true,
      message: 'Review successfully recorded!',
      review,
      tutorRating: tutor.rating,
      reviewCount: tutor.reviewCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit review. Please try again later.' });
  }
};

// @desc    Delete/Moderate a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const tutorId = review.tutor;
    await review.deleteOne();

    // Recalculate tutor rating
    const remainingReviews = await Review.find({ tutor: tutorId });
    const tutor = await TutorProfile.findById(tutorId);
    if (tutor) {
      tutor.reviewCount = remainingReviews.length;
      if (remainingReviews.length > 0) {
        const avg = (remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length).toFixed(1);
        tutor.rating = Number(avg);
      } else {
        tutor.rating = 0;
      }
      await tutor.save();
    }

    res.json({ success: true, message: 'Review successfully removed' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove review. Please try again later.' });
  }
};
