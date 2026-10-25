import TutorProfile from '../models/TutorProfile.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Notice from '../models/Notice.js';
import imagekit, { isImageKitConfigured, deleteFromImageKit } from '../config/imagekit.js';

// @desc    Get all tutors with dynamic location, subject, class, board, fee filtering
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res) => {
  try {
    const { 
      search, 
      pincode,
      state, 
      city, 
      locality, 
      subject, 
      grade, 
      board, 
      mode, 
      maxHourlyRate, 
      qualification,
      sortBy 
    } = req.query;

    let query = {};

    // Free text search across name, bio, qualification, subjects, localities, pincodes
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { bio: regex },
        { qualification: regex },
        { subjects: regex },
        { 'location.city': regex },
        { 'location.localities': regex },
        { 'location.pincodes': regex },
        { 'location.pincode': regex }
      ];
    }

    if (pincode) {
      const pinRegex = new RegExp(pincode.trim(), 'i');
      const pinCondition = [
        { 'location.pincodes': pinRegex },
        { 'location.pincode': pinRegex },
        { pincode: pinRegex }
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: pinCondition }
        ];
        delete query.$or;
      } else {
        query.$or = pinCondition;
      }
    }

    if (state) query['location.state'] = state;
    if (city) query['location.city'] = new RegExp(`^${city}$`, 'i');
    if (locality) query['location.localities'] = new RegExp(locality, 'i');
    if (subject) query.subjects = subject;
    if (grade) query.classes = grade;
    if (board) query.boards = board;
    if (mode) query.modes = mode;
    if (qualification) query.qualification = new RegExp(qualification, 'i');
    if (maxHourlyRate) query['rates.hourly'] = { $lte: Number(maxHourlyRate) };

    // Sorting
    let sortOptions = {};
    if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'experience') sortOptions.experienceYears = -1;
    else if (sortBy === 'price_asc') sortOptions['rates.hourly'] = 1;
    else if (sortBy === 'price_desc') sortOptions['rates.hourly'] = -1;
    else sortOptions.createdAt = -1;

    const tutors = await TutorProfile.find(query).populate('user', 'name email phone avatar city state').sort(sortOptions);

    const formattedTutors = tutors.map(t => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        ...obj,
        email: obj.email || obj.user?.email,
        phone: obj.phone || obj.user?.phone
      };
    });

    res.json({
      success: true,
      count: formattedTutors.length,
      tutors: formattedTutors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve tutors at this time.' });
  }
};

// @desc    Get single tutor profile by ID with reviews
// @route   GET /api/tutors/:id
// @access  Public
export const getTutorById = async (req, res) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const reviews = await Review.find({ tutor: tutor._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      tutor: {
        ...tutor.toObject(),
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve tutor details.' });
  }
};

// @desc    Get tutor's own profile with real reviews, rating, and verification status
// @route   GET /api/tutors/my-profile
// @access  Private (Tutor only)
export const getMyProfile = async (req, res) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatar city state');
    if (!profile && req.user.email) {
      profile = await TutorProfile.findOne({ email: req.user.email }).populate('user', 'name email phone avatar city state');
    }
    if (!profile && req.user.tutorProfileId) {
      profile = await TutorProfile.findById(req.user.tutorProfileId).populate('user', 'name email phone avatar city state');
    }

    if (!profile) {
      // Auto-create tutor profile if user is a tutor and document does not exist yet
      profile = await TutorProfile.create({
        user: req.user._id,
        name: req.user.name || 'Educator',
        tagline: 'Qualified Home & Online Educator',
        qualification: 'Graduate / Educator',
        experienceYears: 2,
        location: {
          state: req.user.state || 'Delhi NCR',
          city: req.user.city || 'New Delhi',
          localities: [req.user.locality || 'Main'],
          pincodes: req.user.pincode ? [req.user.pincode] : [],
          pincode: req.user.pincode || ''
        },
        pincode: req.user.pincode || '',
        modes: ['home_visit', 'online'],
        subjects: ['Mathematics'],
        classes: ['Class 9 - 10 (Secondary)'],
        boards: ['CBSE'],
        rates: { monthly: 7000, hourly: 583 }
      });
      await User.findByIdAndUpdate(req.user._id, { tutorProfileId: profile._id });
      profile = await TutorProfile.findById(profile._id).populate('user', 'name email phone avatar city state');
    }

    // Fetch real reviews from MongoDB
    const reviews = await Review.find({ tutor: profile._id }).sort({ createdAt: -1 });
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

    if (profile.rating !== avgRating || profile.reviewCount !== reviewCount) {
      profile.rating = avgRating;
      profile.reviewCount = reviewCount;
      await profile.save();
    }

    res.json({
      success: true,
      tutor: {
        ...profile.toObject(),
        email: profile.email || req.user.email,
        phone: profile.phone || req.user.phone,
        reviews,
        rating: avgRating,
        reviewCount
      }
    });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve tutor profile.' });
  }
};

