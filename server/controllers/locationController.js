// Location Controller for Indian States, Districts, Villages, Towns & Places
// Powered by the Open Indian Administrative & India Post Pincode Dataset
// Covers all 36 States/UTs, 750+ Districts, and 150,000+ Real Villages & Localities

const PINCODE_API_BASE = 'https://aniket-thapa.github.io/india-pincode-api';

const placesCache = new Map();
let openStatesDistrictsMapCache = null;
let pincodeStatesListCache = null;
const stateDistrictsCache = new Map();

// Helper to normalize and slugify names (e.g. "New Delhi" -> "new-delhi")
function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Minimal offline fallback for primary hub regions
const FALLBACK_STATES_DISTRICTS = {
  "Delhi NCR": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi",
    "Noida", "Greater Noida", "Gurugram", "Faridabad", "Ghaziabad"
  ],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Chhatrapati Sambhajinagar", "Kolhapur"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi"],
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Varanasi", "Prayagraj", "Agra", "Meerut", "Gorakhpur", "Bareilly", "Aligarh", "Noida", "Ghaziabad"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"]
};

// Fetch official States & Districts index dynamically
async function getStatesAndDistrictsMap() {
  if (openStatesDistrictsMapCache) return openStatesDistrictsMapCache;

  try {
    const res = await fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json', {
      headers: { 'User-Agent': 'VidyaNest-Location-Service/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.states) && data.states.length > 0) {
        const map = { ...FALLBACK_STATES_DISTRICTS };
        data.states.forEach(s => {
          if (s.state && Array.isArray(s.districts)) {
            map[s.state] = s.districts;
          }
        });
        openStatesDistrictsMapCache = map;
        return map;
      }
    }
  } catch (err) {
    console.warn('External states API fetch failed, using fallback:', err.message);
  }

  openStatesDistrictsMapCache = FALLBACK_STATES_DISTRICTS;
  return FALLBACK_STATES_DISTRICTS;
}

// Fetch list of states and slugs from India Pincode API
async function getPincodeStates() {
  if (pincodeStatesListCache) return pincodeStatesListCache;
  try {
    const res = await fetch(`${PINCODE_API_BASE}/states.json`);
    if (res.ok) {
      pincodeStatesListCache = await res.json();
      return pincodeStatesListCache;
    }
  } catch (err) {
    console.warn('Failed to fetch pincode states list:', err.message);
  }
  return [];
}

// Fetch districts for a specific state from India Pincode API
async function getStateDistricts(stateSlug) {
  if (stateDistrictsCache.has(stateSlug)) {
    return stateDistrictsCache.get(stateSlug);
  }
  try {
    const res = await fetch(`${PINCODE_API_BASE}/states/${stateSlug}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.districts)) {
        stateDistrictsCache.set(stateSlug, data.districts);
        return data.districts;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch districts for state ${stateSlug}:`, err.message);
  }
  return [];
}

// Resolve state slug matching various aliases (e.g. "Delhi NCR" -> "delhi")
function resolveStateSlug(stateName, statesList) {
  if (!stateName) return null;
  const clean = stateName.toLowerCase().trim();
  const directSlug = slugify(clean.replace(/\b(ncr|ut|state)\b/gi, ''));

  const directMatch = statesList.find(s => s.slug === directSlug || s.slug === slugify(stateName));
  if (directMatch) return directMatch.slug;

  const nameMatch = statesList.find(s => {
    const sName = s.name.toLowerCase();
    return sName === clean || sName.includes(clean) || clean.includes(sName);
  });
  if (nameMatch) return nameMatch.slug;

  return directSlug;
}

// Resolve district slug matching various forms (e.g. "Central Delhi" -> "central")
function resolveDistrictSlug(districtName, districtsList) {
  if (!districtName || !districtsList?.length) return null;
  const cleanName = districtName.toLowerCase().replace(/\b(district|city|rural|urban)\b/gi, '').trim();
  const dSlug = slugify(cleanName);

  const exact = districtsList.find(d => d.slug === dSlug || d.slug === slugify(districtName));
  if (exact) return exact.slug;

  const matched = districtsList.find(d => {
    const dLower = d.name.toLowerCase();
    return dLower === cleanName || dLower.includes(cleanName) || cleanName.includes(dLower);
  });
  if (matched) return matched.slug;

  return dSlug;
}

// Lookup state from district when state is omitted
function findStateForDistrict(districtName, stateMap) {
  if (!districtName || !stateMap) return null;
  const dClean = districtName.toLowerCase().trim();
  for (const [state, districts] of Object.entries(stateMap)) {
    const found = districts.find(d => {
      const dL = d.toLowerCase();
      return dL === dClean || dL.includes(dClean) || dClean.includes(dL);
    });
    if (found) return state;
  }
  return null;
}

