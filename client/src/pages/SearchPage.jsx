import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, resetFilters } from '../store/slices/filtersSlice';
import FilterSidebar from '../components/search/FilterSidebar';
import TutorCard from '../components/search/TutorCard';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  GraduationCap, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export default function SearchPage() {
  const dispatch = useDispatch();
  const { tutors } = useSelector((state) => state.tutors);
  const filters = useSelector((state) => state.filters);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter and Sort Logic
  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      // Exclude blocked / suspended tutors
      if (tutor.isBlocked) return false;

      // Free text search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = (tutor.name || '').toLowerCase().includes(query);
        const matchesSubject = (tutor.subjects || []).some(s => (s || '').toLowerCase().includes(query));
        const matchesCity = (tutor.location?.city || '').toLowerCase().includes(query);
        const matchesLocality = (tutor.location?.localities || []).some(l => (l || '').toLowerCase().includes(query));
        const matchesQual = (tutor.qualification || '').toLowerCase().includes(query);
        if (!matchesName && !matchesSubject && !matchesCity && !matchesLocality && !matchesQual) {
          return false;
        }
      }

      // State
      if (filters.selectedState) {
        const sel = filters.selectedState.toLowerCase().trim();
        const tutorState = (tutor.location?.state || '').toLowerCase().trim();
        const matchesState = tutorState === sel ||
          (sel.includes('delhi') && tutorState.includes('delhi')) ||
          tutorState.includes(sel) || sel.includes(tutorState);
        if (!matchesState) {
          return false;
        }
      }

      // City
      if (filters.selectedCity && tutor.location?.city !== filters.selectedCity) {
        return false;
      }

      // Locality / Village / Place (bidirectional matching for postal & village names)
      if (filters.selectedLocality) {
        const queryLoc = filters.selectedLocality.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
        const matchesLoc = (tutor.location?.localities || []).some(l => {
          const cleanL = (l || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
          return cleanL.includes(queryLoc) || queryLoc.includes(cleanL);
        });
        if (!matchesLoc) {
          return false;
        }
      }

      // 6-digit PIN Code Filter
      if (filters.pincode) {
        const pin = filters.pincode.trim();
        const matchesPin = tutor.location?.pincodes?.some(p => p?.includes(pin)) ||
                           tutor.location?.city?.toLowerCase().includes(pin);
        if (!matchesPin) {
          return false;
        }
      }

      // Subject
      if (filters.selectedSubject && !(tutor.subjects || []).includes(filters.selectedSubject)) {
        return false;
      }

      // Class / Grade
      if (filters.selectedClass && !(tutor.classes || []).includes(filters.selectedClass)) {
        return false;
      }

      // Board
      if (filters.selectedBoard && !(tutor.boards || []).includes(filters.selectedBoard)) {
        return false;
      }

      // Teaching Mode
      if (filters.selectedMode && !(tutor.modes || []).includes(filters.selectedMode)) {
        return false;
      }

      // Qualification
      if (filters.selectedQualification && !(tutor.qualification || '').toLowerCase().includes(filters.selectedQualification.toLowerCase().split(' ')[0])) {
        return false;
      }

      // Max Monthly Rate Filter
      if (filters.maxMonthlyRate) {
        const tutorMonthly = tutor.rates?.monthly || (tutor.rates?.hourly ? tutor.rates.hourly * 12 : 0);
        if (tutorMonthly > filters.maxMonthlyRate) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const getMonthly = (t) => t.rates?.monthly || (t.rates?.hourly ? t.rates.hourly * 12 : 0);
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (filters.sortBy === 'price_asc') return getMonthly(a) - getMonthly(b);
      if (filters.sortBy === 'price_desc') return getMonthly(b) - getMonthly(a);
      return 0;
    });
  }, [tutors, filters]);

  // Active filters list for chips
  const activeFilters = [];
  if (filters.selectedState) activeFilters.push({ label: filters.selectedState, key: 'selectedState' });
  if (filters.selectedCity) activeFilters.push({ label: filters.selectedCity, key: 'selectedCity' });
  if (filters.selectedLocality) activeFilters.push({ label: `Place: ${filters.selectedLocality}`, key: 'selectedLocality' });
  if (filters.pincode) activeFilters.push({ label: `PIN: ${filters.pincode}`, key: 'pincode' });
  if (filters.selectedSubject) activeFilters.push({ label: filters.selectedSubject, key: 'selectedSubject' });
  if (filters.selectedClass) activeFilters.push({ label: filters.selectedClass, key: 'selectedClass' });
  if (filters.selectedBoard) activeFilters.push({ label: filters.selectedBoard, key: 'selectedBoard' });
  if (filters.selectedMode) activeFilters.push({ label: filters.selectedMode.replace('_', ' '), key: 'selectedMode' });
  if (filters.selectedQualification) activeFilters.push({ label: filters.selectedQualification, key: 'selectedQualification' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Verified Home & Online Mentors
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Discover Qualified Tutors Near You
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm">
            Compare educator degrees, monthly package rates, and real student feedback. Book free introductory consultations.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => dispatch(setFilter({ key: 'searchQuery', value: e.target.value }))}
              placeholder="Search by tutor name, subject (e.g. Physics), locality (e.g. Bandra, South Ext), or qualification..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white text-stone-900 placeholder-stone-400 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => dispatch(setFilter({ key: 'searchQuery', value: '' }))}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-brand-800 text-amber-200 text-xs font-bold rounded-xl border border-brand-700 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({activeFilters.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stationary Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar - Stationary, never jumps up or down */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar />
        </div>

        {/* Results Area with stable min-height */}
        <div className="lg:col-span-3 space-y-5 min-h-[850px]" style={{ overflowAnchor: 'none' }}>
          
          {/* Results Header: Found Count, Active Chips, & Sort Dropdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-bold text-stone-800">
                Found <span className="text-brand-900 font-extrabold">{filteredTutors.length}</span> Verified Tutors
              </span>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                  Sort by:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => dispatch(setFilter({ key: 'sortBy', value: e.target.value }))}
                  className="text-xs font-bold text-stone-800 bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-200 outline-none focus:border-brand-700"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Years of Experience</option>
                  <option value="price_asc">Monthly Fee: Low to High</option>
                  <option value="price_desc">Monthly Fee: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips (placed here so they never shift Refine Search!) */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 mr-1">Active filters:</span>
                {activeFilters.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-900 border border-brand-200 text-xs font-semibold"
                  >
                    <span className="capitalize">{f.label}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(setFilter({ key: f.key, value: '' }))}
                      className="hover:text-terracotta-700 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => dispatch(resetFilters())}
                  className="text-xs text-stone-500 hover:text-stone-800 underline ml-2 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {filteredTutors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm min-h-[450px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-warm-100 text-stone-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">No tutors match these filters</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                Try widening your budget, selecting another subject, or choosing "All Cities" to view tutors available for online 1-on-1 sessions.
              </p>
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTutors.map((tutor) => (
                <TutorCard key={tutor.id || tutor._id} tutor={tutor} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">Search Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <FilterSidebar isMobileModal={true} onClose={() => setMobileFilterOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