// @desc    Update tutor's own profile
// @route   PUT /api/tutors/profile
// @access  Private (Tutor only)
export const updateMyProfile = async (req, res) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile && req.user.email) {
      profile = await TutorProfile.findOne({ email: req.user.email });
    }
    if (!profile && req.user.tutorProfileId) {
      profile = await TutorProfile.findById(req.user.tutorProfileId);
    }
    if (!profile) {
      profile = await TutorProfile.create({
        user: req.user._id,
        name: req.user.name || 'Educator',
        tagline: 'Qualified Home & Online Educator',
        qualification: 'Graduate / Educator',
        experienceYears: 2,
        location: {
          state: req.user.state || 'Delhi NCR',
          city: req.user.city || 'New Delhi',
          localities: [req.user.locality || 'Main'],
          pincodes: []
        },
        modes: ['home_visit', 'online'],
        subjects: ['Mathematics'],
        classes: ['Class 9 - 10 (Secondary)'],
        boards: ['CBSE'],
        rates: { monthly: 7000, hourly: 583 }
      });
      await User.findByIdAndUpdate(req.user._id, { tutorProfileId: profile._id });
    }

    const allowedUpdates = [
      'name', 'tagline', 'avatar', 'qualification', 'experienceYears', 'location', 
      'modes', 'subjects', 'classes', 'boards', 'rates', 'bio', 'achievements'
    ];

    // If avatar is base64 data URI and ImageKit is configured, upload to ImageKit
    if (req.body.avatar && req.body.avatar.startsWith('data:')) {
      if (isImageKitConfigured()) {
        try {
          const uploadRes = await imagekit.files.upload({
            file: req.body.avatar,
            fileName: `avatar_${profile._id}_${Date.now()}.jpg`,
            folder: '/vidyanest/avatars'
          });
          if (uploadRes && uploadRes.url) {
            // Delete old avatar from ImageKit if tutor previously uploaded one
            const oldAvatarTarget = profile.avatarFileId || (profile.avatar && profile.avatar.includes('ik.imagekit.io') ? profile.avatar : null);
            if (oldAvatarTarget) {
              await deleteFromImageKit(oldAvatarTarget);
            }

            req.body.avatar = uploadRes.url;
            profile.avatarFileId = uploadRes.fileId;
            console.log(`✓ Uploaded tutor avatar to ImageKit: ${uploadRes.url} (fileId: ${uploadRes.fileId})`);
          }
        } catch (ikErr) {
          console.warn('ImageKit avatar upload note:', ikErr.message);
        }
      }
    } else if (req.body.avatar && req.body.avatar !== profile.avatar && profile.avatarFileId) {
      // If switched to an external/preset avatar, delete old custom ImageKit avatar
      await deleteFromImageKit(profile.avatarFileId);
      profile.avatarFileId = null;
    }

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'rates') {
          const monthly = Number(req.body.rates?.monthly) >= 0 ? Number(req.body.rates.monthly) : (profile.rates?.monthly || 0);
          const hourly = Number(req.body.rates?.hourly) >= 0 ? Number(req.body.rates.hourly) : (monthly ? Math.round(monthly / 12) : 0);
          profile.rates = { monthly, hourly };
        } else if (field === 'location') {
          let pincodesList = [];
          const inputPincodes = req.body.location?.pincodes !== undefined ? req.body.location.pincodes : req.body.pincodes;
          if (Array.isArray(inputPincodes)) {
            pincodesList = inputPincodes.map(p => String(p).trim()).filter(Boolean);
          } else if (typeof inputPincodes === 'string' && inputPincodes.trim()) {
            pincodesList = inputPincodes.split(',').map(p => p.trim()).filter(Boolean);
          } else if (req.body.location?.pincode || req.body.pincode) {
            const singlePin = String(req.body.location?.pincode || req.body.pincode).trim();
            if (singlePin) pincodesList = [singlePin];
          } else {
            pincodesList = profile.location?.pincodes || [];
          }

          const primaryPin = req.body.location?.pincode?.trim() || req.body.pincode?.trim() || pincodesList[0] || profile.location?.pincode || '';
          if (primaryPin && !pincodesList.includes(primaryPin)) {
            pincodesList.unshift(primaryPin);
          }

          profile.location = {
            state: req.body.location?.state?.trim() || profile.location?.state || 'Delhi NCR',
            city: req.body.location?.city?.trim() || profile.location?.city || 'New Delhi',
            localities: Array.isArray(req.body.location?.localities) ? req.body.location.localities : (profile.location?.localities || []),
            pincodes: pincodesList,
            pincode: primaryPin
          };
          profile.pincode = primaryPin;
        } else if (field === 'modes') {
          if (Array.isArray(req.body.modes)) {
            const validModes = ['home_visit', 'online', 'tutor_place'];
            const filtered = req.body.modes.filter(m => validModes.includes(m));
            profile.modes = filtered.length > 0 ? filtered : ['home_visit', 'online'];
          }
        } else if (field === 'subjects') {
          if (Array.isArray(req.body.subjects)) {
            profile.subjects = req.body.subjects;
          }
        } else if (field === 'classes') {
          if (Array.isArray(req.body.classes)) {
            profile.classes = req.body.classes;
          }
        } else if (field === 'boards') {
          if (Array.isArray(req.body.boards)) {
            profile.boards = req.body.boards;
          }
        } else if (field === 'experienceYears') {
          profile.experienceYears = Number(req.body.experienceYears) >= 0 ? Number(req.body.experienceYears) : (profile.experienceYears || 0);
        } else if (field === 'name') {
          if (req.body.name?.trim()) {
            profile.name = req.body.name.trim();
          }
        } else {
          profile[field] = req.body[field];
        }
      }
    });

    const updatedProfile = await profile.save();

    // Also sync User fields (avatar, name, location) in User model
    const userUpdates = { tutorProfileId: profile._id };
    if (profile.avatar) userUpdates.avatar = profile.avatar;
    if (profile.name) userUpdates.name = profile.name;
    if (profile.location?.state) userUpdates.state = profile.location.state;
    if (profile.location?.city) userUpdates.city = profile.location.city;
    if (profile.location?.localities?.[0]) userUpdates.locality = profile.location.localities[0];
    if (profile.location?.pincode || profile.location?.pincodes?.[0]) {
      userUpdates.pincode = profile.location.pincode || profile.location.pincodes[0];
    }

    await User.findByIdAndUpdate(req.user._id, userUpdates);

    res.json({
      success: true,
      tutor: updatedProfile,
      avatar: updatedProfile.avatar
    });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to update profile.' });
  }
};

