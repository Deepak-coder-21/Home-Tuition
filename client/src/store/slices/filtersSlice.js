import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  selectedState: '',
  selectedCity: '',
  selectedLocality: '',
  pincode: '',
  selectedSubject: '',
  selectedClass: '',
  selectedBoard: '',
  selectedMode: '',
  selectedQualification: '',
  maxHourlyRate: 1500,
  maxMonthlyRate: 18000,
  sortBy: 'rating', // 'rating' | 'experience' | 'price_asc' | 'price_desc'
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedState = '';
      state.selectedCity = '';
      state.selectedLocality = '';
      state.pincode = '';
      state.selectedSubject = '';
      state.selectedClass = '';
      state.selectedBoard = '';
      state.selectedMode = '';
      state.selectedQualification = '';
      state.maxHourlyRate = 1500;
      state.maxMonthlyRate = 18000;
      state.sortBy = 'rating';
    }
  }
});

export const { setFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
