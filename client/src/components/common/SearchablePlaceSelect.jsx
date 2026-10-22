import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check, MapPin, Sparkles, Building2, Trees, Loader2 } from 'lucide-react';

/**
 * Modern Type-to-Search Combobox for Indian Villages, Towns, and Localities
 * Handles 100 to 1,000+ places with instant live filtering, village badges, and keyboard/mouse selection.
 */
export default function SearchablePlaceSelect({
  value = '',
  onChange,
  places = [],
  cityName = '',
  placeholder = 'Type to search village, town or locality...',
  isLoading = false,
  disabled = false,
  id = 'searchable-place-select',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize input text with external value when not actively typing in open dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(value || '');
    }
  }, [value, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);

  // Memoized filter for high performance even with 800+ places
  const filteredPlaces = useMemo(() => {
    if (!searchTerm.trim()) {
      return places.slice(0, 100); // Show top 100 initially for instant render
    }
    const term = searchTerm.toLowerCase().trim();
    const matches = places.filter(p => p.toLowerCase().includes(term));
    return matches.slice(0, 150); // Cap filtered list for ultra-fast DOM rendering
  }, [places, searchTerm]);

  const totalMatchesCount = useMemo(() => {
    if (!searchTerm.trim()) return places.length;
    const term = searchTerm.toLowerCase().trim();
    return places.filter(p => p.toLowerCase().includes(term)).length;
  }, [places, searchTerm]);

  const handleSelect = (place) => {
    onChange(place);
    setSearchTerm(place);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center w-full rounded-xl border bg-white transition shadow-2xs ${isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/20'
            : 'border-stone-300 hover:border-stone-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-stone-100' : ''}`}
      >
        <Search className="w-3.5 h-3.5 text-stone-400 ml-3 shrink-0" />

        <input
          id={id}
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={isLoading ? 'Loading postal places...' : placeholder}
          className="w-full text-xs py-2 pl-2 pr-14 text-stone-900 placeholder-stone-400 bg-transparent outline-none font-medium"
          autoComplete="off"
        />

        {/* Clear Button & Toggle Dropdown Arrow */}
        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700 mr-1 shrink-0" />
          )}

          {searchTerm && !disabled && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen && inputRef.current) inputRef.current.focus({ preventScroll: true });
              }
            }}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in-50 duration-150">

          {/* Header Bar with Count */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-stone-50 border-b border-stone-100 text-[10px] text-stone-500 font-semibold">
            <span>
              {searchTerm.trim()
                ? `${totalMatchesCount} result${totalMatchesCount === 1 ? '' : 's'} for "${searchTerm}"`
                : `${places.length} available places in ${cityName || 'District'}`}
            </span>
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              Type to filter
            </span>
          </div>

          {/* Option List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 text-xs">
            {/* "All Places in City" Option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-3 py-2 flex items-center justify-between transition hover:bg-brand-50/70 ${!value ? 'bg-brand-50 text-brand-900 font-bold' : 'text-stone-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>All Villages & Localities in {cityName || 'District'}</span>
              </div>
              {!value && <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />}
            </button>

            {/* Filtered Places */}
            {filteredPlaces.map((place) => {
              const isSelected = value === place;
              const isVillage = place.includes('(Village)');
              const cleanDisplayName = place.replace(/\s*\(Village\)/i, '');

              return (
                <button
                  type="button"
                  key={place}
                  onClick={() => handleSelect(place)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition hover:bg-stone-50 ${isSelected ? 'bg-brand-50 text-brand-900 font-bold' : 'text-stone-800'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {isVillage ? (
                      <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    )}
                    <span className="truncate">{cleanDisplayName}</span>
                    {isVillage && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-medium">
                        Village
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />}
                </button>
              );
            })}

            {/* No matches fallback */}
            {filteredPlaces.length === 0 && (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-stone-500">
                  No registered village/town matches "<strong>{searchTerm}</strong>".
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchTerm.trim())}
                    className="px-3 py-1.5 text-xs font-semibold text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 rounded-lg border border-terracotta-200 transition inline-flex items-center gap-1.5"
                  >
                    <span>Use custom place:</span>
                    <strong>"{searchTerm.trim()}"</strong>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer showing cap if over 150 */}
          {places.length > 150 && !searchTerm.trim() && (
            <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-500 text-center font-medium">
              Showing top 100 places. <strong>Type above to search all {places.length} places instantly.</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