// @desc    Upload documents for verification (ID, Degree, Address Proof) to ImageKit
// @route   POST /api/tutors/upload-documents
// @access  Private (Tutor only)
export const uploadVerificationDocuments = async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one document' });
    }

    if (!profile.verificationDocuments) profile.verificationDocuments = [];

    // Upload files to ImageKit concurrently
    const processedDocs = await Promise.all(
      documents.map(async (doc) => {
        let finalFileUrl = doc.fileUrl;
        let fileType = doc.fileType || 'image/jpeg';
        let newFileId = doc.fileId || null;

        // If fileUrl is a Base64 data URL and ImageKit is configured, upload to ImageKit
        if (doc.fileUrl && doc.fileUrl.startsWith('data:') && isImageKitConfigured()) {
          try {
            let ext = 'jpg';
            if (fileType.includes('pdf') || (doc.docName && doc.docName.toLowerCase().endsWith('.pdf'))) {
              ext = 'pdf';
            } else if (fileType.includes('png') || (doc.docName && doc.docName.toLowerCase().endsWith('.png'))) {
              ext = 'png';
            }
            const safeFileName = `tutor_${profile._id}_${doc.docType}_${Date.now()}.${ext}`;

            const uploadRes = await imagekit.files.upload({
              file: doc.fileUrl,
              fileName: safeFileName,
              folder: '/vidyanest/verification_docs'
            });

            if (uploadRes && uploadRes.url) {
              finalFileUrl = uploadRes.url;
              newFileId = uploadRes.fileId;
              if (uploadRes.fileType === 'non-image' || ext === 'pdf') {
                fileType = 'application/pdf';
              } else {
                fileType = `image/${ext}`;
              }
              console.log(`✓ Uploaded new ${doc.docName} to ImageKit: ${finalFileUrl}`);

              // If an old document of this docType exists, delete the old file from ImageKit
              const existingDoc = profile.verificationDocuments.find(d => d.docType === doc.docType);
              if (existingDoc) {
                const oldDocTarget = existingDoc.fileId || (existingDoc.fileUrl && existingDoc.fileUrl.includes('ik.imagekit.io') ? existingDoc.fileUrl : null);
                if (oldDocTarget) {
                  await deleteFromImageKit(oldDocTarget);
                }
              }
            }
          } catch (ikErr) {
            console.warn('ImageKit upload warning:', ikErr.message);
          }
        }

        return {
          id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          docType: doc.docType,
          docName: doc.docName || 'Document.pdf',
          fileUrl: finalFileUrl,
          fileId: newFileId,
          fileType,
          uploadedAt: new Date(),
          status: 'pending',
          notes: ''
        };
      })
    );

    // Merge or append to profile
    processedDocs.forEach(newDoc => {
      const idx = profile.verificationDocuments.findIndex(d => d.docType === newDoc.docType);
      if (idx !== -1) {
        profile.verificationDocuments[idx] = newDoc;
      } else {
        profile.verificationDocuments.push(newDoc);
      }
    });

    profile.verificationStatus = 'pending';
    profile.isVerified = false; // requires admin audit

    if (!profile.verificationDetails) profile.verificationDetails = {};
    const idDoc = processedDocs.find(d => d.docType === 'id_proof');
    const degDoc = processedDocs.find(d => d.docType === 'degree_certificate');
    const addrDoc = processedDocs.find(d => d.docType === 'address_proof');
    if (idDoc) profile.verificationDetails.idProof = `${idDoc.docName} (Pending Admin Review)`;
    if (degDoc) profile.verificationDetails.degreeProof = `${degDoc.docName} (Pending Admin Review)`;
    if (addrDoc) profile.verificationDetails.addressProof = `${addrDoc.docName} (Pending Admin Review)`;

    const updated = await profile.save();

    // Clean memory: purge any outstanding document reminder notices now that documents have been uploaded
    await Notice.deleteMany({
      category: 'document_reminder',
      $or: [
        { recipientTutor: profile._id },
        { recipientUser: req.user._id }
      ]
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Awaiting administrative audit.',
      tutor: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to upload verification documents.' });
  }
};

