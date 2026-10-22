import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tutorsReducer from './slices/tutorsSlice';
import inquiriesReducer from './slices/inquiriesSlice';
import filtersReducer from './slices/filtersSlice';
import adminMessagesReducer from './slices/adminMessagesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tutors: tutorsReducer,
    inquiries: inquiriesReducer,
    filters: filtersReducer,
    adminMessages: adminMessagesReducer,
    settings: settingsReducer,
  },
});

export default store;
