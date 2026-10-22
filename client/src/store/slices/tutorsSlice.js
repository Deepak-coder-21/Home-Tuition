import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch all tutors from the MongoDB database API
export const fetchTutors = createAsyncThunk(
  'tutors/fetchTutors',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/tutors');
      if (!res.ok) throw new Error('Failed to fetch tutors from database');
      const data = await res.json();
      return (data.tutors || []).map(t => ({
        ...t,
        id: t._id || t.id,
        reviews: t.reviews || []
      }));
    } catch {
      return rejectWithValue('Unable to load tutors. Please try again.');
    }
  }
);

const initialState = {
  tutors: [],
  selectedTutor: null,
  loading: false,
  error: null
};

export const tutorsSlice = createSlice({
  name: 'tutors',
  initialState,
  reducers: {
    setSelectedTutor: (state, action) => {
      state.selectedTutor = state.tutors.find(t => t.id === action.payload || t._id === action.payload) || null;
    },
    updateTutorProfile: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.tutors.findIndex(t => 
        (id && (t.id === id || t._id === id)) ||
        (updates?.email && t.email?.toLowerCase() === updates.email.toLowerCase()) ||
        (updates?.user && (t.user === updates.user || t.user?._id === updates.user))
      );
      if (index !== -1) {
        state.tutors[index] = { ...state.tutors[index], ...updates };
        if (state.selectedTutor && (state.selectedTutor.id === state.tutors[index].id || state.selectedTutor._id === state.tutors[index]._id)) {
          state.selectedTutor = state.tutors[index];
        }
      }
    },
    verifyTutor: (state, action) => {
      const { tutorId, isVerified, notes } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor) {
        tutor.isVerified = isVerified;
        tutor.verificationStatus = isVerified ? 'verified' : 'rejected';
        if (!tutor.verificationDetails) tutor.verificationDetails = {};
        tutor.verificationDetails.verifiedAt = isVerified ? new Date().toISOString().split('T')[0] : null;
        if (tutor.verificationDocuments && tutor.verificationDocuments.length > 0) {
          tutor.verificationDocuments.forEach(doc => {
            doc.status = isVerified ? 'approved' : 'rejected';
            if (notes) doc.notes = notes;
          });
        }
      }
      if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
        state.selectedTutor.isVerified = isVerified;
        state.selectedTutor.verificationStatus = isVerified ? 'verified' : 'rejected';
      }
    },
    uploadTutorDocuments: (state, action) => {
      const { tutorId, documents } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor) {
        if (!tutor.verificationDocuments) tutor.verificationDocuments = [];
        documents.forEach(doc => {
          const idx = tutor.verificationDocuments.findIndex(d => d.docType === doc.docType);
          const newDoc = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            docType: doc.docType,
            docName: doc.docName || 'Document.pdf',
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || 'image/jpeg',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: ''
          };
          if (idx !== -1) {
            tutor.verificationDocuments[idx] = newDoc;
          } else {
            tutor.verificationDocuments.push(newDoc);
          }
        });
        tutor.verificationStatus = 'pending';
        tutor.isVerified = false;
        if (!tutor.verificationDetails) tutor.verificationDetails = {};
        const idDoc = documents.find(d => d.docType === 'id_proof');
        const degDoc = documents.find(d => d.docType === 'degree_certificate');
        const addrDoc = documents.find(d => d.docType === 'address_proof');
        if (idDoc) tutor.verificationDetails.idProof = `${idDoc.docName} (Under Review)`;
        if (degDoc) tutor.verificationDetails.degreeProof = `${degDoc.docName} (Under Review)`;
        if (addrDoc) tutor.verificationDetails.addressProof = `${addrDoc.docName} (Under Review)`;
      }
      if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
        state.selectedTutor = { ...state.selectedTutor, ...tutor };
      }
    },
    removeTutorDocument: (state, action) => {
      const { tutorId, docType } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor) {
        if (tutor.verificationDocuments) {
          tutor.verificationDocuments = tutor.verificationDocuments.filter(d => d.docType !== docType);
        }
        if (tutor.verificationDetails) {
          if (docType === 'id_proof') tutor.verificationDetails.idProof = 'Pending Upload';
          if (docType === 'degree_certificate') tutor.verificationDetails.degreeProof = 'Pending Upload';
          if (docType === 'address_proof') tutor.verificationDetails.addressProof = 'Pending Upload';
        }
      }
      if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
        state.selectedTutor = { ...state.selectedTutor, ...tutor };
      }
    },
    addTutorReview: (state, action) => {
      const { tutorId, review } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor) {
        if (!tutor.reviews) tutor.reviews = [];
        const newReview = {
          id: `rev-${Date.now()}`,
          date: 'Just now',
          ...review
        };
        tutor.reviews.unshift(newReview);
        tutor.reviewCount = (tutor.reviewCount || 0) + 1;
        const totalRating = tutor.reviews.reduce((acc, r) => acc + r.rating, 0);
        tutor.rating = Number((totalRating / tutor.reviews.length).toFixed(1));
      }
    },
    deleteReview: (state, action) => {
      const { tutorId, reviewId } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor && tutor.reviews) {
        tutor.reviews = tutor.reviews.filter(r => r.id !== reviewId && r._id !== reviewId);
        tutor.reviewCount = tutor.reviews.length;
        if (tutor.reviews.length > 0) {
          const totalRating = tutor.reviews.reduce((acc, r) => acc + r.rating, 0);
          tutor.rating = Number((totalRating / tutor.reviews.length).toFixed(1));
        }
      }
    },
    addNewTutor: (state, action) => {
      const tutor = {
        ...action.payload,
        id: action.payload._id || action.payload.id
      };
      state.tutors.unshift(tutor);
    },
    toggleBlockTutor: (state, action) => {
      const { tutorId, isBlocked, reason } = action.payload;
      const tutor = state.tutors.find(t => t.id === tutorId || t._id === tutorId);
      if (tutor) {
        tutor.isBlocked = isBlocked;
        tutor.blockedReason = isBlocked ? (reason || 'Account suspended by administrator') : null;
      }
      if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
        state.selectedTutor.isBlocked = isBlocked;
        state.selectedTutor.blockedReason = isBlocked ? (reason || 'Account suspended by administrator') : null;
      }
    },
    deleteTutor: (state, action) => {
      const tutorId = action.payload;
      state.tutors = state.tutors.filter(t => t.id !== tutorId && t._id !== tutorId);
      if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
        state.selectedTutor = null;
      }
    },
    updateTutorByAdmin: (state, action) => {
      const { tutorId, updates } = action.payload;
      const index = state.tutors.findIndex(t => t.id === tutorId || t._id === tutorId);
      if (index !== -1) {
        state.tutors[index] = { ...state.tutors[index], ...updates };
        if (state.selectedTutor && (state.selectedTutor.id === tutorId || state.selectedTutor._id === tutorId)) {
          state.selectedTutor = state.tutors[index];
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutors.fulfilled, (state, action) => {
        state.loading = false;
        state.tutors = action.payload || [];
      })
      .addCase(fetchTutors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedTutor, 
  updateTutorProfile, 
  verifyTutor, 
  uploadTutorDocuments,
  removeTutorDocument,
  addTutorReview, 
  deleteReview, 
  addNewTutor,
  toggleBlockTutor,
  deleteTutor,
  updateTutorByAdmin
} = tutorsSlice.actions;

export default tutorsSlice.reducer;