// @desc    Get all Indian States & Union Territories
// @route   GET /api/location/states
export const getStates = async (req, res) => {
  try {
    const map = await getStatesAndDistrictsMap();
    const states = Object.keys(map).sort((a, b) => a.localeCompare(b));
    res.json({
      success: true,
      count: states.length,
      states
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to retrieve state list.' });
  }
};

// @desc    Get all Districts for a specific State
// @route   GET /api/location/districts?state=...
export const getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    const map = await getStatesAndDistrictsMap();

    if (!state) {
      return res.json({
        success: true,
        data: map
      });
    }

    const matchedStateKey = Object.keys(map).find(
      s => s.toLowerCase() === state.trim().toLowerCase() ||
           s.toLowerCase().includes(state.trim().toLowerCase()) ||
           state.trim().toLowerCase().includes(s.toLowerCase())
    );

    const districts = matchedStateKey ? map[matchedStateKey] : [];
    res.json({
      success: true,
      state: matchedStateKey || state,
      count: districts.length,
      districts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to retrieve district list.' });
  }
};

// @desc    Get live Villages, Towns, Branch Post Offices & Places for any District or City
// @route   GET /api/location/places?district=...&state=...
export const getPlaces = async (req, res) => {
  try {
    const district = (req.query.district || req.query.city || req.query.query || '').trim();
    let state = (req.query.state || '').trim();

    if (!district) {
      return res.status(400).json({ success: false, message: 'Please provide district or city parameter' });
    }

    const cacheKey = `${state.toLowerCase()}_${district.toLowerCase()}`;
    if (placesCache.has(cacheKey)) {
      const cached = placesCache.get(cacheKey);
      return res.json({
        success: true,
        source: 'cache',
        district,
        state,
        count: cached.length,
        places: cached
      });
    }

    // If state wasn't explicitly passed, infer it from the states-districts map
    if (!state) {
      const map = await getStatesAndDistrictsMap();
      state = findStateForDistrict(district, map) || '';
    }

    let places = [];

    // 1. PRIMARY SOURCE: Comprehensive India Pincode Open Dataset (150,000+ real villages/towns)
    try {
      const statesList = await getPincodeStates();
      const stateSlug = resolveStateSlug(state, statesList);

      if (stateSlug) {
        const districtsList = await getStateDistricts(stateSlug);
        const districtSlug = resolveDistrictSlug(district, districtsList);

        if (districtSlug) {
          const targetUrl = `${PINCODE_API_BASE}/districts/${stateSlug}/${districtSlug}.json`;
          const response = await fetch(targetUrl);
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.offices) && data.offices.length > 0) {
              const uniquePlaces = new Set();

              data.offices.forEach(o => {
                if (!o.officeName) return;
                const cleanName = o.officeName
                  .replace(/\s+(BO|SO|HO|B\.O|S\.O|H\.O)$/i, '')
                  .replace(/\s+(Branch Post Office|Sub Post Office|Head Post Office)$/i, '')
                  .trim();

                if (!cleanName) return;

                // Identify Branch Post Offices as rural villages
                const isVillage = o.officeType === 'BO' || /\b(b\.?o\.?|branch)\b/i.test(o.officeName);
                const formatted = isVillage ? `${cleanName} (Village)` : cleanName;
                uniquePlaces.add(formatted);
              });

              places = Array.from(uniquePlaces).sort((a, b) => a.localeCompare(b));
            }
          }
        }
      }
    } catch (primaryErr) {
      console.warn(`Primary Pincode API error for ${district}:`, primaryErr.message);
    }

    // 2. SECONDARY FALLBACK: India Post Office Search (api.postalpincode.in)
    if (places.length === 0) {
      try {
        const cleanSearchTerm = district
          .replace(/\s*\(.*?\)\s*/g, '')
          .replace(/\b(District|City|Rural|Urban|NCT|UT)\b/gi, '')
          .trim();

        const postalUrl = `https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanSearchTerm || district)}`;
        const response = await fetch(postalUrl, {
          headers: { 'User-Agent': 'VidyaNest-Postal-Lookup/1.0' }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
            const rawOffices = data[0].PostOffice;
            const uniquePlaces = new Set();

            rawOffices.forEach(po => {
              if (po.Name) {
                const name = po.Name.trim();
                const type = po.BranchType === 'Branch Post Office' ? '(Village)' : '';
                uniquePlaces.add(type ? `${name} ${type}` : name);
              }
            });

            places = Array.from(uniquePlaces).sort((a, b) => a.localeCompare(b));
          }
        }
      } catch (secErr) {
        console.warn(`Secondary postal API error for ${district}:`, secErr.message);
      }
    }

    // Cache results
    placesCache.set(cacheKey, places);

    res.json({
      success: true,
      source: 'live_api',
      district,
      state,
      count: places.length,
      places
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to retrieve places.' });
  }
};

// @desc    Lookup State, District and Places by 6-digit Indian PIN code
// @route   GET /api/location/pincode/:pincode
export const lookupPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit Indian PIN code required' });
    }

    const pin = pincode.trim();
    const cacheKey = `pin_${pin}`;
    if (placesCache.has(cacheKey)) {
      return res.json({ success: true, source: 'cache', data: placesCache.get(cacheKey) });
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      headers: { 'User-Agent': 'VidyaNest-Postal-Lookup/1.0' }
    });

    if (response.ok) {
      const data = await response.json();
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
        placesCache.set(cacheKey, result);
        return res.json({ success: true, source: 'live_api', data: result });
      }
    }

    res.status(404).json({ success: false, message: `No postal records found for PIN code ${pin}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to lookup postal records.' });
  }
};

