import { createSlice } from '@reduxjs/toolkit';

const initialMessages = [
  {
    id: 'msg-1',
    title: 'Platform Maintenance Schedule',
    message: 'VidyaNest systems will undergo routine performance optimization this Sunday from 2:00 AM to 4:00 AM IST. All student inquiries and messaging will remain unaffected.',
    target: 'all', // 'all' | 'students' | 'tutors' | 'user'
    targetId: null,
    targetName: 'All Platform Users',
    type: 'info', // 'alert' | 'warning' | 'info' | 'success'
    createdAt: '2026-09-18',
    sender: 'Platform Administration',
    isDismissible: true
  },
  {
    id: 'msg-2',
    title: 'Doorstep Academic Safety Guidelines',
    message: 'Educators and parents are reminded to hold initial sessions in common household living areas. Please report any conduct or scheduling concerns directly to the compliance desk.',
    target: 'all',
    targetId: null,
    targetName: 'All Platform Users',
    type: 'warning',
    createdAt: '2026-09-17',
    sender: 'Trust & Safety Council',
    isDismissible: true
  },
  {
    id: 'msg-3',
    title: 'Monthly Progress Reviews & Ratings Open',
    message: 'Parents and learners can now submit their monthly teacher feedback for active tutors to help maintain verified quality benchmarks.',
    target: 'students',
    targetId: null,
    targetName: 'All Students & Parents',
    type: 'success',
    createdAt: '2026-09-16',
    sender: 'Academic Operations',
    isDismissible: true
  },
  {
    id: 'msg-4',
    title: 'Degree & Certification Verification Notice',
    message: 'Tutors with pending badge verification must ensure their degree certificate transcripts and government photo IDs are legible.',
    target: 'tutors',
    targetId: null,
    targetName: 'All Tutors & Educators',
    type: 'alert',
    createdAt: '2026-09-15',
    sender: 'Educator Credential Audit Team',
    isDismissible: true
  }
];

export const adminMessagesSlice = createSlice({
  name: 'adminMessages',
  initialState: {
    messages: initialMessages,
    dismissedIds: []
  },
  reducers: {
    addAdminMessage: (state, action) => {
      const newMessage = {
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        sender: 'VidyaNest Administration',
        isDismissible: true,
        ...action.payload
      };
      state.messages.unshift(newMessage);
    },
    deleteAdminMessage: (state, action) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    dismissAdminMessage: (state, action) => {
      if (!state.dismissedIds.includes(action.payload)) {
        state.dismissedIds.push(action.payload);
      }
    }
  }
});

export const { addAdminMessage, deleteAdminMessage, dismissAdminMessage } = adminMessagesSlice.actions;
export default adminMessagesSlice.reducer;
