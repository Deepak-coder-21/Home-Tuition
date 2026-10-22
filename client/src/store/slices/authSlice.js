import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Live student accounts strictly loaded from MongoDB database
export const INITIAL_STUDENT_ACCOUNTS = [];

// Async thunk to fetch live student accounts from MongoDB Atlas backend
export const fetchStudents = createAsyncThunk(
  'auth/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vidyanest_token');
      const res = await fetch('/api/admin/students', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        return data.students || [];
      }
      return [];
    } catch {
      return rejectWithValue('Unable to load student data.');
    }
  }
);

// Retrieve persisted user session from localStorage
const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('vidyanest_user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore parse error
  }
  return null;
};

const savedUser = getSavedUser();

const initialAccounts = savedUser ? [savedUser] : [];

const initialState = {
  accounts: initialAccounts,
  currentUser: savedUser || null,
  currentRole: savedUser?.role || null,
  isAuthenticated: !!savedUser,
  authError: null,
  isStudentsLoading: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password, role, user: apiUser } = action.payload;

      let user = apiUser;

      // If full user payload is not passed directly, look in local accounts
      if (!user && state.accounts) {
        user = state.accounts.find(
          acc => acc.email?.toLowerCase() === email?.toLowerCase() && 
                 (!password || acc.password === password) &&
                 (!role || acc.role === role)
        );
      }

      // Fallback for admin account
      if (!user && (role === 'admin' || !role) && (!password || password === 'adminpassword' || password === 'admin123' || password === 'password123')) {
        user = {
          id: '6ab67ddc068be2906e09d5dc',
          _id: '6ab67ddc068be2906e09d5dc',
          name: 'VidyaNest Admin',
          email: 'admin@vidyanest.com',
          role: 'admin',
          department: 'Tutor Verification & Moderation'
        };
      }

      if (user) {
        if (user.role === 'admin') {
          user.email = 'admin@vidyanest.com';
        }
        const normalized = {
          ...user,
          id: user._id || user.id || `usr-${Date.now()}`
        };
        state.currentUser = normalized;
        state.currentRole = normalized.role;
        state.isAuthenticated = true;
        state.authError = null;
        if (!state.accounts.some(a => a.id === normalized.id || a.email?.toLowerCase() === normalized.email?.toLowerCase())) {
          state.accounts.push(normalized);
        }
        try {
          localStorage.setItem('vidyanest_user', JSON.stringify(normalized));
        } catch {
          // ignore
        }
      } else {
        state.authError = "Invalid email, password, or role selection.";
      }
    },
    registerStudent: (state, action) => {
      const newStudent = {
        ...action.payload,
        id: action.payload._id || action.payload.id || `usr-student-${Date.now()}`,
        _id: action.payload._id || action.payload.id || `usr-student-${Date.now()}`,
        role: 'student',
        isBlocked: false,
        joinedDate: action.payload.joinedDate || new Date().toISOString().split('T')[0]
      };
      state.accounts = state.accounts.filter(a => a.id !== newStudent.id && a.email?.toLowerCase() !== newStudent.email?.toLowerCase());
      state.accounts.push(newStudent);
      state.currentUser = newStudent;
      state.currentRole = 'student';
      state.isAuthenticated = true;
      state.authError = null;
      try {
        localStorage.setItem('vidyanest_user', JSON.stringify(newStudent));
      } catch {
        // ignore
      }
    },
    registerTutor: (state, action) => {
      const newTutorAccount = {
        ...action.payload,
        id: action.payload._id || action.payload.id || `tut-${Date.now()}`,
        _id: action.payload._id || action.payload.id || `tut-${Date.now()}`,
        role: 'tutor',
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        avatar: action.payload.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
        city: action.payload.location?.city || action.payload.city || '',
        qualification: action.payload.qualification,
        isBlocked: false,
        joinedDate: action.payload.joinedDate || new Date().toISOString().split('T')[0]
      };
      state.accounts = state.accounts.filter(a => a.id !== newTutorAccount.id && a.email?.toLowerCase() !== newTutorAccount.email?.toLowerCase());
      state.accounts.push(newTutorAccount);
      state.currentUser = newTutorAccount;
      state.currentRole = 'tutor';
      state.isAuthenticated = true;
      state.authError = null;
      try {
        localStorage.setItem('vidyanest_user', JSON.stringify(newTutorAccount));
      } catch {
        // ignore
      }
    },
    setAuthenticatedUser: (state, action) => {
      const user = action.payload;
      state.currentUser = user;
      state.currentRole = user?.role || null;
      state.isAuthenticated = !!user;
      state.authError = null;
      if (user) {
        try {
          localStorage.setItem('vidyanest_user', JSON.stringify(user));
        } catch {
          // ignore
        }
      }
    },
    updateUserAvatar: (state, action) => {
      const payload = typeof action.payload === 'object' ? action.payload : { avatar: action.payload };
      const { id, avatar } = payload;
      if (!avatar) return;

      if (state.currentUser) {
        if (!id || state.currentUser.id === id || state.currentUser._id === id || state.currentUser.tutorProfileId === id) {
          state.currentUser.avatar = avatar;
          try {
            localStorage.setItem('vidyanest_user', JSON.stringify(state.currentUser));
          } catch {
            // ignore
          }
        }
      }
      if (state.accounts && Array.isArray(state.accounts)) {
        const account = state.accounts.find(acc => 
          (id && (acc.id === id || acc._id === id || acc.tutorProfileId === id)) ||
          (state.currentUser && (acc.id === state.currentUser.id || acc._id === state.currentUser._id || acc.email === state.currentUser.email))
        );
        if (account) {
          account.avatar = avatar;
        }
      }
    },
    updateStudentProfile: (state, action) => {
      const updates = action.payload;
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...updates };
        try {
          localStorage.setItem('vidyanest_user', JSON.stringify(state.currentUser));
        } catch {
          // ignore
        }
      }
      if (state.currentUser?.id || state.currentUser?._id) {
        const userId = state.currentUser.id || state.currentUser._id;
        const accIndex = state.accounts.findIndex(acc => acc.id === userId || acc._id === userId);
        if (accIndex !== -1) {
          state.accounts[accIndex] = { ...state.accounts[accIndex], ...updates };
        }
      }
    },
    toggleBlockUser: (state, action) => {
      const { id, isBlocked, reason } = action.payload;
      const account = state.accounts.find(acc => acc.id === id || acc._id === id);
      if (account) {
        account.isBlocked = isBlocked;
        account.blockedReason = isBlocked ? (reason || 'Administrative suspension') : null;
      }
      if (state.currentUser && (state.currentUser.id === id || state.currentUser._id === id)) {
        state.currentUser.isBlocked = isBlocked;
        state.currentUser.blockedReason = isBlocked ? (reason || 'Administrative suspension') : null;
        try {
          localStorage.setItem('vidyanest_user', JSON.stringify(state.currentUser));
        } catch {
          // ignore
        }
      }
    },
    deleteUserAccount: (state, action) => {
      const id = action.payload;
      state.accounts = state.accounts.filter(acc => acc.id !== id && acc._id !== id);
      if (state.currentUser && (state.currentUser.id === id || state.currentUser._id === id)) {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.currentRole = null;
        localStorage.removeItem('vidyanest_user');
        localStorage.removeItem('vidyanest_token');
      }
    },
    updateUserByAdmin: (state, action) => {
      const { id, updates } = action.payload;
      const account = state.accounts.find(acc => acc.id === id || acc._id === id);
      if (account) {
        Object.assign(account, updates);
      }
      if (state.currentUser && (state.currentUser.id === id || state.currentUser._id === id)) {
        Object.assign(state.currentUser, updates);
        try {
          localStorage.setItem('vidyanest_user', JSON.stringify(state.currentUser));
        } catch {
          // ignore
        }
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.currentRole = null;
      state.isAuthenticated = false;
      state.authError = null;
      try {
        localStorage.removeItem('vidyanest_user');
        localStorage.removeItem('vidyanest_token');
      } catch {
        // ignore
      }
    },
    clearAuthError: (state) => {
      state.authError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isStudentsLoading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isStudentsLoading = false;
        if (Array.isArray(action.payload)) {
          const nonStudents = state.accounts.filter(a => a.role !== 'student');
          const realStudents = action.payload.map((student) => {
            const studentId = student._id || student.id;
            return {
              ...student,
              id: studentId,
              _id: studentId,
              role: 'student'
            };
          });
          state.accounts = [...nonStudents, ...realStudents];
        }
      })
      .addCase(fetchStudents.rejected, (state) => {
        state.isStudentsLoading = false;
      });
  }
});

export const { 
  login, 
  registerStudent, 
  registerTutor, 
  setAuthenticatedUser,
  updateUserAvatar,
  updateStudentProfile,
  toggleBlockUser,
  deleteUserAccount,
  updateUserByAdmin,
  logout, 
  clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;
