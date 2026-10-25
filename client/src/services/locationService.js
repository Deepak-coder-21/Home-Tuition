/**
 * Pure Postal & Official Indian Administrative Location Service
 * Powered by:
 * - Free India Post API (https://api.postalpincode.in)
 * - Open Indian Administrative District & Village Dataset
 * NO mockData used.
 */

// In-memory cache for fast responsive lookups
const memoryCache = {
  states: null,
  districtsByState: {},
  placesByDistrict: {},
  pincodeLookups: {}
};

const API_BASE = '/api/location';
const FALLBACK_API_BASE = 'http://localhost:5000/api/location';
const DIRECT_POSTAL_API = 'https://api.postalpincode.in';

/**
 * Helper to perform safe fetch with fallback to direct localhost:5000 if proxy isn't ready
 */
async function safeFetch(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (res.ok) return await res.json();
  } catch (err) {
    try {
      const fallbackRes = await fetch(`${FALLBACK_API_BASE}${endpoint}`);
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch {
      // Backend not reachable
    }
  }
  return null;
}

/**
 * Fetch all States and Union Territories of India from Postal / Location API
 */
export async function getLiveStates() {
  if (memoryCache.states && memoryCache.states.length > 0) {
    return memoryCache.states;
  }

  const json = await safeFetch('/states');
  if (json && json.success && Array.isArray(json.states) && json.states.length > 0) {
    memoryCache.states = json.states;
    return json.states;
  }

  // Direct fallback to open Indian administrative dataset if local server proxy is unreachable
  try {
    const res = await fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.states) && data.states.length > 0) {
        const states = data.states.map(s => s.state).filter(Boolean).sort((a, b) => a.localeCompare(b));
        memoryCache.states = states;
        return states;
      }
    }
  } catch {
    // ignore
  }

  return memoryCache.states || [];
}

/**
 * Fetch all Districts for a given State from Postal / Location API
 */
export async function getLiveDistricts(stateName) {
  if (!stateName) return [];

  const cacheKey = stateName.toLowerCase().trim();
  if (memoryCache.districtsByState[cacheKey]) {
    return memoryCache.districtsByState[cacheKey];
  }

  const json = await safeFetch(`/districts?state=${encodeURIComponent(stateName)}`);
  if (json && json.success && Array.isArray(json.districts) && json.districts.length > 0) {
    memoryCache.districtsByState[cacheKey] = json.districts;
    return json.districts;
  }

  return memoryCache.districtsByState[cacheKey] || [];
}

/**
 * Fetch real Post Offices, Villages, Towns, and Localities for a District using Postal API
 */
export async function getLivePlaces(districtName, stateName = '') {
  if (!districtName) return [];

  const districtKey = districtName.toLowerCase().trim();
  const stateKey = (stateName || '').toLowerCase().trim();
  const cacheKey = stateKey ? `${stateKey}_${districtKey}` : districtKey;

  if (memoryCache.placesByDistrict[cacheKey]) {
    return memoryCache.placesByDistrict[cacheKey].places;
  }
  if (!stateKey && memoryCache.placesByDistrict[districtKey]) {
    return memoryCache.placesByDistrict[districtKey].places;
  }

  // 1. First attempt through local API proxy
  const queryParams = new URLSearchParams({ district: districtName });
  if (stateName) queryParams.set('state', stateName);

  const json = await safeFetch(`/places?${queryParams.toString()}`);
  if (json && json.success && Array.isArray(json.places) && json.places.length > 0) {
    const entry = {
      places: json.places,
      isLive: true,
      count: json.places.length
    };
    memoryCache.placesByDistrict[cacheKey] = entry;
    memoryCache.placesByDistrict[districtKey] = entry;
    return json.places;
  }

  // 2. Direct Postal API query (https://api.postalpincode.in/postoffice/:district)
  try {
    const cleanDistrict = districtName
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/\b(District|City|Rural|Urban|NCT|UT)\b/gi, '')
      .trim();

    const postalRes = await fetch(`${DIRECT_POSTAL_API}/postoffice/${encodeURIComponent(cleanDistrict || districtName)}`);
    if (postalRes.ok) {
      const data = await postalRes.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
        const uniquePlaces = new Set();
        data[0].PostOffice.forEach(po => {
          if (po.Name) {
            const isVillage = po.BranchType === 'Branch Post Office';
            uniquePlaces.add(isVillage ? `${po.Name.trim()} (Village)` : po.Name.trim());
          }
        });
        const places = Array.from(uniquePlaces).sort((a, b) => a.localeCompare(b));
        if (places.length > 0) {
          const entry = { places, isLive: true, count: places.length };
          memoryCache.placesByDistrict[cacheKey] = entry;
          memoryCache.placesByDistrict[districtKey] = entry;
          return places;
        }
      }
    }
  } catch {
    // quiet fallback
  }

  return [];
}