// @desc    Delete a specific verification document from ImageKit and tutor profile
// @route   DELETE /api/tutors/documents/:docType
// @access  Private (Tutor only)
export const deleteVerificationDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const docIndex = profile.verificationDocuments.findIndex(d => d.docType === docType);
    if (docIndex === -1) {
      return res.status(404).json({ message: `No document found for type: ${docType}` });
    }

    const docToDelete = profile.verificationDocuments[docIndex];
    const targetToDelete = docToDelete.fileId || (docToDelete.fileUrl && docToDelete.fileUrl.includes('ik.imagekit.io') ? docToDelete.fileUrl : null);
    if (targetToDelete) {
      await deleteFromImageKit(targetToDelete);
    }

    profile.verificationDocuments.splice(docIndex, 1);

    if (profile.verificationDetails) {
      if (docType === 'id_proof') profile.verificationDetails.idProof = 'Pending Upload';
      if (docType === 'degree_certificate') profile.verificationDetails.degreeProof = 'Pending Upload';
      if (docType === 'address_proof') profile.verificationDetails.addressProof = 'Pending Upload';
    }

    if (!profile.verificationDocuments || profile.verificationDocuments.length === 0) {
      profile.verificationStatus = 'unverified';
      profile.isVerified = false;
    }

    await profile.save();

    res.json({
      success: true,
      message: `Document deleted successfully.`,
      tutor: profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete verification document.' });
  }
};


// @desc    Get ImageKit client authentication parameters for direct frontend uploads
// @route   GET /api/tutors/imagekit-auth
// @access  Private
export const getImageKitAuth = async (req, res) => {
  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    res.json({
      success: true,
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to initialize media uploader.' });
  }
};

// @desc    Get all document reminder notices and compliance alerts for current tutor
// @route   GET /api/tutors/my-notices
// @access  Private (Tutor only)
export const getMyNotices = async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    
    // Find notices targeted to this tutor specifically or to all tutors
    const query = {
      $or: [
        { recipientUser: req.user._id },
        { recipientTutor: profile?._id },
        { targetRole: 'all' },
        { targetRole: 'tutor', recipientUser: null }
      ]
    };

    const notices = await Notice.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      notices,
      reminderCount: profile?.documentReminderCount || 0,
      lastReminderSentAt: profile?.lastDocumentReminderSentAt || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to retrieve notices.' });
  }
};

// @desc    Mark a specific notice as read / clean & delete from memory
// @route   PUT /api/tutors/my-notices/:id/read
// @access  Private (Tutor only)
export const markNoticeAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Clean memory: immediately delete notice from MongoDB so it does not persist in memory
    await Notice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notice read and purged from memory',
      deletedNoticeId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process notice.' });
  }
};

// @desc    Permanently delete notice from memory
// @route   DELETE /api/tutors/my-notices/:id
// @access  Private (Tutor only)
export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Notice permanently deleted from memory'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete notice.' });
  }
};


