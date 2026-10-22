import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch inquiries for the authenticated student, tutor, or admin from the database
export const fetchMyInquiries = createAsyncThunk(
  'inquiries/fetchMyInquiries',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (!token) return [];
      const res = await fetch('/api/inquiries/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const data = await res.json();
      return (data.inquiries || []).map(i => ({
        ...i,
        id: i._id || i.id,
        tutorId: i.tutor?._id || (typeof i.tutor === 'string' ? i.tutor : null) || i.tutorId
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Real asynchronous backend call to update inquiry status (Accept or Reject) in MongoDB
export const respondToInquiry = createAsyncThunk(
  'inquiries/respondToInquiry',
  async ({ inquiryId, status, responseNote }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (!token) throw new Error('Authentication required. Please log in first.');
      const res = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, responseNote })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update inquiry status on server');
      }
      return {
        ...data.inquiry,
        id: data.inquiry._id || data.inquiry.id,
        tutorId: data.inquiry.tutor?._id || data.inquiry.tutor || data.inquiry.tutorId
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Send real tuition inquiry to MongoDB backend
export const sendInquiryAsync = createAsyncThunk(
  'inquiries/sendInquiryAsync',
  async (inquiryPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      if (!token) throw new Error('Please log in first to send a tuition inquiry.');
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inquiryPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send tuition inquiry');
      }
      return {
        ...data.inquiry,
        id: data.inquiry._id || data.inquiry.id,
        tutorId: data.inquiry.tutor?._id || data.inquiry.tutor || inquiryPayload.tutorId
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  inquiries: [],
  loading: false,
  error: null
};

export const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    clearInquiries: (state) => {
      state.inquiries = [];
    },
    sendInquiry: (state, action) => {
      const newInquiry = {
        id: action.payload._id || action.payload.id || `inq-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...action.payload,
        tutorId: action.payload.tutorId || action.payload.tutor?._id || action.payload.tutor
      };
      // Prevent duplicate if already present
      const exists = state.inquiries.some(i => (i.id && i.id === newInquiry.id) || (i._id && i._id === newInquiry.id));
      if (!exists) {
        state.inquiries.unshift(newInquiry);
      }
    },
    updateInquiryStatus: (state, action) => {
      const { inquiryId, status, responseNote } = action.payload;
      const inq = state.inquiries.find(i => i.id === inquiryId || i._id === inquiryId);
      if (inq) {
        inq.status = status; // 'accepted' | 'rejected'
        if (responseNote) inq.responseNote = responseNote;
        if (status === 'accepted') inq.acceptedAt = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyInquiries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyInquiries.fulfilled, (state, action) => {
        state.loading = false;
        // Strictly set real data returned from backend API (or empty array) - never show mock data
        state.inquiries = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.inquiries = [];
      })
      .addCase(respondToInquiry.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.inquiries.findIndex(i => i.id === updated.id || i._id === updated.id);
        if (index !== -1) {
          state.inquiries[index] = { ...state.inquiries[index], ...updated };
        } else {
          state.inquiries.unshift(updated);
        }
      })
      .addCase(sendInquiryAsync.fulfilled, (state, action) => {
        const newInquiry = action.payload;
        const exists = state.inquiries.some(i => (i.id && i.id === newInquiry.id) || (i._id && i._id === newInquiry.id));
        if (!exists) {
          state.inquiries.unshift(newInquiry);
        }
      })
      .addCase('auth/logout', (state) => {
        state.inquiries = [];
      });
  }
});

export const { sendInquiry, updateInquiryStatus, clearInquiries } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;