/**
 * Lookup State, District & Postal Places by Indian 6-digit PIN code via India Post Postal API
 */
export async function lookupPincode(pincode) {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) return null;
  const pin = pincode.trim();

  if (memoryCache.pincodeLookups[pin]) {
    return memoryCache.pincodeLookups[pin];
  }

  // 1. Try via local server endpoint
  const json = await safeFetch(`/pincode/${pin}`);
  if (json && json.success && json.data) {
    memoryCache.pincodeLookups[pin] = json.data;
    return json.data;
  }

  // 2. Direct fallback to official India Post API (https://api.postalpincode.in/pincode/:pin)
  try {
    const res = await fetch(`${DIRECT_POSTAL_API}/pincode/${pin}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
        const offices = data[0].PostOffice;
        const first = offices[0];
        const result = {
          pincode: pin,
          district: first.District,
          state: first.State,
          division: first.Division,
          places: offices.map(o => ({
            name: o.Name,
            branchType: o.BranchType,
            deliveryStatus: o.DeliveryStatus
          }))
        };
        memoryCache.pincodeLookups[pin] = result;
        return result;
      }
    }
  } catch {
    // quiet fallback
  }

  return null;
}

/**
 * Synchronous getters for initial component render (cache-backed, no mock data)
 */
export function getInitialStates() {
  return memoryCache.states || [];
}

export function getInitialDistricts(stateName) {
  if (!stateName) return [];
  const cacheKey = stateName.toLowerCase().trim();
  return memoryCache.districtsByState[cacheKey] || [];
}

export function getInitialPlaces(districtName, stateName = '') {
  if (!districtName) return [];
  const districtKey = districtName.toLowerCase().trim();
  const stateKey = (stateName || '').toLowerCase().trim();
  const cacheKey = stateKey ? `${stateKey}_${districtKey}` : districtKey;

  if (memoryCache.placesByDistrict[cacheKey]) {
    return memoryCache.placesByDistrict[cacheKey].places;
  }
  if (memoryCache.placesByDistrict[districtKey]) {
    return memoryCache.placesByDistrict[districtKey].places;
  }
  return [];
}

/**
 * Match state name returned from Postal API to the available states dropdown options
 */
export function matchStateOption(postalState, availableStates = []) {
  if (!postalState) return '';
  const clean = postalState.toLowerCase().trim();
  if (!availableStates || availableStates.length === 0) return postalState;

  // 1. Exact match (case-insensitive)
  const exact = availableStates.find(s => s.toLowerCase().trim() === clean);
  if (exact) return exact;

  // 2. Special cases: Delhi (prefer "Delhi NCR" or "Delhi (NCT)")
  if (clean.includes('delhi')) {
    const delhiNcr = availableStates.find(s => s.toLowerCase().includes('delhi ncr'));
    if (delhiNcr) return delhiNcr;
    const delhiNct = availableStates.find(s => s.toLowerCase().includes('delhi'));
    if (delhiNct) return delhiNct;
  }

  // 3. Substring inclusion
  const sub = availableStates.find(s => {
    const sLow = s.toLowerCase().trim();
    return sLow === clean || sLow.includes(clean) || clean.includes(sLow);
  });
  if (sub) return sub;

  // 4. Jammu & Kashmir
  if (clean.includes('kashmir') || clean.includes('jammu')) {
    const jk = availableStates.find(s => s.toLowerCase().includes('jammu'));
    if (jk) return jk;
  }

  // 5. Pondicherry / Puducherry
  if (clean.includes('puducherry') || clean.includes('pondicherry')) {
    const pondy = availableStates.find(s => s.toLowerCase().includes('puducherry') || s.toLowerCase().includes('pondicherry'));
    if (pondy) return pondy;
  }

  // 6. Andaman & Nicobar
  if (clean.includes('andaman')) {
    const andaman = availableStates.find(s => s.toLowerCase().includes('andaman'));
    if (andaman) return andaman;
  }

  return postalState;
}

/**
 * Match district name returned from Postal API to the available districts dropdown options
 */
export function matchDistrictOption(postalDistrict, availableDistricts = []) {
  if (!postalDistrict) return '';
  if (!availableDistricts || availableDistricts.length === 0) return postalDistrict;

  const rawClean = postalDistrict.toLowerCase().trim();
  const clean = postalDistrict
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\b(district|city|rural|urban)\b/gi, '')
    .trim();

  // 1. Exact match (case-insensitive)
  const exact = availableDistricts.find(d => d.toLowerCase().trim() === rawClean);
  if (exact) return exact;

  // 2. Exact match on cleaned core name
  const cleanExact = availableDistricts.find(d => {
    const dClean = d
      .toLowerCase()
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/\b(district|city|rural|urban)\b/gi, '')
      .trim();
    return dClean === clean;
  });
  if (cleanExact) return cleanExact;

  // 3. Bangalore / Bengaluru
  if (clean.includes('bangalore') || clean.includes('bengaluru')) {
    const bUrban = availableDistricts.find(d => d.toLowerCase().includes('urban'));
    if (bUrban) return bUrban;
    const bMatch = availableDistricts.find(d => d.toLowerCase().includes('bengaluru') || d.toLowerCase().includes('bangalore'));
    if (bMatch) return bMatch;
  }

  // 4. Mumbai / Bombay
  if (clean.includes('mumbai') || clean.includes('bombay')) {
    const mSub = availableDistricts.find(d => d.toLowerCase().includes('mumbai suburban'));
    if (mSub) return mSub;
    const mCity = availableDistricts.find(d => d.toLowerCase().includes('mumbai city') || d.toLowerCase().includes('mumbai'));
    if (mCity) return mCity;
  }

  // 5. Delhi districts (e.g. Central Delhi, South Delhi, New Delhi)
  if (clean.includes('delhi')) {
    const dMatch = availableDistricts.find(d => {
      const dl = d.toLowerCase();
      return dl.includes(clean) || clean.includes(dl);
    });
    if (dMatch) return dMatch;
  }

  // 6. Substring inclusion
  const sub = availableDistricts.find(d => {
    const dLow = d.toLowerCase();
    return dLow.includes(clean) || clean.includes(dLow);
  });
  if (sub) return sub;

  return postalDistrict;
}

/**
 * Resolve full location from 6-digit PIN code with auto-matched state and district dropdown options
 */
export async function getPincodeLocation(pincode, availableStates = []) {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) return null;
  const pin = pincode.trim();

  const res = await lookupPincode(pin);
  if (!res || !res.state) return null;

  const states = (availableStates && availableStates.length > 0) ? availableStates : (await getLiveStates());
  const matchedState = matchStateOption(res.state, states);

  const districts = await getLiveDistricts(matchedState);
  const matchedDistrict = matchDistrictOption(res.district, districts);

  return {
    ...res,
    matchedState,
    matchedDistrict,
    districts
  };
}
