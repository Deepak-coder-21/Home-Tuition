import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, resetFilters } from '../../store/slices/filtersSlice';
import { useLocationData } from '../../hooks/useLocationData';
import { lookupPincode, getPincodeLocation } from '../../services/locationService';
import { 
  SUBJECTS_LIST, 
  CLASSES_LIST, 
  BOARDS_LIST, 
  TEACHING_MODES, 
  QUALIFICATIONS_LIST 
} from '../../data/mockData';
import { Filter, RotateCcw, MapPin, BookOpen, IndianRupee, Award, Layers, Home, Sparkles, Loader2, X, Search } from 'lucide-react';
import SearchablePlaceSelect from '../common/SearchablePlaceSelect';

export default function FilterSidebar({ isMobileModal = false, onClose = null }) {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);

  const { 
    states, 
    districts, 
    places, 
    isLoadingDistricts, 
    isLoadingPlaces 
  } = useLocationData(filters.selectedState, filters.selectedCity);

  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinFeedback, setPinFeedback] = useState('');

  const handlePincodeSearch = async (pin) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    dispatch(setFilter({ key: 'pincode', value: cleaned }));

    if (cleaned.length === 6) {
      setIsLookingUpPin(true);
      const loc = await getPincodeLocation(cleaned, states);
      setIsLookingUpPin(false);
      if (loc && loc.matchedState) {
        dispatch(setFilter({ key: 'selectedState', value: loc.matchedState }));
        if (loc.matchedDistrict) {
          dispatch(setFilter({ key: 'selectedCity', value: loc.matchedDistrict }));
        }
        dispatch(setFilter({ key: 'selectedLocality', value: '' }));
        setPinFeedback(`${loc.matchedDistrict || loc.district}, ${loc.matchedState || loc.state}`);
      } else {
        setPinFeedback('No postal records found');
      }
    } else {
      setPinFeedback('');
    }
  };

  const handleStateChange = (state) => {
    dispatch(setFilter({ key: 'selectedState', value: state }));
    dispatch(setFilter({ key: 'selectedCity', value: '' }));
    dispatch(setFilter({ key: 'selectedLocality', value: '' }));
  };

  const handleCityChange = (city) => {
    dispatch(setFilter({ key: 'selectedCity', value: city }));
    dispatch(setFilter({ key: 'selectedLocality', value: '' }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 text-stone-900 font-bold">
          <Filter className="w-4 h-4 text-brand-700" />
          <h3 className="text-base font-serif">Refine Search</h3>
        </div>
        <button
          type="button"
          onClick={() => dispatch(resetFilters())}
          className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* State & City Location */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            Location (State & District)
          </label>
        </div>

        {/* 6-Digit PIN Code Quick Search */}
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
              <Search className="w-3 h-3 text-terracotta-600" />
              PIN Code Search:
            </span>
            {filters.pincode && (
              <button
                type="button"
                onClick={() => {
                  dispatch(setFilter({ key: 'pincode', value: '' }));
                  setPinFeedback('');
                }}
                className="text-[10px] text-terracotta-600 hover:underline font-semibold"
              >
                Clear PIN
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={filters.pincode || ''}
              onChange={(e) => handlePincodeSearch(e.target.value)}
              placeholder="Enter 6-digit PIN (e.g. 110001, 560034)..."
              className="w-full text-xs py-2 pl-3 pr-8 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-white placeholder-stone-400 font-medium tracking-wide"
            />
            {isLookingUpPin ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700 absolute right-2.5 top-2.5" />
            ) : filters.pincode ? (
              <button
                type="button"
                onClick={() => {
                  dispatch(setFilter({ key: 'pincode', value: '' }));
                  setPinFeedback('');
                }}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>
          <div className="text-[10px] min-h-[16px] flex items-center px-1">
            {pinFeedback ? (
              <span className="text-emerald-700 font-semibold">✓ {pinFeedback}</span>
            ) : (
              <span className="text-stone-400">Auto-detects State & District</span>
            )}
          </div>
        </div>
        
        {/* State select */}
        <select
          value={filters.selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
        >
          <option value="">All States & UTs of India ({states.length})</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {/* City / District select */}
        <div className="relative">
          <select
            value={filters.selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={isLoadingDistricts}
            className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50 disabled:opacity-60"
          >
            <option value="">
              {filters.selectedState 
                ? (isLoadingDistricts ? 'Loading official districts...' : `All Districts in ${filters.selectedState} (${districts.length})`) 
                : 'Choose a State first for districts'}
            </option>
            {districts.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {isLoadingDistricts && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700 absolute right-8 top-2.5" />
          )}
        </div>

        {/* Village / Place / Locality select - always present to prevent layout shift */}
        <div className="pt-1.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span className="flex items-center gap-1">
              <Home className="w-3 h-3 text-terracotta-600" />
              Village / Town / Locality:
            </span>
            {filters.selectedLocality && (
              <button
                type="button"
                onClick={() => dispatch(setFilter({ key: 'selectedLocality', value: '' }))}
                className="text-[10px] text-terracotta-600 hover:underline"
              >
                Clear Place
              </button>
            )}
          </div>

          <SearchablePlaceSelect
            value={filters.selectedLocality}
            onChange={(val) => dispatch(setFilter({ key: 'selectedLocality', value: val }))}
            places={places}
            cityName={filters.selectedCity}
            placeholder={
              !filters.selectedCity
                ? 'Select a District above first...'
                : isLoadingPlaces
                ? `Loading ${filters.selectedCity} places...`
                : `Type to search in ${filters.selectedCity} (${places.length} places)...`
            }
            isLoading={isLoadingPlaces}
            disabled={!filters.selectedCity}
            id="filter-village-locality-search"
          />
          <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 min-h-[16px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              {filters.selectedCity 
                ? (isLoadingPlaces ? 'Loading verified localities...' : `${places.length} verified places • Type to search`)
                : 'Verified postal directory'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Teaching Mode */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Teaching Mode
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => dispatch(setFilter({ key: 'selectedMode', value: '' }))}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
              filters.selectedMode === ''
                ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            Any Mode
          </button>
          {TEACHING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => dispatch(setFilter({ key: 'selectedMode', value: mode.id }))}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                filters.selectedMode === mode.id
                  ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-stone-400" />
          Subject
        </label>
        <select
          value={filters.selectedSubject}
          onChange={(e) => dispatch(setFilter({ key: 'selectedSubject', value: e.target.value }))}
          className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
        >
          <option value="">All Subjects</option>
          {SUBJECTS_LIST.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Class / Grade */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-stone-400" />
          Class / Grade
        </label>
        <select
          value={filters.selectedClass}
          onChange={(e) => dispatch(setFilter({ key: 'selectedClass', value: e.target.value }))}
          className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
        >
          <option value="">All Classes</option>
          {CLASSES_LIST.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Board */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Curriculum / Board
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BOARDS_LIST.map((board) => {
            const isSelected = filters.selectedBoard === board;
            return (
              <button
                key={board}
                type="button"
                onClick={() => dispatch(setFilter({ 
                  key: 'selectedBoard', 
                  value: isSelected ? '' : board 
                }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isSelected 
                    ? 'bg-brand-800 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {board}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Budget Range (Highlighted) */}
      <div className="space-y-2 pt-2 border-t border-stone-100 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
          <span className="flex items-center gap-1 font-bold text-amber-900">
            <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
            Max Monthly Budget
          </span>
          <span className="font-extrabold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded text-xs">
            ₹{(filters.maxMonthlyRate || 18000).toLocaleString('en-IN')}/mo
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="25000"
          step="500"
          value={filters.maxMonthlyRate || 18000}
          onChange={(e) => {
            const val = Number(e.target.value);
            dispatch(setFilter({ key: 'maxMonthlyRate', value: val }));
            dispatch(setFilter({ key: 'maxHourlyRate', value: Math.round(val / 12) }));
          }}
          className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
        />
        <div className="flex justify-between text-[10px] text-amber-900/70 font-medium">
          <span>₹1,000</span>
          <span>₹13,000</span>
          <span>₹25,000+</span>
        </div>
        <div className="text-[10px] text-stone-500 text-right">
          Approx. ~₹{Math.round((filters.maxMonthlyRate || 18000) / 12)}/hour
        </div>
      </div>

      {/* Qualification Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-stone-400" />
          Tutor Qualification
        </label>
        <select
          value={filters.selectedQualification}
          onChange={(e) => dispatch(setFilter({ key: 'selectedQualification', value: e.target.value }))}
          className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:border-brand-700 outline-none bg-stone-50/50"
        >
          <option value="">Any Qualification</option>
          {QUALIFICATIONS_LIST.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      {isMobileModal && onClose && (
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-brand-800 text-white text-xs font-bold rounded-xl shadow mt-4"
        >
          Apply Filters
        </button>
      )}

    </div>
  );
}
